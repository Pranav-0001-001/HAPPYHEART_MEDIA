@echo off
title HAPPY HEART MEDIA - Server Launcher
echo ========================================================
echo   Launching HAPPY HEART MEDIA Backend Server...
echo   "Websites That Work. Ads That Grow."
echo   Instagram: @HAPPYHEART_MEDIA
echo ========================================================
echo.
echo   Starting server on http://localhost:3000
echo   Admin Dashboard: http://localhost:3000/admin.html
echo   Press Ctrl+C to stop the server
echo.
echo ========================================================
cd /d "%~dp0"
start "" "http://localhost:3000"
node server.js
pause
