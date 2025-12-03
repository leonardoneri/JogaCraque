@echo off
echo Iniciando JogaCraque...

REM Verificar e instalar dependências
if not exist "frontend\node_modules" (
    echo Instalando dependencias do frontend...
    cd frontend
    call npm install
    cd ..
)

if not exist "backend\node_modules" (
    echo Instalando dependencias do backend...
    cd backend
    call npm install
    cd ..
)

REM Iniciar servidores
echo Iniciando Frontend (porta 3000)...
start cmd /k "cd frontend && npm run dev"

echo Iniciando Backend (porta 3001)...
start cmd /k "cd backend && npm run dev"

echo Servidores iniciados!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3001
pause
