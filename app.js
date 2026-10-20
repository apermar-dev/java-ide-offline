/**
 * ============================================================================
 * IntelliJ IDEA Offline Java IDE - Logic & Assistant Engine
 * Multi-file Project & Template Customization Edition
 * 100% Standalone / SEB (Safe Exam Browser) Compatible
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Initial Default Templates (PSPRO - 3 Ejercicios) ---
  const PSPRO_INIT_KEY = 'java_offline_pspro_v3_setup';

  const EJERCICIO_1_TEMPLATE = `import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.IOException;

/**
 * =========================================================================
 * EJERCICIO 1 (PSPRO - Unidad 2: Creación y Control de Subprocesos)
 * =========================================================================
 * OBJETIVO:
 * Lanzar un subproceso del sistema operativo mediante ProcessBuilder,
 * capturar su salida estándar línea a línea y controlar su código de retorno.
 *
 * REQUISITOS:
 * 1. Configura un comando del sistema (ej: "pwd" o "ls -la" en Linux/macOS, "dir" en Windows).
 * 2. Inicia el subproceso con start() y muestra su PID con process.pid().
 * 3. Lee con BufferedReader todo el flujo de salida y muéstralo por pantalla.
 * 4. Espera su terminación con waitFor() y verifica si el exit code fue 0.
 * =========================================================================
 */
public class Ejercicio1 {
    public static void main(String[] args) {
        System.out.println("=== PSPRO: Ejercicio 1 - ProcessBuilder y ProcessHandle ===");

        // Detectar si el sistema operativo es Windows o Unix/Linux/macOS
        boolean isWindows = System.getProperty("os.name").toLowerCase().contains("win");
        String[] comando = isWindows 
            ? new String[]{"cmd.exe", "/c", "dir"} 
            : new String[]{"pwd"};

        System.out.println("Comando configurado: " + String.join(" ", comando));

        try {
            // 1. Crear el constructor del proceso
            ProcessBuilder pb = new ProcessBuilder(comando);

            // 2. Iniciar el subproceso
            Process subproceso = pb.start();
            long pid = subproceso.pid(); // API ProcessHandle (Java 9+)
            System.out.println("[INFO] Subproceso lanzado con PID: " + pid);

            // 3. Capturar y leer la salida estándar del subproceso
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(subproceso.getInputStream()))) {
                String linea;
                System.out.println("\n--- SALIDA DEL SUBPROCESO ---");
                while ((linea = reader.readLine()) != null) {
                    System.out.println(">> " + linea);
                }
            }

            // 4. Esperar la finalización del subproceso
            int exitCode = subproceso.waitFor();
            System.out.println("-----------------------------");
            System.out.println("[FIN] El subproceso finalizó con código: " + exitCode);

            if (exitCode == 0) {
                System.out.println("✔ Subproceso ejecutado con éxito.");
            } else {
                System.err.println("❌ El subproceso terminó con errores.");
            }

        } catch (IOException e) {
            System.err.println("Error de E/S al lanzar el subproceso: " + e.getMessage());
        } catch (InterruptedException e) {
            System.err.println("El subproceso fue interrumpido: " + e.getMessage());
            Thread.currentThread().interrupt();
        }
    }
}
`;

  const EJERCICIO_2_CODE = `/**
 * =========================================================================
 * EJERCICIO 2 (PSPRO - Unidad 3 y 4: Concurrencia, Hilos y Sincronización)
 * =========================================================================
 * OBJETIVO:
 * Simular el acceso concurrente de múltiples cajeros a una cuenta bancaria
 * compartida. Proteger la sección crítica con el modificador 'synchronized'
 * para evitar condiciones de carrera (Race Conditions).
 *
 * REQUISITOS:
 * 1. Crea una clase CuentaBancaria con método sincronizado 'ingresar(int cantidad)'.
 * 2. Lanza 5 hilos trabajadores (Cajeros) que hagan 1000 ingresos de 1€ cada uno.
 * 3. Usa join() en el hilo principal para esperar a que todos los cajeros terminen.
 * 4. Comprueba que el saldo final sea exactamente 5000€.
 * =========================================================================
 */
public class Ejercicio2 {

    // Recurso compartido con sección crítica sincronizada
    static class CuentaBancaria {
        private int saldo = 0;

        // Método sincronizado para proteger el acceso concurrente
        public synchronized void ingresar(int cantidad) {
            // Sección crítica protegida con cerrojo intrínseco
            this.saldo += cantidad;
        }

        public int getSaldo() {
            return saldo;
        }
    }

    // Tarea concurrente ejecutada por cada hilo
    static class Cajero implements Runnable {
        private final CuentaBancaria cuenta;
        private final String nombre;

        public Cajero(CuentaBancaria cuenta, String nombre) {
            this.cuenta = cuenta;
            this.nombre = nombre;
        }

        @Override
        public void run() {
            for (int i = 0; i < 1000; i++) {
                cuenta.ingresar(1);
            }
            System.out.println("[OK] " + nombre + " completó sus 1000 operaciones.");
        }
    }

    public static void main(String[] args) {
        System.out.println("=== PSPRO: Ejercicio 2 - Hilos y Bloques Sincronizados ===");

        CuentaBancaria cuentaCompartida = new CuentaBancaria();
        int NUM_CAJEROS = 5;
        Thread[] hilos = new Thread[NUM_CAJEROS];

        // 1. Crear y arrancar los hilos concurrentes
        for (int i = 0; i < NUM_CAJEROS; i++) {
            hilos[i] = new Thread(new Cajero(cuentaCompartida, "Cajero-" + (i + 1)));
            hilos[i].start();
        }

        // 2. Esperar a que todos los hilos finalicen usando join()
        try {
            for (int i = 0; i < NUM_CAJEROS; i++) {
                hilos[i].join();
            }
        } catch (InterruptedException e) {
            System.err.println("Hilo principal interrumpido: " + e.getMessage());
            Thread.currentThread().interrupt();
        }

        // 3. Verificación de exclusión mutua
        int saldoFinal = cuentaCompartida.getSaldo();
        int saldoEsperado = NUM_CAJEROS * 1000;
        System.out.println("\n-------------------------------------------");
        System.out.println("Saldo final obtenido : " + saldoFinal + " €");
        System.out.println("Saldo final esperado : " + saldoEsperado + " €");

        if (saldoFinal == saldoEsperado) {
            System.out.println("✔ EXCELENTE: Sección crítica protegida con synchronized. Cero condiciones de carrera.");
        } else {
            System.err.println("❌ ERROR: Condición de carrera detectada. Falta sincronización.");
        }
    }
}
`;

  const EJERCICIO_3_CODE = `import java.util.concurrent.Semaphore;
