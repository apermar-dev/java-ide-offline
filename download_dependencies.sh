#!/usr/bin/env bash
# ==============================================================================
# Script de Descarga de Dependencias Offline para IntelliJ Java IDE (SEB)
# Ejecuta este script ANTES del examen si se clona en un nuevo equipo sin vendor.
# ==============================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENDOR_DIR="$DIR/vendor"
CM_DIR="$VENDOR_DIR/codemirror"
FONTS_DIR="$VENDOR_DIR/fonts"

echo "=== Descargando librerías y fuentes para funcionamiento 100% offline ==="

mkdir -p "$CM_DIR/theme" "$CM_DIR/mode" "$CM_DIR/addon/edit" \
         "$CM_DIR/addon/hint" "$CM_DIR/addon/fold" "$CM_DIR/addon/selection" \
         "$FONTS_DIR"

CM_BASE="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16"

echo "1/3 Descargando CodeMirror 5 y plugins..."
curl -s "$CM_BASE/codemirror.min.js" -o "$CM_DIR/codemirror.min.js"
curl -s "$CM_BASE/codemirror.min.css" -o "$CM_DIR/codemirror.min.css"
curl -s "$CM_BASE/theme/darcula.min.css" -o "$CM_DIR/theme/darcula.min.css"
curl -s "$CM_BASE/mode/clike/clike.min.js" -o "$CM_DIR/mode/clike.min.js"

curl -s "$CM_BASE/addon/edit/matchbrackets.min.js" -o "$CM_DIR/addon/edit/matchbrackets.min.js"
curl -s "$CM_BASE/addon/edit/closebrackets.min.js" -o "$CM_DIR/addon/edit/closebrackets.min.js"
curl -s "$CM_BASE/addon/hint/show-hint.min.js" -o "$CM_DIR/addon/hint/show-hint.min.js"
curl -s "$CM_BASE/addon/hint/show-hint.min.css" -o "$CM_DIR/addon/hint/show-hint.min.css"

curl -s "$CM_BASE/addon/fold/foldcode.min.js" -o "$CM_DIR/addon/fold/foldcode.min.js"
curl -s "$CM_BASE/addon/fold/foldgutter.min.js" -o "$CM_DIR/addon/fold/foldgutter.min.js"
curl -s "$CM_BASE/addon/fold/foldgutter.min.css" -o "$CM_DIR/addon/fold/foldgutter.min.css"
curl -s "$CM_BASE/addon/fold/brace-fold.min.js" -o "$CM_DIR/addon/fold/brace-fold.min.js"
curl -s "$CM_BASE/addon/fold/comment-fold.min.js" -o "$CM_DIR/addon/fold/comment-fold.min.js"
curl -s "$CM_BASE/addon/selection/active-line.min.js" -o "$CM_DIR/addon/selection/active-line.min.js"

echo "2/3 Descargando tipografía JetBrains Mono (WOFF2)..."
curl -s -L "https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.21/files/jetbrains-mono-latin-400-normal.woff2" -o "$FONTS_DIR/jetbrains-mono-400.woff2"
curl -s -L "https://cdn.jsdelivr.net/npm/@fontsource/jetbrains-mono@5.0.21/files/jetbrains-mono-latin-700-normal.woff2" -o "$FONTS_DIR/jetbrains-mono-700.woff2"

echo "3/3 Verificando estructura..."
ls -lh "$CM_DIR"
ls -lh "$FONTS_DIR"

echo "=== ¡Listo! El entorno es 100% offline y autónomo para Safe Exam Browser ==="
