@echo off
echo Downloading setup script...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/your-username/your-repo/main/setup.ps1' -OutFile 'setup.ps1'"
echo Running setup script...
powershell -ExecutionPolicy Bypass -File "setup.ps1"
del "setup.ps1"
pause