import java.util.Random;

/**
 * =========================================================================
 * EJERCICIO 3 (PSPRO - Unidad 4: Control de Concurrencia con Semáforos)
 * =========================================================================
 * OBJETIVO:
 * Gestionar el acceso a un recurso limitado (un túnel de lavado con solo 2
 * plazas disponibles para 6 vehículos) utilizando un Semáforo de Dijkstra (Semaphore).
 *
 * REQUISITOS:
 * 1. Crea un Semaphore con 2 permisos y política equitativa FIFO (fairness = true).
 * 2. Lanza 6 hilos concurrentes representando vehículos.
 * 3. Cada vehículo debe solicitar permiso con acquire() antes de entrar a lavar.
 * 4. Simula la duración del lavado con Thread.sleep(...).
 * 5. Libera el permiso en un bloque finally con release() para evitar bloqueos permanentes.
 * =========================================================================
 */
public class Ejercicio3 {

    static class TunelLavado {
        // Semáforo con 2 plazas disponibles y política equitativa FIFO (fairness = true)
        private final Semaphore plazas = new Semaphore(2, true);
        private final Random random = new Random();

        public void lavarVehiculo(String vehiculoId) {
            System.out.println("🚗 " + vehiculoId + " llega y ESPERA plaza... (Libres: " + plazas.availablePermits() + ")");
            try {
                // Adquirir un permiso (bloqueante si no hay permisos disponibles)
                plazas.acquire();

                System.out.println("  ✨ [ENTRA] " + vehiculoId + " a lavar. Plazas restantes: " + plazas.availablePermits());

                // Simular tiempo de lavado (entre 300 y 700 ms)
                int duracion = 300 + random.nextInt(400);
                Thread.sleep(duracion);

                System.out.println("  ✅ [TERMINA] " + vehiculoId + " lavado en " + duracion + " ms.");

            } catch (InterruptedException e) {
                System.err.println(vehiculoId + " fue interrumpido.");
                Thread.currentThread().interrupt();
            } finally {
                // MUY IMPORTANTE EN PSPRO: Liberar siempre en bloque finally
                plazas.release();
                System.out.println("  🚪 [SALE] " + vehiculoId + " sale. Plazas disponibles: " + plazas.availablePermits());
            }
        }
    }

