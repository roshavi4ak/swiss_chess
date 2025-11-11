@echo off
taskkill /F /IM node.exe 2>nul
timeout /t 2
npm run start
pause