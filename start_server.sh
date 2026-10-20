#!/usr/bin/env bash
# ==============================================================================
# Lanzador del entorno IntelliJ Offline para Safe Exam Browser
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "Iniciando servidor local para SEB..."
python3 server.py