    public static void main(String[] args) {
        System.out.println("=== PSPRO: Ejercicio 3 - Exclusión Mutua Múltiple (Semaphore) ===");

        TunelLavado lavadero = new TunelLavado();
        int TOTAL_COCHES = 6;
        Thread[] coches = new Thread[TOTAL_COCHES];

        for (int i = 0; i < TOTAL_COCHES; i++) {
            final String matricula = "Coche-" + (i + 1);
            coches[i] = new Thread(() -> lavadero.lavarVehiculo(matricula));
            coches[i].start();
        }

        // Esperar a que todos los vehículos terminen su ciclo
        for (Thread coche : coches) {
            try {
                coche.join();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }

        System.out.println("\n✔ Jornada del lavadero completada. Todos los vehículos fueron atendidos correctamente.");
    }
}
`;

  function getDefaultPsproFiles() {
    return {
      'Ejercicio1.java': EJERCICIO_1_TEMPLATE,
      'Ejercicio2.java': EJERCICIO_2_CODE,
      'Ejercicio3.java': EJERCICIO_3_CODE
    };
  }

  const SNIPPETS = {
    psvm: {
      template: 'public static void main(String[] args) {\n    \n}',
      cursorOffset: 38
    },
    sout: {
      template: 'System.out.println();',
      cursorOffset: 19
    },
    serr: {
      template: 'System.err.println();',
      cursorOffset: 19
    },
    fori: {
      template: 'for (int i = 0; i < ; i++) {\n    \n}',
      cursorOffset: 20
    },
    fore: {
      template: 'for (Object item : list) {\n    \n}',
      cursorOffset: 16
    },
    ifelse: {
      template: 'if () {\n    \n} else {\n    \n}',
      cursorOffset: 4
    },
    trycatch: {
      template: 'try {\n    \n} catch (Exception e) {\n    e.printStackTrace();\n}',
      cursorOffset: 10
    },
    scanner: {
      template: 'Scanner scanner = new Scanner(System.in);',
      cursorOffset: 41
    }
  };

  const JAVA_KEYWORDS = [
    'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
    'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final',
    'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int',
    'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public',
    'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
    'throw', 'throws', 'transient', 'try', 'var', 'void', 'volatile', 'while', 'record'
  ];

  const JAVA_TYPES = [
    'String', 'Integer', 'Double', 'Float', 'Boolean', 'Character', 'Long', 'Short', 'Byte',
    'Scanner', 'List', 'ArrayList', 'Map', 'HashMap', 'Set', 'HashSet', 'LinkedList',
    'Arrays', 'Collections', 'Math', 'System', 'StringBuilder', 'StringBuffer', 'Exception',
    'Objects', 'Optional', 'File', 'Path', 'Paths', 'Files', 'PrintStream', 'Comparable'
  ];

  const JAVA_COMMON_METHODS = [
    'System.out.println', 'System.out.print', 'System.out.printf',
    'scanner.nextLine()', 'scanner.nextInt()', 'scanner.nextDouble()', 'scanner.hasNext()',
    'list.add()', 'list.get()', 'list.size()', 'list.remove()', 'list.contains()',
    'map.put()', 'map.get()', 'map.containsKey()', 'map.keySet()', 'map.values()',
    'Math.max()', 'Math.min()', 'Math.abs()', 'Math.sqrt()', 'Math.pow()',
    'String.valueOf()', 'equals()', 'equalsIgnoreCase()', 'length()', 'substring()',
    'indexOf()', 'split()', 'trim()', 'toLowerCase()', 'toUpperCase()'
  ];

  // --- Project State ---
  let projectFiles = getDefaultPsproFiles();
  let activeFileName = 'Ejercicio1.java';
  let customMainTemplate = EJERCICIO_1_TEMPLATE;

  let editor = null;
  let activeMarkers = [];
  let isBackendConnected = false;
  let autosaveTimeout = null;
  let isSwitchingFile = false;

  // --- DOM Elements ---
  const dom = {
    editorContainer: document.getElementById('code-editor'),
    tabsList: document.getElementById('editor-tabs-list'),
    treeFilesContainer: document.getElementById('tree-files-container'),
    breadcrumbFilename: document.getElementById('breadcrumb-filename'),
    autosaveStatus: document.getElementById('autosave-status'),
    backendStatusBadge: document.getElementById('backend-status-badge'),
    statusbarMessage: document.getElementById('statusbar-message'),
    statusbarCursor: document.getElementById('statusbar-cursor'),
    problemsCountBadge: document.getElementById('problems-count'),
    problemsPanel: document.getElementById('problems-view'),
    problemsList: document.getElementById('problems-list'),
    problemsEmpty: document.getElementById('problems-empty'),
    outputPanel: document.getElementById('output-view'),
    consoleOutput: document.getElementById('console-output'),
    snippetsPanel: document.getElementById('snippets-view'),
    panelTabs: document.querySelectorAll('.panel-tab'),
    bottomPanel: document.getElementById('bottom-panel'),
    resizer: document.getElementById('panel-resizer'),
    btnCompile: document.getElementById('btn-compile'),
    btnRun: document.getElementById('btn-run'),
    btnDownload: document.getElementById('btn-download'),
    btnDownloadText: document.getElementById('btn-download-text'),
    btnDownloadToggle: document.getElementById('btn-download-menu-toggle'),
    downloadMenu: document.getElementById('download-menu'),
    menuDownloadActive: document.getElementById('menu-download-active'),
    menuDownloadAll: document.getElementById('menu-download-all'),
    btnFormat: document.getElementById('btn-format'),
    btnAddFileSidebar: document.getElementById('btn-add-file-sidebar'),
    btnAddFileTab: document.getElementById('btn-add-file-tab'),
    btnEditTemplate: document.getElementById('btn-edit-template'),
    btnReset: document.getElementById('btn-reset'),
    btnClearConsole: document.getElementById('btn-clear-console'),
    btnTogglePanel: document.getElementById('btn-toggle-panel'),
    btnFontDec: document.getElementById('btn-font-dec'),
    btnFontInc: document.getElementById('btn-font-inc'),
    sidebar: document.getElementById('project-sidebar'),
    sidebarToggle: document.getElementById('btn-toggle-sidebar'),

    // Modals
    modalNewFile: document.getElementById('modal-new-file'),
    inputNewFilename: document.getElementById('input-new-filename'),
    btnConfirmNewFile: document.getElementById('btn-confirm-new-file'),

    modalTemplate: document.getElementById('modal-template'),
    textareaTemplate: document.getElementById('textarea-template'),
    btnSaveTemplate: document.getElementById('btn-save-template'),
    btnResetTemplateDefault: document.getElementById('btn-reset-template-default')
  };

  // --- Initialize Application ---
  function init() {
    loadSavedData();
    initCodeMirror();
    bindEvents();
    checkLocalBackend();
    renderTabs();
    renderTree();
    validateSyntaxOffline();
  }

  // --- CodeMirror Setup ---
  function initCodeMirror() {
    // Custom Java Autocomplete Hint
    CodeMirror.registerHelper('hint', 'clike', function (cm) {
      const cur = cm.getCursor();
      const token = cm.getTokenAt(cur);
      const start = token.start;
      const end = cur.ch;
      const word = token.string.slice(0, end - start).trim();

      const list = [];

      // 1. Snippets
      for (const [key, val] of Object.entries(SNIPPETS)) {
        if (!word || key.startsWith(word.toLowerCase())) {
          list.push({
            text: key,
            displayText: `${key}  [snippet: ${key === 'psvm' ? 'main()' : key === 'sout' ? 'println()' : key}]`,
            className: 'hint-snippet',
            isSnippet: true,
            snippetKey: key
          });
        }
      }

      // 2. Classes in the current project
      Object.keys(projectFiles).forEach(fname => {
        const cName = fname.replace('.java', '');
        if (!word || cName.toLowerCase().startsWith(word.toLowerCase())) {
          list.push({
            text: cName,
            displayText: `${cName}  [project class]`,
            className: 'hint-class'
          });
        }
      });

      // 3. Keywords
      JAVA_KEYWORDS.forEach(kw => {
        if (!word || kw.startsWith(word)) {
          list.push({
            text: kw,
            displayText: `${kw}  [keyword]`,
            className: 'hint-keyword'
          });
        }
      });

      // 4. Common Types
      JAVA_TYPES.forEach(tp => {
        if (!word || tp.toLowerCase().startsWith(word.toLowerCase())) {
          list.push({
            text: tp,
            displayText: `${tp}  [class]`,
            className: 'hint-class'
          });
        }
      });

      // 5. Common Methods
      JAVA_COMMON_METHODS.forEach(m => {
        if (!word || m.toLowerCase().includes(word.toLowerCase())) {
          list.push({
            text: m,
            displayText: `${m}  [method]`,
            className: 'hint-method'
          });
        }
      });

      return {
        list: list,
        from: CodeMirror.Pos(cur.line, start),
        to: CodeMirror.Pos(cur.line, end)
      };
    });

    // Custom Tab Key behavior: Check for snippets first, then 4-spaces indent
    function handleTabKey(cm) {
      if (cm.somethingSelected()) {
        cm.indentSelection('add');
        return;
      }

      const cursor = cm.getCursor();
      const line = cm.getLine(cursor.line);
      const textBefore = line.slice(0, cursor.ch);
      const match = textBefore.match(/([a-zA-Z0-9_]+)$/);

      if (match) {
        const word = match[1];
        if (SNIPPETS[word]) {
          expandSnippet(cm, cursor, word, SNIPPETS[word]);
          return;
        }
      }

      cm.replaceSelection('    ', 'end');
    }

    const initialCode = projectFiles[activeFileName] || customMainTemplate;

    editor = CodeMirror(dom.editorContainer, {
      value: initialCode,
      mode: 'text/x-java',
      theme: 'darcula',
      lineNumbers: true,
      lineWrapping: false,
      indentUnit: 4,
      tabSize: 4,
      indentWithTabs: false,
      matchBrackets: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'lint-gutter'],
      extraKeys: {
        'Tab': handleTabKey,
        'Ctrl-Space': 'autocomplete',
        'Ctrl-S': function () { downloadActiveFile(); },
        'Cmd-S': function () { downloadActiveFile(); },
        'Ctrl-Enter': function () { runOrCompile(); },
        'F9': function () { compileAndAnalyze(); },
        'Shift-F10': function () { runOrCompile(); },
        'Ctrl-Alt-L': function () { formatCode(); },
        'Cmd-Alt-L': function () { formatCode(); }
      }
    });

    // Listen to editor changes
    editor.on('change', () => {
      if (isSwitchingFile) return;

      projectFiles[activeFileName] = editor.getValue();
      dom.autosaveStatus.innerHTML = '✏️ Editando...';

      clearTimeout(autosaveTimeout);
      autosaveTimeout = setTimeout(() => {
        saveDataLocally();
        detectClassNameAndUpdateUI();
        validateSyntaxOffline();
      }, 400);
    });

    // Cursor activity updates statusbar
    editor.on('cursorActivity', () => {
      const cur = editor.getCursor();
      dom.statusbarCursor.textContent = `Ln ${cur.line + 1}, Col ${cur.ch + 1}`;
    });
  }

  // --- Multi-file Project Management ---
  function switchToFile(filename) {
    if (!projectFiles[filename]) return;

    isSwitchingFile = true;
    projectFiles[activeFileName] = editor.getValue();
    activeFileName = filename;

    editor.setValue(projectFiles[filename]);
    isSwitchingFile = false;

    dom.breadcrumbFilename.textContent = filename;
    dom.btnDownloadText.textContent = `Descargar ${filename}`;

    renderTabs();
    renderTree();
    validateSyntaxOffline();
    editor.focus();
  }

  function addNewFile(className) {
    className = className.trim();
    if (!className) return;

    // Normalizar nombre de archivo
    if (!className.endsWith('.java')) {
      className += '.java';
    }

    const bareName = className.replace('.java', '');
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(bareName)) {
      alert('Nombre de clase no válido para Java. Debe comenzar con letra o guión bajo.');
      return;
    }

    if (projectFiles[className]) {
      alert(`El archivo '${className}' ya existe en el proyecto.`);
      switchToFile(className);
      return;
    }

    // Boilerplate para clase Java secundaria
    const newClassCode = `public class ${bareName} {
    // Atributos
    

    // Constructor
    public ${bareName}() {
        
    }

    // Métodos
    
}
`;

    projectFiles[className] = newClassCode;
    saveDataLocally();
    switchToFile(className);
    showToast(`Archivo '${className}' creado con éxito`);
  }

  function deleteFile(filename) {
    const fileKeys = Object.keys(projectFiles);
    if (fileKeys.length <= 1) {
      alert('No puedes eliminar el único archivo restante del proyecto.');
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar '${filename}'?`)) {
      return;
    }

    delete projectFiles[filename];

    if (activeFileName === filename) {
      const remainingFiles = Object.keys(projectFiles);
      activeFileName = remainingFiles.includes('Main.java') ? 'Main.java' : remainingFiles[0];
      isSwitchingFile = true;
      editor.setValue(projectFiles[activeFileName]);
      isSwitchingFile = false;
    }

    saveDataLocally();
    renderTabs();
    renderTree();
    validateSyntaxOffline();
    showToast(`Archivo '${filename}' eliminado`, 'error');
  }

  function renderTabs() {
    dom.tabsList.innerHTML = '';
    const filenames = Object.keys(projectFiles);

    filenames.forEach(filename => {
      const tab = document.createElement('div');
      tab.className = `editor-tab ${filename === activeFileName ? 'active' : ''}`;
      tab.title = filename;

      tab.innerHTML = `
        <span>☕</span>
        <span>${filename}</span>
        ${filenames.length > 1 ? `<span class="tab-close" title="Cerrar archivo">&times;</span>` : ''}
      `;

      tab.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-close')) {
          e.stopPropagation();
          deleteFile(filename);
          return;
        }
        if (filename !== activeFileName) {
          switchToFile(filename);
        }
      });

      dom.tabsList.appendChild(tab);
    });

    dom.breadcrumbFilename.textContent = activeFileName;
    dom.btnDownloadText.textContent = `Descargar ${activeFileName}`;
  }

  function renderTree() {
    dom.treeFilesContainer.innerHTML = '';
    const filenames = Object.keys(projectFiles);

    filenames.forEach(filename => {
      const node = document.createElement('div');
      node.className = `tree-node level-2 ${filename === activeFileName ? 'selected' : ''}`;

      node.innerHTML = `
        <div class="tree-node-content">
          <span class="tree-icon">☕</span>
          <span>${filename}</span>
        </div>
        ${filenames.length > 1 ? `<button class="tree-delete-btn" title="Eliminar archivo">&times;</button>` : ''}
      `;

      node.addEventListener('click', (e) => {
        if (e.target.classList.contains('tree-delete-btn')) {
          e.stopPropagation();
          deleteFile(filename);
          return;
        }
        if (filename !== activeFileName) {
          switchToFile(filename);
        }
      });

      dom.treeFilesContainer.appendChild(node);
    });
  }

  // --- Detect Class Name in Active File ---
  function detectClassNameAndUpdateUI() {
    const code = editor.getValue();
    const match = code.match(/\bpublic\s+(?:final\s+|abstract\s+)?(?:class|interface|enum|record)\s+([A-Za-z_$][A-Za-z0-9_$]*)/);

    if (match) {
      const declaredClassName = match[1];
      const expectedFileName = `${declaredClassName}.java`;

      // Si el nombre de la clase pública cambió respecto al nombre del archivo
      if (expectedFileName !== activeFileName && !projectFiles[expectedFileName]) {
        projectFiles[expectedFileName] = code;
        delete projectFiles[activeFileName];
        activeFileName = expectedFileName;
        renderTabs();
        renderTree();
        saveDataLocally();
      }
    }
  }

  // --- Snippet Expansion ---
  function expandSnippet(cm, cursor, word, snippetObj) {
    const from = CodeMirror.Pos(cursor.line, cursor.ch - word.length);
    const to = cursor;

    cm.replaceRange(snippetObj.template, from, to);

    const lines = snippetObj.template.split('\n');
    let targetLine = from.line;
    let targetCh = from.ch;

    if (lines.length === 1) {
      targetCh = from.ch + snippetObj.cursorOffset;
    } else {
      let remaining = snippetObj.cursorOffset;
      for (let i = 0; i < lines.length; i++) {
        if (remaining <= lines[i].length) {
          targetLine = from.line + i;
          targetCh = (i === 0 ? from.ch : 0) + remaining;
          break;
        }
        remaining -= (lines[i].length + 1);
      }
    }

    cm.setCursor(CodeMirror.Pos(targetLine, targetCh));
    showToast(`Snippet '${word}' expandido`);
  }

  // --- Offline Syntax Analyzer ---
  function validateSyntaxOffline() {
    clearLintMarkers();

    const code = editor.getValue();
    const lines = code.split('\n');
    const problems = [];

    const bracketStack = [];
    let inBlockComment = false;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      let lineText = lines[lineIndex];
      let i = 0;
      let inString = false;
      let inChar = false;
      let stringStartCol = 0;

      while (i < lineText.length) {
        if (inBlockComment) {
          if (lineText.slice(i, i + 2) === '*/') {
            inBlockComment = false;
            i += 2;
          } else {
            i++;
          }
          continue;
        }

        if (!inString && !inChar) {
          if (lineText.slice(i, i + 2) === '//') break;
          if (lineText.slice(i, i + 2) === '/*') {
            inBlockComment = true;
            i += 2;
            continue;
          }
        }

        const char = lineText[i];
        const prevChar = i > 0 ? lineText[i - 1] : '';

        if (char === '"' && prevChar !== '\\' && !inChar) {
          if (!inString) {
            inString = true;
            stringStartCol = i;
          } else {
            inString = false;
          }
          i++;
          continue;
        }

        if (char === "'" && prevChar !== '\\' && !inString) {
          inChar = !inChar;
          i++;
          continue;
        }

        if (inString || inChar) {
          i++;
          continue;
        }

        if (char === '{' || char === '(' || char === '[') {
          bracketStack.push({ char, line: lineIndex, col: i });
        } else if (char === '}' || char === ')' || char === ']') {
          if (bracketStack.length === 0) {
            problems.push({
              type: 'error',
              line: lineIndex,
              col: i,
              message: `Carácter de cierre inesperado '${char}' sin apertura previa.`
            });
          } else {
            const top = bracketStack.pop();
            const expected = top.char === '{' ? '}' : top.char === '(' ? ')' : ']';
            if (char !== expected) {
              problems.push({
                type: 'error',
                line: lineIndex,
                col: i,
                message: `Desajuste de delimitador: se esperaba '${expected}' pero se encontró '${char}' (abierto en L${top.line + 1}:C${top.col + 1}).`
              });
            }
          }
        }

        i++;
      }

      if (inString) {
        problems.push({
          type: 'error',
          line: lineIndex,
          col: stringStartCol,
          message: `Cadena de texto (String) sin comillas de cierre en la misma línea.`
        });
      }

      const trimmed = lineText.trim();
      if (
        trimmed &&
        !inBlockComment &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('/*') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('@') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith(',') &&
        !trimmed.endsWith(':')
      ) {
        const isControlHeader = /^(if|else|for|while|do|switch|case|default|try|catch|finally)\b/.test(trimmed);
        const isClassOrMethod = /\b(class|interface|enum|record)\b/.test(trimmed) ||
                                /\b(public|private|protected|static|void)\b.*\(.*\)$/.test(trimmed);

        if (!isControlHeader && !isClassOrMethod) {
          let isContinuation = false;
          for (let next = lineIndex + 1; next < lines.length; next++) {
            const nextTrim = lines[next].trim();
            if (nextTrim) {
              if (/^[+\-*/.%&|^]/.test(nextTrim) || nextTrim.startsWith('.') || nextTrim.startsWith('?')) {
                isContinuation = true;
              }
              break;
            }
          }

          if (!isContinuation) {
            problems.push({
              type: 'error',
              line: lineIndex,
              col: lineText.length,
              message: `Posible falta de ';' al final de la instrucción.`
            });
          }
        }
      }

      if (/\bstring\s+[a-zA-Z_]/.test(lineText)) {
        problems.push({
          type: 'warning',
          line: lineIndex,
          col: lineText.indexOf('string'),
          message: `'string' en minúscula: En Java los tipos de texto son objetos de la clase 'String'.`
        });
      }

      if (/\bsystem\.out\./.test(lineText)) {
        problems.push({
          type: 'error',
          line: lineIndex,
          col: lineText.indexOf('system.out'),
          message: `'system.out': 'System' debe escribirse con 'S' mayúscula.`
        });
      }
    }

    while (bracketStack.length > 0) {
      const unclosed = bracketStack.pop();
      problems.push({
        type: 'error',
        line: unclosed.line,
        col: unclosed.col,
        message: `Delimitador '${unclosed.char}' sin cerrar (abierto en Línea ${unclosed.line + 1}, Columna ${unclosed.col + 1}).`
      });
    }

    // Java Semantic checks
    const publicClassMatches = [...code.matchAll(/\bpublic\s+(?:final\s+|abstract\s+)?(?:class|interface|enum|record)\s+([A-Za-z0-9_$]+)/g)];
    if (publicClassMatches.length > 1) {
      publicClassMatches.slice(1).forEach(m => {
        const lineNo = code.slice(0, m.index).split('\n').length - 1;
        problems.push({
          type: 'error',
          line: lineNo,
          col: 0,
          message: `Java solo permite una clase pública por archivo (se encontró '${m[1]}').`
        });
      });
    }

    if (/\bScanner\b/.test(code) && !/import\s+java\.util\.(Scanner|\*);/.test(code)) {
      problems.push({
        type: 'warning',
        line: 0,
        col: 0,
        message: `Uso de 'Scanner' detectado sin 'import java.util.Scanner;' o 'import java.util.*;'.`
      });
    }

    renderProblems(problems);
  }

  function clearLintMarkers() {
    activeMarkers.forEach(m => m.clear());
    activeMarkers = [];
    editor.clearGutter('lint-gutter');
  }

  function renderProblems(problems) {
    const errorCount = problems.filter(p => p.type === 'error').length;
    const warnCount = problems.filter(p => p.type === 'warning').length;

    dom.problemsCountBadge.textContent = problems.length;
    dom.problemsCountBadge.className = 'badge-count';
    if (errorCount > 0) {
      dom.problemsCountBadge.classList.add('has-errors');
    } else if (warnCount > 0) {
      dom.problemsCountBadge.classList.add('has-warnings');
    }

    dom.problemsList.innerHTML = '';

    if (problems.length === 0) {
      dom.problemsEmpty.style.display = 'flex';
      dom.statusbarMessage.textContent = '✔ Sin problemas sintácticos detectados';
      return;
    }

    dom.problemsEmpty.style.display = 'none';
    dom.statusbarMessage.textContent = `⚠️ ${errorCount} error(es), ${warnCount} advertencia(s)`;

    problems.forEach(p => {
      const markerEl = document.createElement('div');
      markerEl.className = `cm-lint-gutter-marker ${p.type}`;
      markerEl.innerHTML = p.type === 'error' ? '●' : '▲';
      markerEl.title = `[L${p.line + 1}] ${p.message}`;

      editor.setGutterMarker(p.line, 'lint-gutter', markerEl);

      const textMarker = editor.markText(
        CodeMirror.Pos(p.line, Math.max(0, p.col - 1)),
        CodeMirror.Pos(p.line, p.col + 2),
        { className: 'cm-lint-error-text' }
      );
      activeMarkers.push(textMarker);

      const item = document.createElement('div');
      item.className = `problem-item ${p.type}`;
      item.innerHTML = `
        <span class="problem-icon">${p.type === 'error' ? '❌' : '⚠️'}</span>
        <div class="problem-content">
          <div class="problem-title">${escapeHtml(p.message)}</div>
          <div class="problem-location">${activeFileName} : Línea ${p.line + 1}, Columna ${p.col + 1}</div>
        </div>
      `;

      item.addEventListener('click', () => {
        editor.setCursor(CodeMirror.Pos(p.line, p.col));
        editor.focus();
        editor.scrollIntoView({ line: p.line, ch: p.col }, 100);
      });

      dom.problemsList.appendChild(item);
    });
  }

  // --- Auto-Indentation & Formatting ---
  function formatCode() {
    const code = editor.getValue();
    const lines = code.split('\n');
    let indentLevel = 0;
    const formattedLines = [];

    lines.forEach(line => {
      let trimmed = line.trim();
      if (!trimmed) {
        formattedLines.push('');
        return;
      }

      const effectiveIndent = Math.max(0, indentLevel - (trimmed.startsWith('}') || trimmed.startsWith(')') ? 1 : 0));
      formattedLines.push('    '.repeat(effectiveIndent) + trimmed);

      let opens = 0;
      let closes = 0;
      let inString = false;
      for (let ch of trimmed) {
        if (ch === '"') inString = !inString;
        if (!inString) {
          if (ch === '{') opens++;
          if (ch === '}') closes++;
        }
      }
      indentLevel = Math.max(0, indentLevel + (opens - closes));
    });

    const cursor = editor.getCursor();
    editor.setValue(formattedLines.join('\n'));
    editor.setCursor(cursor);
    showToast('Código formateado (Ctrl+Alt+L)');
  }

  // --- Compile & Analyze Action ---
  async function compileAndAnalyze() {
    projectFiles[activeFileName] = editor.getValue();
    saveDataLocally();
    switchBottomTab('problems');
    validateSyntaxOffline();

    if (isBackendConnected) {
      appendConsole(`Compilando proyecto (${Object.keys(projectFiles).length} archivos) con JDK local...`, 'system');
      try {
        const resp = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            className: activeFileName.replace('.java', ''),
            files: projectFiles
          })
        });

        const data = await resp.json();
        if (data.success) {
          appendConsole(`✔ Compilación exitosa: Todos los archivos compilados correctamente.`, 'success');
          showToast('Compilación exitosa con javac');
        } else {
          appendConsole(`❌ Errores detectados por javac:\n${data.output}`, 'stderr');
          switchBottomTab('output');
        }
      } catch (err) {
        appendConsole(`Error de conexión con el micro-servidor: ${err.message}`, 'stderr');
      }
    } else {
      appendConsole(`[Modo Offline] Análisis sintáctico completado para ${activeFileName}.`, 'system');
      appendConsole(`Proyecto con ${Object.keys(projectFiles).length} archivo(s) listo(s) en memoria.`, 'stdout');
      showToast('Análisis sintáctico completado');
    }
  }

  // --- Run Action ---
  async function runOrCompile() {
    projectFiles[activeFileName] = editor.getValue();
    saveDataLocally();
    validateSyntaxOffline();

    if (isBackendConnected) {
      switchBottomTab('output');
      appendConsole(`--- Ejecutando proyecto con JDK real (${Object.keys(projectFiles).length} archivos) ---`, 'system');

      try {
        const resp = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            className: activeFileName.replace('.java', ''),
            files: projectFiles
          })
        });

        const data = await resp.json();
        if (data.stdout) appendConsole(data.stdout, 'stdout');
        if (data.stderr) appendConsole(data.stderr, 'stderr');

        if (data.success) {
          appendConsole(`\nProcess finished with exit code ${data.exitCode || 0}`, 'success');
        } else {
          appendConsole(`\nExecution failed with exit code ${data.exitCode || 1}`, 'stderr');
        }
      } catch (err) {
        appendConsole(`Error ejecutando proceso Java: ${err.message}`, 'stderr');
      }
    } else {
      switchBottomTab('output');
      appendConsole(`=== MODO AUTÓNOMO Y OFFLINE (SEB) ===`, 'system');
      appendConsole(`Archivos activos en el proyecto: ${Object.keys(projectFiles).join(', ')}`, 'stdout');
      appendConsole(`\nPara compilar y ejecutar directamente con javac/java real:`, 'system');
      appendConsole(`   python3 server.py  (o ./start_mac.sh en Mac)`, 'success');
      appendConsole(`Usa el menú "Descargar" para guardar tus archivos .java o descargar el proyecto en ZIP.`, 'stdout');
    }
  }

  // --- Downloads (Single & ZIP) ---
  function downloadActiveFile() {
    projectFiles[activeFileName] = editor.getValue();
    const code = projectFiles[activeFileName];

    const blob = new Blob([code], { type: 'text/x-java;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = activeFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dom.statusbarMessage.textContent = `Descargado: ${activeFileName}`;
    showToast(`Archivo '${activeFileName}' descargado`);
  }

  async function downloadAllFilesZip() {
    projectFiles[activeFileName] = editor.getValue();
    saveDataLocally();

    // 1. Si el backend está disponible, solicitar ZIP generado por el servidor
    if (isBackendConnected) {
      try {
        const resp = await fetch('/api/zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ files: projectFiles })
        });
        if (resp.ok) {
          const blob = await resp.blob();
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'Proyecto_Java.zip';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showToast('Proyecto descargado como ZIP');
          return;
        }
      } catch (e) {
        // Fallback a descarga individual en navegador
      }
    }

    // 2. Fallback 100% offline en cliente: descargar cada archivo .java individualmente
    const keys = Object.keys(projectFiles);
    keys.forEach((fname, index) => {
      setTimeout(() => {
        const blob = new Blob([projectFiles[fname]], { type: 'text/x-java;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fname;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, index * 200);
    });

    showToast(`Descargando ${keys.length} archivo(s) .java`);
  }

  // --- Persistence in LocalStorage ---
  function saveDataLocally() {
    try {
      projectFiles[activeFileName] = editor.getValue();
      localStorage.setItem('java_offline_ide_files', JSON.stringify(projectFiles));
      localStorage.setItem('java_offline_ide_active_file', activeFileName);
      localStorage.setItem('java_offline_ide_template', customMainTemplate);
      dom.autosaveStatus.innerHTML = '💾 Guardado localmente';
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  function loadSavedData() {
    try {
      const savedVersion = localStorage.getItem('java_pspro_v_key');
      if (savedVersion !== PSPRO_INIT_KEY) {
        // Inicialización garantizada con los 3 ejercicios de PSPRO
        projectFiles = getDefaultPsproFiles();
        activeFileName = 'Ejercicio1.java';
        customMainTemplate = EJERCICIO_1_TEMPLATE;
        saveDataLocally();
        localStorage.setItem('java_pspro_v_key', PSPRO_INIT_KEY);
        return;
      }

      const savedTemplate = localStorage.getItem('java_offline_ide_template');
      if (savedTemplate && savedTemplate.trim()) {
        customMainTemplate = savedTemplate;
      }

      const savedFilesJson = localStorage.getItem('java_offline_ide_files');
      if (savedFilesJson) {
        const parsed = JSON.parse(savedFilesJson);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          projectFiles = parsed;
        } else {
          projectFiles = getDefaultPsproFiles();
        }
      } else {
        projectFiles = getDefaultPsproFiles();
      }

      const savedActive = localStorage.getItem('java_offline_ide_active_file');
      if (savedActive && projectFiles[savedActive]) {
        activeFileName = savedActive;
      } else {
        activeFileName = Object.keys(projectFiles).includes('Ejercicio1.java') ? 'Ejercicio1.java' : Object.keys(projectFiles)[0];
      }
    } catch (e) {
      console.warn('Error reading LocalStorage:', e);
      projectFiles = getDefaultPsproFiles();
      activeFileName = 'Ejercicio1.java';
    }
  }

  // --- Modals Logic ---
  function openNewFileModal() {
    dom.inputNewFilename.value = '';
    dom.modalNewFile.classList.add('open');
    setTimeout(() => dom.inputNewFilename.focus(), 50);
  }

  function openTemplateModal() {
    dom.textareaTemplate.value = customMainTemplate;
    dom.modalTemplate.classList.add('open');
    setTimeout(() => dom.textareaTemplate.focus(), 50);
  }

  function closeModals() {
    dom.modalNewFile.classList.remove('open');
    dom.modalTemplate.classList.remove('open');
  }

  // --- Terminal Helpers ---
  function appendConsole(text, type = 'stdout') {
    const span = document.createElement('span');
    span.className = `out-${type}`;
    span.textContent = text + '\n';
    dom.consoleOutput.appendChild(span);
    dom.outputPanel.scrollTop = dom.outputPanel.scrollHeight;
  }

  function clearConsole() {
    dom.consoleOutput.innerHTML = '';
  }

  function switchBottomTab(tabId) {
    dom.panelTabs.forEach(t => {
      t.classList.toggle('active', t.getAttribute('data-tab') === tabId);
    });

    dom.problemsPanel.classList.toggle('active', tabId === 'problems');
    dom.outputPanel.classList.toggle('active', tabId === 'output');
    dom.snippetsPanel.classList.toggle('active', tabId === 'snippets');
  }

  function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // --- Check Backend Status ---
  async function checkLocalBackend() {
    if (window.location.protocol.startsWith('http')) {
      try {
        const resp = await fetch('/api/status', { method: 'GET' });
        if (resp.ok) {
          const data = await resp.json();
          if (data.status === 'ok') {
            isBackendConnected = true;
            dom.backendStatusBadge.className = 'status-badge badge-online';
            dom.backendStatusBadge.textContent = `🟢 Localhost JDK (${data.version || 'Java'})`;
            dom.btnRun.title = 'Ejecutar proyecto con JDK real (Shift+F10)';
            return;
          }
        }
      } catch (e) {
        // Fallback to offline mode
      }
    }

    isBackendConnected = false;
    dom.backendStatusBadge.className = 'status-badge badge-offline';
    dom.backendStatusBadge.textContent = '🔵 100% Offline (SEB)';
  }

  // --- Event Bindings ---
  function bindEvents() {
    dom.btnCompile.addEventListener('click', compileAndAnalyze);
    dom.btnRun.addEventListener('click', runOrCompile);
    dom.btnFormat.addEventListener('click', formatCode);

    // Download button & split menu
    dom.btnDownload.addEventListener('click', downloadActiveFile);
    dom.btnDownloadToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dom.downloadMenu.classList.toggle('open');
    });

    dom.menuDownloadActive.addEventListener('click', () => {
      dom.downloadMenu.classList.remove('open');
      downloadActiveFile();
    });

    dom.menuDownloadAll.addEventListener('click', () => {
      dom.downloadMenu.classList.remove('open');
      downloadAllFilesZip();
    });

    document.addEventListener('click', (e) => {
      if (!dom.downloadMenu.contains(e.target) && e.target !== dom.btnDownloadToggle) {
        dom.downloadMenu.classList.remove('open');
      }
    });

    // Add new file triggers
    dom.btnAddFileSidebar.addEventListener('click', openNewFileModal);
    dom.btnAddFileTab.addEventListener('click', openNewFileModal);

    dom.btnConfirmNewFile.addEventListener('click', () => {
      const name = dom.inputNewFilename.value.trim();
      if (name) {
        closeModals();
        addNewFile(name);
      }
    });

    dom.inputNewFilename.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const name = dom.inputNewFilename.value.trim();
        if (name) {
          closeModals();
          addNewFile(name);
        }
      }
    });

    // Template Modal triggers
    dom.btnEditTemplate.addEventListener('click', openTemplateModal);

    dom.btnSaveTemplate.addEventListener('click', () => {
      const val = dom.textareaTemplate.value.trim();
      if (val) {
        customMainTemplate = dom.textareaTemplate.value;
        saveDataLocally();
        closeModals();
        showToast('Plantilla guardada en el navegador');
      }
    });

    dom.btnResetTemplateDefault.addEventListener('click', () => {
      if (confirm('¿Restablecer la plantilla inicial a Ejercicio1 (PSPRO)?')) {
        customMainTemplate = EJERCICIO_1_TEMPLATE;
        dom.textareaTemplate.value = EJERCICIO_1_TEMPLATE;
        saveDataLocally();
        showToast('Plantilla restablecida a Ejercicio1');
      }
    });

    // Close modals
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', closeModals);
    });

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModals();
      });
    });

    // Reset project button
    dom.btnReset.addEventListener('click', () => {
      if (confirm('¿Deseas reiniciar el proyecto con los 3 ejercicios de PSPRO por defecto?')) {
        projectFiles = getDefaultPsproFiles();
        activeFileName = 'Ejercicio1.java';
        isSwitchingFile = true;
        editor.setValue(projectFiles[activeFileName]);
        isSwitchingFile = false;
        saveDataLocally();
        renderTabs();
        renderTree();
        validateSyntaxOffline();
        showToast('Ejercicios de PSPRO restaurados');
      }
    });

    // Bottom Panel Tabs
    dom.panelTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchBottomTab(tab.getAttribute('data-tab'));
      });
    });

    dom.btnClearConsole.addEventListener('click', clearConsole);

    let isPanelMinimized = false;
    dom.btnTogglePanel.addEventListener('click', () => {
      isPanelMinimized = !isPanelMinimized;
      dom.bottomPanel.style.height = isPanelMinimized ? '32px' : '220px';
      editor.refresh();
    });

    dom.sidebarToggle.addEventListener('click', () => {
      dom.sidebar.classList.toggle('collapsed');
      setTimeout(() => editor.refresh(), 210);
    });

    // Font size
    let currentFontSize = 14;
    dom.btnFontInc.addEventListener('click', () => {
      if (currentFontSize < 24) {
        currentFontSize += 2;
        dom.editorContainer.querySelector('.CodeMirror').style.fontSize = `${currentFontSize}px`;
        editor.refresh();
      }
    });

    dom.btnFontDec.addEventListener('click', () => {
      if (currentFontSize > 10) {
        currentFontSize -= 2;
        dom.editorContainer.querySelector('.CodeMirror').style.fontSize = `${currentFontSize}px`;
        editor.refresh();
      }
    });

    // Resizer Drag
    let isResizing = false;
    let startY, startHeight;

    dom.resizer.addEventListener('mousedown', e => {
      isResizing = true;
      startY = e.clientY;
      startHeight = dom.bottomPanel.offsetHeight;
      document.body.style.cursor = 'row-resize';
      e.preventDefault();
    });

    window.addEventListener('mousemove', e => {
      if (!isResizing) return;
      const dy = startY - e.clientY;
      const newHeight = Math.max(32, Math.min(window.innerHeight * 0.8, startHeight + dy));
      dom.bottomPanel.style.height = `${newHeight}px`;
      editor.refresh();
    });

    window.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = 'default';
        editor.refresh();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
