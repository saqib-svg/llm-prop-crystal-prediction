@echo off
setlocal

cd /d "%~dp0"
title Band Gap Predictor Starter

echo.
echo ========================================
echo   Band Gap Predictor - One Click Start
echo ========================================
echo.

where py >nul 2>nul
if errorlevel 1 (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python was not found. Install Python 3.10 or newer, then run this file again.
    echo https://www.python.org/downloads/
    pause
    exit /b 1
  ) else (
    set "PYTHON=python"
  )
) else (
  set "PYTHON=py -3"
)

where npm >nul 2>nul
if errorlevel 1 (
  echo Node.js/npm was not found. Install Node.js 18 or newer, then run this file again.
  echo https://nodejs.org/
  pause
  exit /b 1
)

if not exist ".venv\Scripts\python.exe" (
  echo Creating Python virtual environment...
  %PYTHON% -m venv .venv
  if errorlevel 1 (
    echo Failed to create Python virtual environment.
    pause
    exit /b 1
  )
)

echo Installing backend dependencies...
call ".venv\Scripts\python.exe" -m pip install --upgrade pip
call ".venv\Scripts\python.exe" -m pip install -r backend\requirements.txt
if errorlevel 1 (
  echo Failed to install backend dependencies.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing frontend dependencies...
  call npm install
  if errorlevel 1 (
    echo Failed to install frontend dependencies.
    pause
    exit /b 1
  )
) else (
  echo Frontend dependencies already installed.
)

echo.
echo Starting backend at http://127.0.0.1:8000 ...
start "Band Gap Predictor Backend" /D "%~dp0" cmd /k ".venv\Scripts\python.exe -m uvicorn backend.app:app --host 127.0.0.1 --port 8000"

echo Starting frontend at http://localhost:5173 ...
start "Band Gap Predictor Frontend" /D "%~dp0" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo Done. Keep the two server windows open while using the app.
echo Close those windows to stop the app.
echo.
pause
