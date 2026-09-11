@echo off
title Music Project Manager
color 0A

echo.
echo  ============================================
echo    MUSIC PROJECT MANAGER - INICIALIZACAO
echo  ============================================
echo.

REM ===== Inicia Backend (FastAPI) =====
echo [1/2] Iniciando Backend (FastAPI :8000)...
start "MusicProject Backend" cmd /k "cd /d %~dp0backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak > nul

REM ===== Inicia Frontend (React) =====
echo [2/2] Iniciando Frontend (React :5173)...
start "MusicProject Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo  ============================================
echo    PRONTO!
echo    - Frontend:  http://localhost:5173
echo    - API Docs:  http://localhost:8000/docs
echo  ============================================
echo.
pause