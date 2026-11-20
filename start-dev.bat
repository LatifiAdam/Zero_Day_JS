@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  echo Installing project dependencies...
  call npm install
  if errorlevel 1 (
    echo Dependency installation failed. Check your Node.js/npm installation and internet connection.
    pause
    exit /b 1
  )
)
call npm run dev
pause
