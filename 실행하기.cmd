@echo off
chcp 65001 >nul
set "APPDIR=%~dp0프로그램"
if not exist "%APPDIR%\server.js" (
  echo 프로그램 폴더를 찾을 수 없습니다: "%APPDIR%"
  echo 압축을 모두 풀었는지, 실행하기.cmd가 프로그램 폴더와 같은 위치에 있는지 확인하세요.
  pause
  exit /b 1
)
cd /d "%APPDIR%"

where node >nul 2>nul
if not errorlevel 1 goto haveNode
if exist "%ProgramW6432%\nodejs\node.exe" set "PATH=%ProgramW6432%\nodejs;%PATH%" & goto haveNode
if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%ProgramFiles%\nodejs;%PATH%" & goto haveNode
if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "PATH=%ProgramFiles(x86)%\nodejs;%PATH%" & goto haveNode
if exist "%LocalAppData%\Programs\nodejs\node.exe" set "PATH=%LocalAppData%\Programs\nodejs;%PATH%" & goto haveNode
goto noNode

:noNode
echo.
echo Node.js가 설치되어 있지 않습니다. 이 프로그램은 Node.js LTS가 필요합니다.
echo 다운로드 주소: https://nodejs.org/ko/download
echo.
choice /C YN /M "다운로드 페이지를 브라우저에서 열까요"
if errorlevel 2 goto noNodeDone
start "" "https://nodejs.org/ko/download"

:noNodeDone
echo.
echo Node.js를 설치한 뒤 이 실행하기.cmd를 다시 실행하세요.
pause
exit /b 1

:haveNode
if not exist "node_modules\kor-lunar" goto installDeps
if not exist "node_modules\lunar-javascript" goto installDeps
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
del "%APPDIR%\server.log" >nul 2>nul
start "사주 서버" /min cmd /c ""%NODE_EXEC%" "%APPDIR%\server.js" > "%APPDIR%\server.log" 2>&1"
set "WAIT=0"

:waitServer
powershell -NoProfile -Command "try { Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 http://127.0.0.1:%PORT%/ | Out-Null; exit 0 } catch { exit 1 }" >nul 2>nul
if not errorlevel 1 goto serverReady
set /a WAIT+=1
if %WAIT% GEQ 20 goto serverFailed
ping -n 2 127.0.0.1 >nul
goto waitServer

:serverReady
start "" "http://127.0.0.1:%PORT%"
echo 사주 프로그램을 열었습니다. 사주 서버 창은 브라우저 탭을 모두 닫으면 10초 뒤 자동으로 닫힙니다.
exit /b 0

:serverFailed
echo 서버를 시작하지 못했습니다. 아래 로그를 확인하세요.
echo 로그 파일: "%APPDIR%\server.log"
if exist "%APPDIR%\server.log" type "%APPDIR%\server.log"
pause
exit /b 1
