<#
.SYNOPSIS
    Deploys STEPS Next.js application to IIS server

.DESCRIPTION
    This script automates the deployment of the STEPS application to an IIS server.
    It supports both static export and iisnode deployment methods.

.PARAMETER DeploymentType
    Type of deployment: "static" or "iisnode"

.PARAMETER IISPath
    Path to the IIS website directory (e.g., "C:\inetpub\wwwroot\steps")

.PARAMETER SiteName
    Name of the IIS site (optional, for creating new site)

.PARAMETER BackupExisting
    Whether to backup existing deployment before deploying new version

.EXAMPLE
    .\Deploy-ToIIS.ps1 -DeploymentType "static" -IISPath "C:\inetpub\wwwroot\steps"

.EXAMPLE
    .\Deploy-ToIIS.ps1 -DeploymentType "iisnode" -IISPath "C:\inetpub\wwwroot\steps" -SiteName "STEPS-App"
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("static", "iisnode")]
    [string]$DeploymentType,
    
    [Parameter(Mandatory=$true)]
    [string]$IISPath,
    
    [Parameter(Mandatory=$false)]
    [string]$SiteName,
    
    [Parameter(Mandatory=$false)]
    [bool]$BackupExisting = $true
)

# Function to write colored output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Main deployment function
function Deploy-Application {
    Write-ColorOutput Green "Starting STEPS Application Deployment..."
    Write-ColorOutput Yellow "Deployment Type: $DeploymentType"
    Write-ColorOutput Yellow "Target Path: $IISPath"
    
    # Check if running as administrator
    if (-not (Test-Administrator)) {
        Write-ColorOutput Red "This script must be run as Administrator!"
        exit 1
    }
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version
        Write-ColorOutput Green "Node.js version: $nodeVersion"
    } catch {
        Write-ColorOutput Red "Node.js is not installed or not in PATH!"
        exit 1
    }
    
    # Check if npm is available
    try {
        $npmVersion = npm --version
        Write-ColorOutput Green "npm version: $npmVersion"
    } catch {
        Write-ColorOutput Red "npm is not available!"
        exit 1
    }
    
    # Install dependencies
    Write-ColorOutput Yellow "Installing dependencies..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Failed to install dependencies!"
        exit 1
    }
    
    # Build application
    Write-ColorOutput Yellow "Building application..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Build failed!"
        exit 1
    }
    
    # Create backup if requested
    if ($BackupExisting -and (Test-Path $IISPath)) {
        $backupPath = "$IISPath-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Write-ColorOutput Yellow "Creating backup at: $backupPath"
        Copy-Item -Path $IISPath -Destination $backupPath -Recurse -Force
    }
    
    # Create target directory if it doesn't exist
    if (-not (Test-Path $IISPath)) {
        Write-ColorOutput Yellow "Creating target directory: $IISPath"
        New-Item -ItemType Directory -Path $IISPath -Force
    }
    
    # Deploy based on type
    if ($DeploymentType -eq "static") {
        Deploy-Static
    } elseif ($DeploymentType -eq "iisnode") {
        Deploy-IISNode
    }
    
    Write-ColorOutput Green "Deployment completed successfully!"
    Write-ColorOutput Yellow "Don't forget to:"
    Write-ColorOutput Yellow "1. Configure environment variables"
    Write-ColorOutput Yellow "2. Update API endpoints for production"
    Write-ColorOutput Yellow "3. Configure SSL certificate"
    Write-ColorOutput Yellow "4. Test the application"
}

# Static deployment function
function Deploy-Static {
    Write-ColorOutput Yellow "Deploying static files..."
    
    # Check if out folder exists
    if (-not (Test-Path "out")) {
        Write-ColorOutput Red "Static export folder 'out' not found! Make sure the build completed successfully."
        exit 1
    }
    
    # Clear existing files (except backup)
    Write-ColorOutput Yellow "Clearing existing files..."
    Get-ChildItem -Path $IISPath -Exclude "*backup*" | Remove-Item -Recurse -Force
    
    # Copy static files
    Write-ColorOutput Yellow "Copying static files..."
    Copy-Item -Path "out\*" -Destination $IISPath -Recurse -Force
    
    # Copy web.config
    Write-ColorOutput Yellow "Copying web.config..."
    Copy-Item -Path "deploy-scripts\web.config" -Destination $IISPath -Force
    
    # Copy environment file if it exists
    if (Test-Path "deploy-scripts\.env.production") {
        Copy-Item -Path "deploy-scripts\.env.production" -Destination "$IISPath\.env" -Force
    }
    
    Write-ColorOutput Green "Static deployment completed!"
}

# IISNode deployment function
function Deploy-IISNode {
    Write-ColorOutput Yellow "Deploying for iisnode..."
    
    # Check if iisnode is installed
    $iisnode = Get-WindowsFeature -Name "IIS-ASPNET45" -ErrorAction SilentlyContinue
    if (-not $iisnode) {
        Write-ColorOutput Red "iisnode might not be installed. Please install iisnode first."
    }
    
    # Clear existing files (except node_modules and backup)
    Write-ColorOutput Yellow "Clearing existing files..."
    Get-ChildItem -Path $IISPath -Exclude "node_modules", "*backup*" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
    
    # Copy application files
    Write-ColorOutput Yellow "Copying application files..."
    $excludeItems = @("node_modules", "out", ".git", ".next", "deploy-scripts")
    Get-ChildItem -Path "." -Exclude $excludeItems | Copy-Item -Destination $IISPath -Recurse -Force
    
    # Copy deployment files
    Copy-Item -Path "deploy-scripts\server.js" -Destination $IISPath -Force
    Copy-Item -Path "deploy-scripts\iisnode-web.config" -Destination "$IISPath\web.config" -Force
    Copy-Item -Path "deploy-scripts\iisnode.yml" -Destination $IISPath -Force
    
    # Copy environment file
    if (Test-Path "deploy-scripts\.env.production") {
        Copy-Item -Path "deploy-scripts\.env.production" -Destination "$IISPath\.env" -Force
    }
    
    # Install production dependencies on server
    Write-ColorOutput Yellow "Installing production dependencies on server..."
    Push-Location $IISPath
    npm install --production
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput Red "Failed to install production dependencies!"
        Pop-Location
        exit 1
    }
    Pop-Location
    
    Write-ColorOutput Green "iisnode deployment completed!"
}

# Create IIS site if specified
function Create-IISSite {
    if ($SiteName) {
        Write-ColorOutput Yellow "Creating IIS site: $SiteName"
        
        # Import WebAdministration module
        Import-Module WebAdministration -ErrorAction SilentlyContinue
        
        # Check if site already exists
        if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
            Write-ColorOutput Yellow "Site $SiteName already exists. Updating path..."
            Set-ItemProperty -Path "IIS:\Sites\$SiteName" -Name physicalPath -Value $IISPath
        } else {
            # Create new site
            New-Website -Name $SiteName -PhysicalPath $IISPath -Port 80
            Write-ColorOutput Green "Created IIS site: $SiteName"
        }
    }
}

# Run deployment
try {
    Deploy-Application
    Create-IISSite
} catch {
    Write-ColorOutput Red "Deployment failed: $($_.Exception.Message)"
    exit 1
}