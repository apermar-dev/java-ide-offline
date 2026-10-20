# IntelliJ IDEA - Offline Java IDE (Safe Exam Browser Edition)

Un entorno de desarrollo Java local, ligero y con estética **IntelliJ IDEA (Darcula)**, diseñado específicamente para funcionar de manera **100% autónoma y offline** dentro de entornos vigilados y bloqueados como **Safe Exam Browser (SEB)**.

---

## 🚀 Características Principales

1. **100% Offline y Autónomo (Zero-Network):**
   - Sin llamadas a CDNs ni APIs externas.
   - Fuentes tipográficas oficiales (**JetBrains Mono**) y librerías (**CodeMirror 5**) totalmente empaquetadas en local dentro de `vendor/`.
   - Funciona abriendo directamente `index.html` mediante protocolo `file:///` o a través de `http://localhost:8080`.

2. **Experiencia de Edición IntelliJ IDEA:**
   - Tema oscuro fiel a **IntelliJ Darcula** (colores de sintaxis, barra de estado, estructura de proyecto y barra de pestañas).
   - Resaltado de sintaxis Java preciso.
   - Numeración de líneas, plegado de código (*code folding*) y coincidencia visual de llaves/paréntesis.
   - Sangría automática de 4 espacios (tabulación estándar de Java).
   - Atajo de formateo de código: <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>L</kbd>.

3. **Snippets Esenciales de IntelliJ:**
   - `psvm` + <kbd>Tab</kbd> → Expande automáticamente a `public static void main(String[] args) { ... }`.
   - `sout` + <kbd>Tab</kbd> → Expande a `System.out.println();` con el cursor dentro de los paréntesis.
   - `serr` + <kbd>Tab</kbd> → Expande a `System.err.println();`.
   - `fori` + <kbd>Tab</kbd> → Genera estructura `for (int i = 0; i < ; i++) { ... }`.
   - `ifelse` + <kbd>Tab</kbd> → Genera bloque `if (...) { ... } else { ... }`.
   - `trycatch` + <kbd>Tab</kbd> → Genera bloque de captura de excepciones.
   - `scanner` + <kbd>Tab</kbd> → Genera inicialización de `Scanner scanner = new Scanner(System.in);`.

4. **Autocompletado Rápido (<kbd>Ctrl</kbd> + <kbd>Espacio</kbd>):**
   - Sugerencias visuales distinguiendo palabras clave (`[keyword]`), tipos de datos (`[class]`), métodos comunes (`[method]`) y plantillas (`[snippet]`).

5. **Detección de Errores y Compilación (2 Modalidades Adaptadas a SEB):**
   - **Modalidad 1 (100% Navegador / Sin Servidor):**
     - Analizador léxico y sintáctico en JavaScript en tiempo de ejecución.
     - Detecta llaves o paréntesis sin cerrar, comillas de texto incompletas en la línea, olvido de puntos y coma (`;`), clases públicas múltiples, errores en la firma del método `main`, clases comunes sin importar (`Scanner`, `ArrayList`), etc.
     - Marca visualmente la línea afectada en el gutter (`●` rojo / `▲` amarillo) y subraya la zona errónea.
     - Pestaña inferior **Problems** donde hacer clic sobre cualquier error posiciona el cursor en la línea correspondiente.
   - **Modalidad 2 (Micro-servidor Local con JDK Real):**
     - Si la configuración de SEB permite peticiones a `localhost`, el archivo `server.py` proporciona compilación real con `javac` y ejecución en vivo con `java` (incluye protección contra bucles infinitos por timeout).

6. **Exportación y Descarga Inteligente:**
   - Botón **"Descargar .java"** (<kbd>Ctrl</kbd> + <kbd>S</kbd>).
   - Analiza el código para detectar el nombre de la clase pública (`public class Calculadora` → descarga `Calculadora.java`).
   - Guardado automático continuo en `localStorage` del navegador para evitar pérdida de datos ante recargas accidentales.

---

## 📁 Estructura del Proyecto

