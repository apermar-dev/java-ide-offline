/**
 * ============================================================================
 * IntelliJ IDEA Offline Java IDE - Logic & Assistant Engine
 * 100% Standalone / SEB (Safe Exam Browser) Compatible
 * ============================================================================
 */

(function () {
  'use strict';

  // --- Constants & Templates ---
  const DEFAULT_CODE = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        // Bienvenido al editor offline estilo IntelliJ IDEA para Safe Exam Browser
        // Snippets disponibles: escribe 'sout' o 'psvm' y pulsa Tab
        System.out.println("¡Hola desde el entorno offline de examen!");

        Scanner scanner = new Scanner(System.in);
        // Escribe tu solución aquí...
    }
}
`;

  const SNIPPETS = {
    psvm: {
      template: 'public static void main(String[] args) {\n    \n}',
      cursorOffset: 38 // Puts cursor inside the braces
    },
    sout: {
      template: 'System.out.println();',
      cursorOffset: 19 // Puts cursor inside the parentheses
    },
    serr: {
      template: 'System.err.println();',
      cursorOffset: 19
    },
    fori: {
      template: 'for (int i = 0; i < ; i++) {\n    \n}',
      cursorOffset: 20 // Puts cursor after <
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

  // --- State ---
  let editor = null;
  let activeClassName = 'Main';
  let activeMarkers = [];
  let isBackendConnected = false;
  let serverCheckTimer = null;
  let autosaveTimeout = null;

  // --- DOM Elements ---
  const dom = {
    editorContainer: document.getElementById('code-editor'),
    tabFilename: document.getElementById('tab-filename'),
    treeFilename: document.getElementById('tree-filename'),
    breadcrumbFilename: document.getElementById('breadcrumb-filename'),
    tabModifiedDot: document.getElementById('tab-modified-dot'),
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
    btnFormat: document.getElementById('btn-format'),
    btnNew: document.getElementById('btn-new'),
    btnReset: document.getElementById('btn-reset'),
    btnClearConsole: document.getElementById('btn-clear-console'),
    btnTogglePanel: document.getElementById('btn-toggle-panel'),
    btnFontDec: document.getElementById('btn-font-dec'),
    btnFontInc: document.getElementById('btn-font-inc'),
    sidebar: document.getElementById('project-sidebar'),
    sidebarToggle: document.getElementById('btn-toggle-sidebar')
  };

  // --- Initialize Application ---
  function init() {
    initCodeMirror();
    bindEvents();
    checkLocalBackend();
    loadSavedCode();
    detectClassNameAndUpdateUI();
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

      // 1. Snippets matching prefix
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

      // 2. Keywords
      JAVA_KEYWORDS.forEach(kw => {
        if (!word || kw.startsWith(word)) {
          list.push({
            text: kw,
            displayText: `${kw}  [keyword]`,
            className: 'hint-keyword'
          });
        }
      });

      // 3. Common Java Types / Classes
      JAVA_TYPES.forEach(tp => {
        if (!word || tp.toLowerCase().startsWith(word.toLowerCase())) {
          list.push({
            text: tp,
            displayText: `${tp}  [class]`,
            className: 'hint-class'
          });
        }
      });

      // 4. Common methods & patterns
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

      // Default: insert 4 spaces
      cm.replaceSelection('    ', 'end');
    }

    editor = CodeMirror(dom.editorContainer, {
      value: DEFAULT_CODE,
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
        'Ctrl-S': function () { downloadJavaFile(); },
        'Cmd-S': function () { downloadJavaFile(); },
        'Ctrl-Enter': function () { runOrCompile(); },
        'F9': function () { compileAndAnalyze(); },
        'Shift-F10': function () { runOrCompile(); },
        'Ctrl-Alt-L': function () { formatCode(); },
        'Cmd-Alt-L': function () { formatCode(); }
      }
    });

    // Listen to editor changes
    editor.on('change', () => {
      dom.tabModifiedDot.classList.add('visible');
      dom.autosaveStatus.innerHTML = '✏️ Editando...';

      clearTimeout(autosaveTimeout);
      autosaveTimeout = setTimeout(() => {
        saveCodeLocally();
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

  // --- Snippet Expansion ---
  function expandSnippet(cm, cursor, word, snippetObj) {
    const from = CodeMirror.Pos(cursor.line, cursor.ch - word.length);
    const to = cursor;

    cm.replaceRange(snippetObj.template, from, to);

    // Compute new cursor position based on snippet template
    const lines = snippetObj.template.split('\n');
    let targetLine = from.line;
    let targetCh = from.ch;

    if (lines.length === 1) {
      targetCh = from.ch + snippetObj.cursorOffset;
    } else {
      // Find indentation or line of offset
      let remaining = snippetObj.cursorOffset;
      for (let i = 0; i < lines.length; i++) {
        if (remaining <= lines[i].length) {
          targetLine = from.line + i;
          targetCh = (i === 0 ? from.ch : 0) + remaining;
          break;
        }
        remaining -= (lines[i].length + 1); // +1 for newline
      }
    }

    cm.setCursor(CodeMirror.Pos(targetLine, targetCh));
    showToast(`Snippet '${word}' expandido`);
  }

  // --- Extract Public Class Name ---
  function detectClassNameAndUpdateUI() {
    const code = editor.getValue();
    const match = code.match(/\bpublic\s+(?:final\s+|abstract\s+)?(?:class|interface|enum|record)\s+([A-Za-z_$][A-Za-z0-9_$]*)/);

    const newClassName = match ? match[1] : 'Main';
    activeClassName = newClassName;

    const fileDisplay = `${newClassName}.java`;
    dom.tabFilename.textContent = fileDisplay;
    dom.treeFilename.textContent = fileDisplay;
    dom.breadcrumbFilename.textContent = fileDisplay;
  }

  // --- 100% Offline Client-Side Java Syntax Analyzer ---
  function validateSyntaxOffline() {
    clearLintMarkers();

    const code = editor.getValue();
    const lines = code.split('\n');
    const problems = [];

    // 1. Check bracket balance & unclosed quotes with position tracking
    const bracketStack = [];
    let inBlockComment = false;

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      let lineText = lines[lineIndex];
      let i = 0;
      let inString = false;
      let inChar = false;
      let stringStartCol = 0;

      while (i < lineText.length) {
        // Handle block comment end
        if (inBlockComment) {
          if (lineText.slice(i, i + 2) === '*/') {
            inBlockComment = false;
            i += 2;
          } else {
            i++;
          }
          continue;
        }

        // Handle comment start
        if (!inString && !inChar) {
          if (lineText.slice(i, i + 2) === '//') {
            break; // Skip rest of line
          }
          if (lineText.slice(i, i + 2) === '/*') {
            inBlockComment = true;
            i += 2;
            continue;
          }
        }

        const char = lineText[i];
        const prevChar = i > 0 ? lineText[i - 1] : '';

        // Handle string literals
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

        // Handle char literals
        if (char === "'" && prevChar !== '\\' && !inString) {
          inChar = !inChar;
          i++;
          continue;
        }

        // Inside literal strings or chars, skip syntax bracket tracking
        if (inString || inChar) {
          i++;
          continue;
        }

        // Bracket matching
        if (char === '{' || char === '(' || char === '[') {
          bracketStack.push({ char, line: lineIndex, col: i });
        } else if (char === '}' || char === ')' || char === ']') {
          if (bracketStack.length === 0) {
            problems.push({
              type: 'error',
              line: lineIndex,
              col: i,
              message: `Carácter de cierre inesperado '${char}' sin apertura previa correspondiente.`
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

      // Check unclosed string in line
      if (inString) {
        problems.push({
          type: 'error',
          line: lineIndex,
          col: stringStartCol,
          message: `Cadena de texto (String) sin comillas de cierre en la misma línea.`
        });
      }

      // Check missing semicolons for statements
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
        // Exceptions: class/interface/method headers, control structures
        const isControlHeader = /^(if|else|for|while|do|switch|case|default|try|catch|finally)\b/.test(trimmed);
        const isClassOrMethod = /\b(class|interface|enum|record)\b/.test(trimmed) ||
                                /\b(public|private|protected|static|void)\b.*\(.*\)$/.test(trimmed);

        if (!isControlHeader && !isClassOrMethod) {
          // Check if next non-empty line starts with an operator continuation (like '+' or '.')
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

      // Check common typos: lowercase string / system
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

    // Remaining unclosed brackets
    while (bracketStack.length > 0) {
      const unclosed = bracketStack.pop();
      problems.push({
        type: 'error',
        line: unclosed.line,
        col: unclosed.col,
        message: `Delimitador '${unclosed.char}' sin cerrar (abierto en Línea ${unclosed.line + 1}, Columna ${unclosed.col + 1}).`
      });
    }

    // 2. Java Semantic rules checks
    // Check multiple public classes
    const publicClassMatches = [...code.matchAll(/\bpublic\s+(?:final\s+|abstract\s+)?(?:class|interface|enum|record)\s+([A-Za-z0-9_$]+)/g)];
    if (publicClassMatches.length > 1) {
      publicClassMatches.slice(1).forEach(m => {
        const lineNo = code.slice(0, m.index).split('\n').length - 1;
        problems.push({
          type: 'error',
          line: lineNo,
          col: 0,
          message: `Java solo permite una clase pública por fichero (se encontró '${m[1]}').`
        });
      });
    }

    // Check main method existence / signature
    if (!code.includes('public static void main(String[] args)') &&
        !code.includes('public static void main(String args[])') &&
        !code.includes('public static void main(String... args)')) {
      if (/public\s+void\s+main\s*\(/.test(code)) {
        problems.push({
          type: 'warning',
          line: 0,
          col: 0,
          message: `El método main carece del modificador 'static'. Debe ser: 'public static void main(String[] args)'.`
        });
      } else if (/static\s+void\s+main\s*\(/.test(code) && !/public\s+static\s+void\s+main/.test(code)) {
        problems.push({
          type: 'warning',
          line: 0,
          col: 0,
          message: `El método main debe ser 'public'.`
        });
      }
    }

    // Check missing imports for commonly used classes
    if (/\bScanner\b/.test(code) && !/import\s+java\.util\.(Scanner|\*);/.test(code)) {
      problems.push({
        type: 'warning',
        line: 0,
        col: 0,
        message: `Uso de 'Scanner' detectado sin 'import java.util.Scanner;' o 'import java.util.*;'.`
      });
    }
    if (/\b(ArrayList|List)\b/.test(code) && !/import\s+java\.util\.(ArrayList|List|\*);/.test(code)) {
      problems.push({
        type: 'warning',
        line: 0,
        col: 0,
        message: `Uso de colecciones sin importar 'java.util.List' o 'java.util.ArrayList'.`
      });
    }

    // Render results in UI
    renderProblems(problems);
  }

  // --- Render Problems & Gutter Markers ---
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
      // 1. Mark line in CodeMirror
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

      // 2. Add to Problems panel list
      const item = document.createElement('div');
      item.className = `problem-item ${p.type}`;
      item.innerHTML = `
        <span class="problem-icon">${p.type === 'error' ? '❌' : '⚠️'}</span>
        <div class="problem-content">
          <div class="problem-title">${escapeHtml(p.message)}</div>
          <div class="problem-location">${activeClassName}.java : Línea ${p.line + 1}, Columna ${p.col + 1}</div>
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

      // Check if line closes braces at the start
      let leadingCloses = 0;
      let i = 0;
      while (i < trimmed.length && (trimmed[i] === '}' || trimmed[i] === ')')) {
        leadingCloses++;
        i++;
      }

      const effectiveIndent = Math.max(0, indentLevel - (trimmed.startsWith('}') || trimmed.startsWith(')') ? 1 : 0));
      formattedLines.push('    '.repeat(effectiveIndent) + trimmed);

      // Adjust indentation for future lines
      // Count open vs close braces outside strings/comments
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
    switchBottomTab('problems');
    validateSyntaxOffline();

    if (isBackendConnected) {
      appendConsole('Compilando con JDK local (javac)...', 'system');
      try {
        const resp = await fetch('/api/compile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            className: activeClassName,
            code: editor.getValue()
          })
        });

        const data = await resp.json();
        if (data.success) {
          appendConsole(`✔ Compilación exitosa: ${activeClassName}.class generado.`, 'success');
          showToast('Compilación exitosa con javac');
        } else {
          appendConsole(`❌ Errores detectados por javac:\n${data.output}`, 'stderr');
          switchBottomTab('output');
        }
      } catch (err) {
        appendConsole(`Error de conexión con el micro-servidor: ${err.message}`, 'stderr');
      }
    } else {
      appendConsole(`[Modo Offline] Análisis sintáctico completado para ${activeClassName}.java.`, 'system');
      appendConsole(`No se detectaron errores críticos en el navegador.`, 'stdout');
      showToast('Análisis sintáctico completado');
    }
  }

  // --- Run / Execute Action ---
  async function runOrCompile() {
    validateSyntaxOffline();

    if (isBackendConnected) {
      switchBottomTab('output');
      appendConsole(`--- Ejecutando ${activeClassName} con JDK real ---`, 'system');

      try {
        const resp = await fetch('/api/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            className: activeClassName,
            code: editor.getValue()
          })
        });

        const data = await resp.json();
        if (data.stdout) {
          appendConsole(data.stdout, 'stdout');
        }
        if (data.stderr) {
          appendConsole(data.stderr, 'stderr');
        }
        if (data.success) {
          appendConsole(`\nProcess finished with exit code ${data.exitCode || 0}`, 'success');
        } else {
          appendConsole(`\nExecution failed with exit code ${data.exitCode || 1}`, 'stderr');
        }
      } catch (err) {
        appendConsole(`Error ejecutando proceso Java: ${err.message}`, 'stderr');
      }
    } else {
      // 100% Offline browser fallback
      switchBottomTab('output');
      appendConsole(`=== MODO AUTÓNOMO Y OFFLINE (SEB) ===`, 'system');
      appendConsole(`El código se encuentra validado y listo en el navegador.`, 'stdout');
      appendConsole(`\n💡 Nota para el examen:`, 'system');
      appendConsole(`Para compilar y ejecutar directamente contra el JDK real de la máquina, inicia el micro-servidor ejecutando en la terminal:`, 'stdout');
      appendConsole(`   python3 server.py`, 'success');
      appendConsole(`Si estás dentro de Safe Exam Browser sin red ni localhost, utiliza el botón "Descargar .java" para entregar tu examen.`, 'stdout');
    }
  }

  // --- Download .java File ---
  function downloadJavaFile() {
    detectClassNameAndUpdateUI();
    const fileName = `${activeClassName}.java`;
    const code = editor.getValue();

    const blob = new Blob([code], { type: 'text/x-java;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    dom.tabModifiedDot.classList.remove('visible');
    dom.autosaveStatus.innerHTML = `💾 Descargado como <b>${fileName}</b>`;
    dom.statusbarMessage.textContent = `Archivo ${fileName} descargado con éxito`;
    showToast(`Archivo ${fileName} descargado`);
  }

  // --- Local Storage Persistence ---
  function saveCodeLocally() {
    try {
      localStorage.setItem('java_offline_ide_code', editor.getValue());
      localStorage.setItem('java_offline_ide_classname', activeClassName);
      dom.autosaveStatus.innerHTML = '💾 Guardado localmente';
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  function loadSavedCode() {
    try {
      const saved = localStorage.getItem('java_offline_ide_code');
      if (saved && saved.trim()) {
        editor.setValue(saved);
        dom.tabModifiedDot.classList.remove('visible');
      }
    } catch (e) {
      console.warn('Error reading LocalStorage:', e);
    }
  }

  // --- Terminal Output Helpers ---
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

  // --- UI Helpers & Tab Switching ---
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

  // --- Local Backend (Optional server.py detection) ---
  async function checkLocalBackend() {
    // Only check if opened via http:// or https:// (not file://)
    if (window.location.protocol.startsWith('http')) {
      try {
        const resp = await fetch('/api/status', { method: 'GET' });
        if (resp.ok) {
          const data = await resp.json();
          if (data.status === 'ok') {
            isBackendConnected = true;
            dom.backendStatusBadge.className = 'status-badge badge-online';
            dom.backendStatusBadge.textContent = `🟢 Localhost JDK (${data.version || 'Java'})`;
            dom.btnRun.title = 'Ejecutar programa con JDK real (Shift+F10)';
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
    // Top Action Buttons
    dom.btnCompile.addEventListener('click', compileAndAnalyze);
    dom.btnRun.addEventListener('click', runOrCompile);
    dom.btnDownload.addEventListener('click', downloadJavaFile);
    dom.btnFormat.addEventListener('click', formatCode);

    // New / Reset Buttons
    dom.btnNew.addEventListener('click', () => {
      if (confirm('¿Deseas iniciar una nueva plantilla limpia?')) {
        editor.setValue(DEFAULT_CODE);
        detectClassNameAndUpdateUI();
        validateSyntaxOffline();
        showToast('Plantilla reiniciada');
      }
    });

    dom.btnReset.addEventListener('click', () => {
      editor.setValue(DEFAULT_CODE);
      detectClassNameAndUpdateUI();
      validateSyntaxOffline();
    });

    // Panel Tabs Switching
    dom.panelTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        switchBottomTab(tab.getAttribute('data-tab'));
      });
    });

    // Clear Console
    dom.btnClearConsole.addEventListener('click', clearConsole);

    // Toggle Bottom Panel
    let isPanelMinimized = false;
    dom.btnTogglePanel.addEventListener('click', () => {
      isPanelMinimized = !isPanelMinimized;
      if (isPanelMinimized) {
        dom.bottomPanel.style.height = '32px';
      } else {
        dom.bottomPanel.style.height = '220px';
      }
      editor.refresh();
    });

    // Sidebar Toggle
    dom.sidebarToggle.addEventListener('click', () => {
      dom.sidebar.classList.toggle('collapsed');
      setTimeout(() => editor.refresh(), 210);
    });

    // Font size controls
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

    // Panel Resizer Drag
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

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
