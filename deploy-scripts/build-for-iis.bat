@echo off
echo Building STEPS Application for IIS Deployment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 20.x from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

REM Copy production environment variables to root directory
echo Setting up production environment variables...
if exist "deploy-scripts\.env.production" (
    copy "deploy-scripts\.env.production" ".env.production" >nul
    echo Production environment variables copied successfully.
) else (
    echo WARNING: deploy-scripts\.env.production not found!
    echo Please ensure you have updated the API endpoints in deploy-scripts\.env.production
    pause
)

echo.
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Building application with production environment...
set NODE_ENV=production
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

REM Clean up - remove the copied .env.production file
if exist ".env.production" (
    del ".env.production" >nul
    echo Cleaned up temporary environment file.
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Static files are available in the 'out' folder
echo Copy the contents of the 'out' folder to your IIS website directory
echo.
echo Deployment checklist:
echo 1. Copy all files from 'out' folder to your IIS website directory
echo 2. Copy deploy-scripts\web.config to your IIS website directory
echo 3. Ensure URL Rewrite Module is installed on IIS
echo 4. Test the application and API connectivity
echo.
echo Your API endpoints from deploy-scripts\.env.production have been
echo baked into the static files during the build process.
echo.
pause