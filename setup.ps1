# PowerShell Setup Script for NEXUS Security Grid

# Function to check if a command is available
function Test-CommandExists {
    param($command)
    Get-Command $command -ErrorAction SilentlyContinue
}

# --- Dependency Checks ---
Write-Host "Checking for required dependencies..."

# Check for Docker
if (-not (Test-CommandExists docker)) {
    Write-Host "Docker not found. Please install Docker Desktop and ensure it's running."
    # Optional: Attempt to start Docker Desktop
    if (Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe") {
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    }
    exit 1
}

# Check for Node.js
if (-not (Test-CommandExists node)) {
    Write-Host "Node.js not found. Please install Node.js."
    # Optional: Open download page
    Start-Process "https://nodejs.org/"
    exit 1
}

# Check for OpenSSL
if (-not (Test-CommandExists openssl)) {
    Write-Host "OpenSSL not found. Please install OpenSSL and add it to your PATH."
    # Optional: Open download page
    Start-Process "https://slproweb.com/products/Win32OpenSSL.html"
    exit 1
}

Write-Host "All dependencies are installed."

# --- Certificate Generation ---
Write-Host "Generating SSL certificates..."
if (-not (Test-Path -Path "./certs")) {
    New-Item -ItemType Directory -Path "./certs"
}
openssl req -x509 -newkey rsa:4096 -keyout ./certs/key.pem -out ./certs/cert.pem -sha256 -days 365 -nodes -subj "/CN=localhost"

# --- Environment File ---
Write-Host "Creating .env file..."
if (-not (Test-Path -Path "./.env")) {
    Copy-Item -Path "./.env.example" -Destination "./.env"
}

Write-Host "Building and launching Docker containers..."
docker-compose up -d --build

Write-Host "NEXUS Security Grid is now running."
Write-Host "You can access the dashboard at https://localhost"
Read-Host -Prompt "Press Enter to exit"
