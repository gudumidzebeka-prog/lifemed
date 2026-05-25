@echo off
cd /d "%~dp0"

echo LifeMed - starting dev server...
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found. Install Node.js 18+ from https://nodejs.org
  pause
  exit /b 1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo Stopping process on port 3000: %%a
  taskkill /F /PID %%a >nul 2>&1
)

if not exist "node_modules\" (
  echo Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
  )
)

if exist .next (
  echo Removing stale .next cache...
  rmdir /s /q .next
)

echo.
echo Open: http://localhost:3000/setup
echo Open: http://localhost:3000/dashboard
echo.

call npm run dev
pause
