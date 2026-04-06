# Git Installation Script for Windows
# This script will automatically download and install Git

Write-Host "🦅 Striving Eagle - Git Installation Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Check if Git is already installed
try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "✅ Git is already installed!" -ForegroundColor Green
        Write-Host "Version: $gitVersion" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "You can skip to Step 2 of deployment guide." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Press any key to continue..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit
    }
} catch {
    Write-Host "❌ Git is not installed. Starting installation..." -ForegroundColor Yellow
}

# Download Git installer
Write-Host "📥 Downloading Git for Windows..." -ForegroundColor Cyan
$gitUrl = "https://github.com/git-for-windows/git/releases/latest/download/Git-2.43.0-64-bit.exe"
$installerPath = "$env:TEMP\Git-Installer.exe"

try {
    Invoke-WebRequest -Uri $gitUrl -OutFile $installerPath
    Write-Host "✅ Download complete!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to download Git installer" -ForegroundColor Red
    Write-Host "Please download manually from: https://git-scm.com/download/win" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

# Run installer
Write-Host "🚀 Installing Git..." -ForegroundColor Cyan
Write-Host "This may take a few minutes..." -ForegroundColor Gray
Write-Host ""

try {
    Start-Process -FilePath $installerPath -Wait -PassThru
    Write-Host "✅ Git installation completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔄 Restarting PowerShell with Git..." -ForegroundColor Cyan
    
    # Restart PowerShell with Git in PATH
    Start-Sleep -Seconds 3
    Start-Process powershell.exe -ArgumentList "-NoProfile", "-Command", "Write-Host '✅ Git is now available! Run git --version to verify.' -ForegroundColor Green; Write-Host ''; Write-Host 'Press any key to continue...' -ForegroundColor Gray; $null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')"
    
} catch {
    Write-Host "❌ Installation failed" -ForegroundColor Red
    Write-Host "Please run the installer manually" -ForegroundColor Yellow
    Write-Host "Installer location: $installerPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
