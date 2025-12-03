#!/bin/bash

# Script para iniciar frontend e backend simultaneamente

echo "🚀 Iniciando JogaCraque..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se as dependências estão instaladas
check_dependencies() {
    if [ ! -d "frontend/node_modules" ]; then
        echo -e "${BLUE}Instalando dependências do frontend...${NC}"
        cd frontend && npm install && cd ..
    fi
    
    if [ ! -d "backend/node_modules" ]; then
        echo -e "${BLUE}Instalando dependências do backend...${NC}"
        cd backend && npm install && cd ..
    fi
}

# Verificar dependências
check_dependencies

# Iniciar frontend e backend em paralelo
echo -e "${GREEN}Iniciando Frontend (porta 3000)...${NC}"
cd frontend && npm run dev &
FRONTEND_PID=$!

echo -e "${GREEN}Iniciando Backend (porta 3001)...${NC}"
cd backend && npm run dev &
BACKEND_PID=$!

# Função para cleanup quando o script for interrompido
cleanup() {
    echo -e "\n${BLUE}Encerrando servidores...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

# Esperar indefinidamente
echo -e "${GREEN}Servidores rodando! Pressione Ctrl+C para parar.${NC}"
wait