```text
~/Documents/cositas/java-ide-offline/
├── index.html                   # Interfaz semántica con barra de herramientas, editor y consola
├── style.css                    # Estilos visuales exactos IntelliJ IDEA Darcula
├── app.js                       # Motor del editor, snippets, analizador sintáctico y exportador
├── server.py                    # Micro-servidor Python estándar (opcional para javac/java real)
├── start_server.sh              # Lanzador en un clic del servidor local (Linux/Unix)
├── start_mac.sh                 # Lanzador automático todo-en-uno para macOS (Servidor + ngrok)
├── download_dependencies.sh     # Script para descargar/reponer dependencias vendor si se requiere
├── README.md                    # Documentación y guía de preparación
└── vendor/                      # Activos 100% offline (sin dependencias externas)
    ├── codemirror/              # Motor CodeMirror 5, modo Java (clike), addons y temas
    └── fonts/                   # Tipografía JetBrains Mono en formato WOFF2
```

---

## 🛠️ Guía de Preparación e Inicialización

### Opción A: Modo 100% Offline (Directo en el Navegador / SEB)
Este modo es ideal si Safe Exam Browser tiene bloqueadas todas las conexiones de red (incluyendo `localhost`):

1. Abre el navegador o configura Safe Exam Browser para abrir el archivo local:
   ```bash
   # En Linux:
   xdg-open ~/Documents/cositas/java-ide-offline/index.html

   # O ruta absoluta en Safe Exam Browser:
   file:///home/arbarito/Documents/cositas/java-ide-offline/index.html
   ```
2. La aplicación funcionará de inmediato con el indicador `🔵 100% Offline (SEB)`.
3. El alumno dispondrá de resaltado sintáctico, snippets, autocompletado, detección de errores en cliente y descarga del fichero `.java`.

---

### Opción B: Modo con Compilador Real JDK (`javac` / `java`)
Si la configuración de SEB permite navegar contra `http://localhost`:

1. Abre una terminal antes de iniciar SEB y ejecuta:
   ```bash
   cd ~/Documents/cositas/java-ide-offline/
   ./start_server.sh
   # O alternativamente: python3 server.py
   ```
2. Configura la URL de inicio de Safe Exam Browser a:
   ```text
   http://localhost:8080/
   ```
3. El editor detectará automáticamente el servidor y mostrará la insignia `🟢 Localhost JDK (javac 27)`.
4. El botón **"Ejecutar"** (<kbd>Shift</kbd> + <kbd>F10</kbd>) compilará con `javac` y mostrará la salida del programa en la pestaña **Terminal / Salida**.

---

### Opción C: Modo macOS con túnel ngrok integrado (Pruebas Remotas)
Para ejecutar en un Mac y compartir el entorno instantáneamente a otros equipos:

1. Asegúrate de tener `ngrok` instalado en tu Mac (`brew install ngrok`) y con tu token añadido (`ngrok config add-authtoken <TOKEN>`).
2. Ejecuta el script integrado:
   ```bash
   ./start_mac.sh
   ```
3. El script levantará el servidor local, abrirá el túnel público de `ngrok` y mostrará las URLs directamente en la terminal. Al pulsar <kbd>Ctrl</kbd> + <kbd>C</kbd>, ambos procesos se cerrarán automáticamente.

---

## ⌨️ Tabla de Atajos y Snippets

| Atajo / Snippet | Acción | Resultado |
|---|---|---|
| `psvm` + <kbd>Tab</kbd> | Generar método principal | `public static void main(String[] args) { ... }` |
| `sout` + <kbd>Tab</kbd> | Imprimir por consola | `System.out.println();` *(cursor dentro de paréntesis)* |
| `serr` + <kbd>Tab</kbd> | Imprimir por error | `System.err.println();` |
| `fori` + <kbd>Tab</kbd> | Bucle for estándar | `for (int i = 0; i < ; i++) { ... }` |
| `ifelse` + <kbd>Tab</kbd> | Condicional if-else | `if (...) { ... } else { ... }` |
| `trycatch` + <kbd>Tab</kbd> | Captura de excepciones | `try { ... } catch (Exception e) { ... }` |
| `scanner` + <kbd>Tab</kbd> | Instanciar Scanner | `Scanner scanner = new Scanner(System.in);` |
| <kbd>Ctrl</kbd> + <kbd>Espacio</kbd> | Autocompletado manual | Despliega sugerencias filtradas de Java |
| <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>L</kbd> | Formatear código | Re-indenta el código a bloques de 4 espacios |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | Descargar archivo | Genera y descarga automáticamente `<NombreClase>.java` |
| <kbd>F9</kbd> | Compilar / Analizar | Ejecuta análisis sintáctico y actualiza la pestaña *Problems* |
| <kbd>Shift</kbd> + <kbd>F10</kbd> | Ejecutar programa | Ejecuta en terminal (si el JDK local está disponible) |
