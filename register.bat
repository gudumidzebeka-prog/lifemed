@echo off
cd /d "%~dp0"
echo LifeMed - Supabase project registration helper
echo.

if not exist ".env.local" (
  echo Creating .env.local from .env.example...
  copy /Y ".env.example" ".env.local" >nul
  echo Done. Edit .env.local with your Supabase keys.
) else (
  echo .env.local already exists.
)

echo.
echo Next steps:
echo 1. Open https://supabase.com/dashboard and create a project named "LifeMed"
echo 2. Settings -^> API: copy URL and anon key into .env.local
echo 3. SQL Editor: run supabase/schema.sql
echo 4. Authentication -^> URL Configuration: add http://localhost:3000/auth/callback
echo 5. Run start.bat
echo.
start https://supabase.com/dashboard
notepad .env.local
pause
