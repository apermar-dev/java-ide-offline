#!/usr/bin/env python3
"""
=============================================================================
IntelliJ Offline IDE - Micro-Server Local para Safe Exam Browser (SEB)
=============================================================================
Servidor HTTP ligero basado exclusivamente en la librería estándar de Python.
Soporta proyectos multi-archivo (múltiples clases .java compiladas juntas).

Funcionalidades:
1. Sirve la aplicación web localmente en http://localhost:8080/
2. Endpoints REST (/api/compile, /api/run, /api/zip) para compilar,
   ejecutar y descargar proyectos con múltiples archivos .java.
=============================================================================
"""

import http.server
import io
import json
import os
import shutil
import socketserver
import subprocess
import sys
import tempfile
import zipfile

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_jdk_version():
    """Detecta la versión de javac instalada en la máquina."""
    try:
        res = subprocess.run(['javac', '-version'], capture_output=True, text=True, timeout=3)
        return res.stdout.strip() or res.stderr.strip()
    except Exception:
        return None

class IdeRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        if self.path == '/api/status':
            jdk_ver = get_jdk_version()
            response_data = {
                "status": "ok",
                "jdk": jdk_ver is not None,
                "version": jdk_ver if jdk_ver else "No detectado"
            }
            self.send_json_response(200, response_data)
            return

        # Servir archivos estáticos normales
        super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body.decode('utf-8'))
        except Exception:
            self.send_json_response(400, {"error": "JSON no válido"})
            return

        if self.path == '/api/compile':
            self.handle_compile(payload)
        elif self.path == '/api/run':
            self.handle_run(payload)
        elif self.path == '/api/zip':
            self.handle_zip(payload)
        else:
            self.send_json_response(404, {"error": "Ruta no encontrada"})

    def _write_project_files(self, temp_dir, data):
        """Escribe todos los archivos del proyecto en temp_dir."""
        files = data.get('files')
        if files and isinstance(files, dict):
            for filename, content in files.items():
                safe_name = os.path.basename(filename)
                if safe_name.endswith('.java'):
                    with open(os.path.join(temp_dir, safe_name), 'w', encoding='utf-8') as f:
                        f.write(content)
        else:
            class_name = data.get('className', 'Main').strip()
            if not class_name.isidentifier():
                class_name = 'Main'
            code = data.get('code', '')
            with open(os.path.join(temp_dir, f"{class_name}.java"), 'w', encoding='utf-8') as f:
                f.write(code)

    def handle_compile(self, data):
        temp_dir = tempfile.mkdtemp(prefix='java_ide_')

        try:
            self._write_project_files(temp_dir, data)
            java_files = [f for f in os.listdir(temp_dir) if f.endswith('.java')]

            if not java_files:
                self.send_json_response(200, {
                    "success": False,
                    "output": "Error: No se encontraron archivos .java para compilar."
                })
                return

            # Ejecutar javac con todos los archivos .java del proyecto
            proc = subprocess.run(
                ['javac', '-encoding', 'UTF-8'] + java_files,
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=12
            )

            output = (proc.stderr or proc.stdout or "").replace(temp_dir + os.sep, '')
            self.send_json_response(200, {
                "success": proc.returncode == 0,
                "exitCode": proc.returncode,
                "output": output,
                "compiledFiles": java_files
            })
        except subprocess.TimeoutExpired:
            self.send_json_response(200, {
                "success": False,
                "output": "Error: Tiempo de compilación excedido (Timeout 12s)"
            })
        except Exception as e:
            self.send_json_response(500, {
                "success": False,
                "output": f"Error del sistema: {str(e)}"
            })
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    def handle_run(self, data):
        user_input = data.get('input', '')
        temp_dir = tempfile.mkdtemp(prefix='java_ide_')

        try:
            self._write_project_files(temp_dir, data)
            java_files = [f for f in os.listdir(temp_dir) if f.endswith('.java')]

            if not java_files:
                self.send_json_response(200, {
                    "success": False,
                    "stdout": "",
                    "stderr": "Error: No hay archivos .java para ejecutar."
                })
                return

            # 1. Compilación de todos los archivos del proyecto juntos
            compile_proc = subprocess.run(
                ['javac', '-encoding', 'UTF-8'] + java_files,
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=12
            )

            if compile_proc.returncode != 0:
                err_out = (compile_proc.stderr or compile_proc.stdout).replace(temp_dir + os.sep, '')
                self.send_json_response(200, {
                    "success": False,
                    "exitCode": compile_proc.returncode,
                    "stdout": "",
                    "stderr": f"Error de compilación:\n{err_out}"
                })
                return

            # 2. Determinar la clase que contiene el método main()
            target_class = data.get('className', '').strip()
            files_dict = data.get('files')

            if files_dict and isinstance(files_dict, dict):
                active_file = f"{target_class}.java"
                if active_file in files_dict and 'public static void main' in files_dict[active_file]:
                    # La clase seleccionada actualmente tiene main(), ejecutarla preferentemente
                    pass
                else:
                    found_main = None
                    for fname, fcode in files_dict.items():
                        if 'public static void main' in fcode:
                            found_main = fname.replace('.java', '')
                            break
                    if found_main:
                        target_class = found_main

            if not target_class or not target_class.isidentifier():
                target_class = 'Main'

            # 3. Ejecución con límite de tiempo
            run_proc = subprocess.run(
                ['java', '-Dfile.encoding=UTF-8', target_class],
                cwd=temp_dir,
                input=user_input,
                capture_output=True,
                text=True,
                timeout=6
            )

            self.send_json_response(200, {
                "success": run_proc.returncode == 0,
                "exitCode": run_proc.returncode,
                "stdout": run_proc.stdout,
                "stderr": run_proc.stderr,
                "executedClass": target_class
            })

        except subprocess.TimeoutExpired:
            self.send_json_response(200, {
                "success": False,
                "exitCode": 124,
                "stdout": "",
                "stderr": "Error: Tiempo de ejecución excedido (Timeout 6 segundos). Comprueba si hay un bucle infinito o Scanner pendiente de entrada."
            })
        except Exception as e:
            self.send_json_response(500, {
                "success": False,
                "stderr": f"Error al ejecutar: {str(e)}"
            })
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    def handle_zip(self, data):
        """Genera un archivo ZIP con todos los ficheros .java del proyecto."""
        files = data.get('files', {})
        zip_buffer = io.BytesIO()

        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for fname, content in files.items():
                safe_name = os.path.basename(fname)
                if safe_name.endswith('.java'):
                    zip_file.writestr(safe_name, content)

        zip_bytes = zip_buffer.getvalue()
        self.send_response(200)
        self.send_header('Content-Type', 'application/zip')
        self.send_header('Content-Disposition', 'attachment; filename="Proyecto_Java.zip"')
        self.send_header('Content-Length', str(len(zip_bytes)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(zip_bytes)

    def send_json_response(self, code, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

def main():
    jdk = get_jdk_version()
    print("=" * 65)
    print(" ☕ IntelliJ IDEA Offline Server (Safe Exam Browser Edition)")
    print("=" * 65)
    print(f" ▸ Directorio base : {BASE_DIR}")
    print(f" ▸ Compilador JDK  : {jdk if jdk else '❌ No encontrado en PATH (Solo análisis JS)'}")
    print(f" ▸ URL Local       : http://localhost:{PORT}/")
    print(f" ▸ Soporte Multi   : Compilación simultánea de múltiples .java")
    print("=" * 65)
    print("Presiona Ctrl+C para detener el servidor.\n")

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), IdeRequestHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nDeteniendo servidor...")
            httpd.server_close()

if __name__ == '__main__':
    main()
