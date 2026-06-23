@echo off
cd /d "C:\Users\User\.gemini\antigravity\scratch\JogoDebora"
taskkill /F /IM python.exe /T 2>nul
echo Servidor finalizado. Aguardando para reiniciar...
timeout /t 1 >nul
start "" http://localhost:8080/
python -m http.server 8080
