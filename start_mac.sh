#!/usr/bin/env bash
# ==============================================================================
# Script de Inicio Todo-en-Uno para macOS: IntelliJ Java IDE + ngrok
# Diseñado para Safe Exam Browser (SEB) y pruebas remotas
# ==============================================================================

# Colores para la terminal
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo -e "${BLUE}===================================================================${NC}"
echo -e "${BLUE}  ☕ IntelliJ Java IDE (Offline/SEB) - Lanzador para macOS         ${NC}"
echo -e "${BLUE}===================================================================${NC}"

# 1. Comprobación de requisitos en macOS
if ! command -v python3 &>/dev/null; then
    echo -e "${RED}[ERROR] Python 3 no está instalado.${NC}"
    echo "En Mac puedes instalarlo con Homebrew ejecutando: brew install python"
    exit 1
fi

if ! command -v ngrok &>/dev/null; then
    echo -e "${RED}[ERROR] ngrok no está disponible en el PATH.${NC}"
    echo "En Mac puedes instalarlo fácilmente con Homebrew:"
    echo "   brew install ngrok"
    echo "Y después configura tu token:"
    echo "   ngrok config add-authtoken <TU_TOKEN>"
    exit 1
fi

if ! command -v javac &>/dev/null; then
    echo -e "${YELLOW}[AVISO] 'javac' no fue detectado en el PATH.${NC}"
    echo "El editor funcionará en modo análisis sintáctico de navegador."
    echo "Para compilar código real en Mac, instala Java con: brew install openjdk"
fi

# 2. Comprobar si el puerto 8080 ya está en uso
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}[AVISO] El puerto 8080 ya está en uso. Intentando liberarlo...${NC}"
    kill -9 $(lsof -ti:8080) 2>/dev/null || true
    sleep 1
fi

# 3. Lanzar servidor local Python
echo -e "\n${GREEN}[1/3] Iniciando servidor web local en http://localhost:8080...${NC}"
python3 "$DIR/server.py" > /tmp/java_ide_server.log 2>&1 &
SERVER_PID=$!

# Asegurar que los procesos en segundo plano se cierren al pulsar Ctrl+C
cleanup() {
    echo -e "\n\n${YELLOW}Deteniendo servidor local y túnel ngrok...${NC}"
    kill $SERVER_PID 2>/dev/null || true
    kill $NGROK_PID 2>/dev/null || true
    wait $SERVER_PID 2>/dev/null || true
    wait $NGROK_PID 2>/dev/null || true
    echo -e "${GREEN}¡Servicios detenidos con éxito!${NC}"
    exit 0
}
trap cleanup INT TERM EXIT

# Esperar a que el servidor responda
sleep 1.5

# 4. Lanzar túnel ngrok
echo -e "${GREEN}[2/3] Levantando túnel público con ngrok en el puerto 8080...${NC}"
ngrok http 8080 --log=stdout > /tmp/java_ide_ngrok.log 2>&1 &
NGROK_PID=$!

# Esperar a que ngrok genere la URL pública
echo -e "${GREEN}[3/3] Obteniendo enlace público de ngrok...${NC}"
PUBLIC_URL=""
for i in {1..12}; do
    sleep 1
    PUBLIC_URL=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c '
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get("tunnels", [])
    for t in tunnels:
        if t.get("proto") in ("https", "http"):
            print(t.get("public_url", ""))
            break
except Exception:
    pass
')
    if [ -n "$PUBLIC_URL" ]; then
        break
    fi
done

echo -e "\n${BLUE}===================================================================${NC}"
echo -e "${GREEN}  ✔ ENTORNO ACTIVO Y LISTO PARA PRUEBAS EN MAC Y OTROS DISPOSITIVOS ${NC}"
echo -e "${BLUE}===================================================================${NC}"
echo -e " ▸ ${YELLOW}URL Local (Mac)${NC}      : http://localhost:8080"
if [ -n "$PUBLIC_URL" ]; then
    echo -e " ▸ ${YELLOW}URL Pública (ngrok)${NC}  : ${GREEN}$PUBLIC_URL${NC}"
else
    echo -e " ▸ ${YELLOW}URL Pública (ngrok)${NC}  : (Consulta http://127.0.0.1:4040 si tarda unos segundos)"
fi
echo -e " ▸ ${YELLOW}Panel de control ngrok${NC}: http://127.0.0.1:4040"
echo -e "${BLUE}===================================================================${NC}"
echo -e "Presiona ${RED}[Ctrl + C]${NC} en esta ventana para detener todos los servicios.\n"

# Abrir el navegador por defecto en macOS si el comando 'open' existe
if command -v open &>/dev/null; then
    open "http://localhost:8080" 2>/dev/null || true
fi

# Mantener el script en ejecución escuchando logs de ngrok
wait $NGROK_PID
