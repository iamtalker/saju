@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto nonode

:haveNode
if not exist "node_modules\kor-lunar" goto install
goto run

:nonode
echo.
echo Node.js가 설치되어 있지 않습니다. 이 프로그램은 Node.js LTS가 필요합니다.
where winget >nul 2>nul
if errorlevel 1 goto manual
choice /C YN /M "Node.js LTS를 지금 설치할까요 (winget 사용)"
if errorlevel 2 goto manual
winget install -e --id OpenJS.NodeJS.LTS --accept-package-agreements --accept-source-agreements
if errorlevel 1 (echo Node.js 설치가 완료되지 않았습니다. & goto manual)
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 설치는 끝났지만 현재 창에서 인식하지 못합니다. 이 파일을 다시 실행해 주세요.
  pause
  exit /b 0
)
goto haveNode

:manual
echo 아래 주소에서 Node.js LTS를 설치한 뒤 이 파일을 다시 실행하세요.
echo https://nodejs.org/ko/download
pause
exit /b 1

:install
echo 필요한 패키지를 설치합니다. 처음 한 번만 걸립니다.
call npm install
if errorlevel 1 (echo npm install 실패. 인터넷 연결을 확인한 뒤 다시 실행하세요. & pause & exit /b 1)

:run
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
