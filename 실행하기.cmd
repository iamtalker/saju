@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if not errorlevel 1 goto haveNode
if exist "%ProgramW6432%\nodejs\node.exe" (
  set "PATH=%ProgramW6432%\nodejs;%PATH%"
  goto haveNode
)
if exist "%ProgramFiles%\nodejs\node.exe" (
  set "PATH=%ProgramFiles%\nodejs;%PATH%"
  goto haveNode
)
if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
  set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
  goto haveNode
)
if exist "%LocalAppData%\Programs\nodejs\node.exe" (
  set "PATH=%LocalAppData%\Programs\nodejs;%PATH%"
  goto haveNode
)
goto installNode

:installNode
echo Node.js LTS가 없어 공식 설치 파일을 내려받아 설치합니다.
choice /C YN /M "Node.js LTS를 설치하고 프로그램을 계속 실행할까요"
if errorlevel 2 goto installCancelled
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0설치_Node.js.ps1"
if errorlevel 1 goto installFailed
if exist "%ProgramW6432%\nodejs\node.exe" set "PATH=%ProgramW6432%\nodejs;%PATH%"
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%"
if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%"
where node >nul 2>nul
if errorlevel 1 goto installFailed

:haveNode
if not exist "node_modules\kor-lunar" goto installDeps
goto run

:installDeps
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
for /f "delims=" %%n in ('where node') do if not defined NODE_EXEC set "NODE_EXEC=%%n"
start "" "%SystemRoot%\System32\wscript.exe" //B //NoLogo "%~dp0실행하기_숨김.vbs" "%NODE_EXEC%" "%~dp0server.js" "%PORT%"
exit /b 0

:installFailed
echo Node.js LTS 자동 설치에 실패했습니다. 인터넷 연결과 설치 권한을 확인한 뒤 다시 실행해 주세요.
echo https://nodejs.org/ko/download
pause
exit /b 1

:installCancelled
echo 설치를 취소했습니다. Node.js를 설치한 뒤 다시 실행할 수 있습니다.
exit /b 0
