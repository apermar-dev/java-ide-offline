#!/usr/bin/env python3
"""
=============================================================================
IntelliJ Offline IDE - Micro-Server Local para Safe Exam Browser (SEB)
=============================================================================
Servidor HTTP ligero basado exclusivamente en la librería estándar de Python.
No requiere dependencias externas (pip).

Funcionalidades:
1. Sirve la aplicación web localmente en http://localhost:8080/
2. Proporciona endpoints REST (/api/compile y /api/run) para compilar y
   ejecutar código con el compilador real 'javac' y máquina virtual 'java'.
=============================================================================
"""

import http.server
import json
import os
import shutil
import socketserver
import subprocess
import sys
import tempfile

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
        else:
            self.send_json_response(404, {"error": "Ruta no encontrada"})

    def handle_compile(self, data):
        class_name = data.get('className', 'Main').strip()
        code = data.get('code', '')

        # Validar nombre de clase básico para evitar inyecciones de ruta
        if not class_name.isidentifier():
            class_name = 'Main'

        temp_dir = tempfile.mkdtemp(prefix='java_ide_')
        java_file_path = os.path.join(temp_dir, f"{class_name}.java")

        try:
            with open(java_file_path, 'w', encoding='utf-8') as f:
                f.write(code)

            # Ejecutar javac
            proc = subprocess.run(
                ['javac', '-encoding', 'UTF-8', f"{class_name}.java"],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=10
            )

            output = (proc.stderr or proc.stdout or "").replace(temp_dir + os.sep, '')
            self.send_json_response(200, {
                "success": proc.returncode == 0,
                "exitCode": proc.returncode,
                "output": output
            })
        except subprocess.TimeoutExpired:
            self.send_json_response(200, {
                "success": False,
                "output": "Error: Tiempo de compilación excedido (Timeout 10s)"
            })
        except Exception as e:
            self.send_json_response(500, {
                "success": False,
                "output": f"Error del sistema: {str(e)}"
            })
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

    def handle_run(self, data):
        class_name = data.get('className', 'Main').strip()
        code = data.get('code', '')
        user_input = data.get('input', '')

        if not class_name.isidentifier():
            class_name = 'Main'

        temp_dir = tempfile.mkdtemp(prefix='java_ide_')
        java_file_path = os.path.join(temp_dir, f"{class_name}.java")

        try:
            with open(java_file_path, 'w', encoding='utf-8') as f:
                f.write(code)

            # 1. Compilación
            compile_proc = subprocess.run(
                ['javac', '-encoding', 'UTF-8', f"{class_name}.java"],
                cwd=temp_dir,
                capture_output=True,
                text=True,
                timeout=10
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

            # 2. Ejecución con límite de tiempo contra bucles infinitos
            run_proc = subprocess.run(
                ['java', '-Dfile.encoding=UTF-8', class_name],
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
                "stderr": run_proc.stderr
            })

        except subprocess.TimeoutExpired:
            self.send_json_response(200, {
                "success": False,
                "exitCode": 124,
                "stdout": "",
                "stderr": "Error: Tiempo de ejecución excedido (Timeout 6 segundos). Comprueba si hay un bucle infinito."
            })
        except Exception as e:
            self.send_json_response(500, {
                "success": False,
                "stderr": f"Error al ejecutar: {str(e)}"
            })
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

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
    print(f" ▸ Modo Offline    : 100% Autónomo sin dependencias externas")
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
