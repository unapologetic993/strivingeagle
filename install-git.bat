@echo off
title Striving Eagle - Git Installation
color 0A
echo.
echo ===========================================
echo   🦅 Striving Eagle - Git Installation
echo ===========================================
echo.

REM Check if Git is already installed
git --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Git is already installed!
    git --version
    echo.
    echo You can skip to Step 2 of deployment guide.
    echo.
    pause
    exit /b
)

echo ❌ Git is not installed. Starting installation...
echo.

REM Download Git installer
echo 📥 Downloading Git for Windows...
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/git-for-windows/git/releases/latest/download/Git-2.43.0-64-bit.exe' -OutFile '%TEMP%\Git-Installer.exe'"

if %errorlevel% neq 0 (
    echo ❌ Failed to download Git installer
    echo Please download manually from: https://git-scm.com/download/win
    pause
    exit /b
)

echo ✅ Download complete!
echo.

REM Run installer
echo 🚀 Installing Git...
echo This may take a few minutes...
echo.

start /wait "" "%TEMP%\Git-Installer.exe"

if %errorlevel% equ 0 (
    echo ✅ Git installation completed!
    echo.
    echo 🔄 Please restart Command Prompt/PowerShell to use Git
    echo.
    echo Press any key to continue...
    pause >nul
) else (
    echo ❌ Installation may have failed
    echo Please run the installer manually if it doesn't open
    echo Installer location: %TEMP%\Git-Installer.exe
    echo.
    pause
)
