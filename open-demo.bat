@echo off
cd /d "%~dp0"
echo LifeMed - open demo pages (server must already be running via start.bat)
echo.
start http://localhost:3000/setup
start http://localhost:3000/dashboard
pause
