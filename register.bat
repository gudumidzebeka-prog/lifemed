@echo off
cd /d "%~dp0"
echo LifeMed - Supabase project registration helper
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo ERROR: npm not found. Install Node.js 18+ from https://nodejs.org
  pause
  exit /b 1
)

if not exist ".env.local" (
  echo Creating .env.local from .env.example...
  copy /Y ".env.example" ".env.local" >nul
  echo Done. Edit .env.local with your Supabase keys.
) else (
  echo .env.local already exists.
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

echo.
echo Next steps:
echo 1. Open https://supabase.com/dashboard and create a project named "LifeMed"
echo 2. Settings -^> API: copy URL and anon key into .env.local
echo 3. SQL Editor: run supabase/schema.sql
echo 4. Authentication -^> URL Configuration:
echo    Site URL: http://localhost:3000
echo    Redirect URLs: http://localhost:3000/auth/callback
echo 5. Add SUPABASE_SERVICE_ROLE_KEY for doctor share links
echo 6. Run start.bat
echo.
start https://supabase.com/dashboard
notepad .env.local
pause
