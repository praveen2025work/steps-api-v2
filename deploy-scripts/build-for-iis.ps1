# PowerShell script for building STEPS Application for IIS Deployment
Write-Host "Building STEPS Application for IIS Deployment..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js 20.x from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm is not available" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Copy production environment variables to root directory
Write-Host ""
Write-Host "Setting up production environment variables..." -ForegroundColor Yellow

if (Test-Path "deploy-scripts\.env.production") {
    Copy-Item "deploy-scripts\.env.production" ".env.production" -Force
    Write-Host "Production environment variables copied successfully." -ForegroundColor Green
    
    # Display the environment variables being used
    Write-Host ""
    Write-Host "Environment variables being used:" -ForegroundColor Cyan
    Get-Content "deploy-scripts\.env.production" | Where-Object { $_ -match "^NEXT_PUBLIC_" } | ForEach-Object {
        Write-Host "  $_" -ForegroundColor Gray
    }
} else {
    Write-Host "WARNING: deploy-scripts\.env.production not found!" -ForegroundColor Red
    Write-Host "Please ensure you have updated the API endpoints in deploy-scripts\.env.production" -ForegroundColor Yellow
    Read-Host "Press Enter to continue anyway"
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "Dependencies installed successfully." -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to install dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Building application with production environment..." -ForegroundColor Yellow
$env:NODE_ENV = "production"

try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "Build completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Clean up - remove the copied .env.production file
if (Test-Path ".env.production") {
    Remove-Item ".env.production" -Force
    Write-Host "Cleaned up temporary environment file." -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Build completed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Static files are available in the 'out' folder" -ForegroundColor Cyan
Write-Host "Copy the contents of the 'out' folder to your IIS website directory" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment checklist:" -ForegroundColor Yellow
Write-Host "1. Copy all files from 'out' folder to your IIS website directory" -ForegroundColor White
Write-Host "2. Copy deploy-scripts\web.config to your IIS website directory" -ForegroundColor White
Write-Host "3. Ensure URL Rewrite Module is installed on IIS" -ForegroundColor White
Write-Host "4. Test the application and API connectivity" -ForegroundColor White
Write-Host ""
Write-Host "Your API endpoints from deploy-scripts\.env.production have been" -ForegroundColor Green
Write-Host "baked into the static files during the build process." -ForegroundColor Green
Write-Host ""

# Show the out folder contents
if (Test-Path "out") {
    Write-Host "Contents of 'out' folder:" -ForegroundColor Cyan
    Get-ChildItem "out" | Select-Object Name, Length, LastWriteTime | Format-Table -AutoSize
}

Read-Host "Press Enter to exit"