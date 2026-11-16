@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (echo Node.js is required. & pause & exit /b 1)
if not exist "node_modules\kor-lunar" (echo Run npm install first. & pause & exit /b 1)
set "PORT=3210"
set "OLDPID="
for /f "tokens=5" %%p in ('netstat -ano ^| findstr /R /C:"127.0.0.1:%PORT% .*LISTENING"') do set "OLDPID=%%p"
if defined OLDPID (
  echo Port %PORT% is already in use by PID %OLDPID%:
  tasklist /FI "PID eq %OLDPID%"
  choice /C YN /M "Stop that process and start a new server"
  if errorlevel 2 (echo Not stopped. & pause & exit /b 1)
  taskkill /PID %OLDPID% /F
  timeout /t 2 /nobreak >nul
)
set "SAJU_PORT=%PORT%"
echo Server runs in this window. Closing this window or pressing Ctrl+C stops the server.
start "" "http://127.0.0.1:%PORT%"
node server.js
echo Server stopped.
pause
