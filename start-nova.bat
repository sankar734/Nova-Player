@echo off
title NOVA PLAYER Launcher
echo ========================================================
echo    NOVA PLAYER - Play Anything. Understand Everything.
echo ========================================================
echo.

:: Check if Python AI backend is already running on port 8000
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [1/3] Starting Python AI Service on port 8000...
    start "Nova-AI-Backend" /min python -m uvicorn app.main:app --port 8000 --app-dir "services\ai-service"
) else (
    echo [1/3] Python AI Service is active on port 8000.
)

:: Check if Frontend is running on port 5173
netstat -ano | findstr :5173 >nul 2>&1
if %errorlevel% neq 0 (
    echo [2/3] Starting Nova Player Frontend on port 5173...
    start "Nova-Frontend" /min npm run dev:desktop
    timeout /t 3 /nobreak >nul
) else (
    echo [2/3] Nova Player Frontend is active on port 5173.
)

:: Launch Standalone Desktop App Window (Frameless Native Experience)
echo [3/3] Opening NOVA PLAYER Desktop Application...
start msedge --app=http://localhost:5173 --window-size=1380,860

echo.
echo ========================================================
echo   NOVA PLAYER launched successfully!
echo   UI: http://localhost:5173
echo   AI API: http://127.0.0.1:8000
echo ========================================================
