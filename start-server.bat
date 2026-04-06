@echo off
echo Starting local server...
echo Server will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

cd /d "%~dp0"

REM Try Python first
python -m http.server 8000 2>nul
if %errorlevel% neq 0 (
    echo Python not found, trying Python3...
    python3 -m http.server 8000 2>nul
    if %errorlevel% neq 0 (
        echo Python3 not found, trying Node.js...
        npx http-server -p 8000 2>nul
        if %errorlevel% neq 0 (
            echo No server found. Please install Python or Node.js
            echo Or simply open index.html directly in your browser
            pause
        )
    )
)
