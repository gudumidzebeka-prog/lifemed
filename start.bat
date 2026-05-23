@echo off

cd /d "%~dp0"

echo LifeMed - cleaning and starting dev server...

echo.



for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000" ^| findstr "LISTENING"') do (

  echo Stopping process on port 3000: %%a

  taskkill /F /PID %%a >nul 2>&1

)



if exist .next (

  echo Removing stale .next cache...

  rmdir /s /q .next

)



echo.

echo Open: http://localhost:3000/dashboard

echo.

"C:\Program Files\nodejs\npm.cmd" run dev

pause

