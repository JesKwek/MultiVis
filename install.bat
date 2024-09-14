@echo off
REM Get the directory of the script
SET "SCRIPT_DIR=%~dp0"

REM Change to the script's directory
cd /d "%SCRIPT_DIR%"

REM Function to check if a command exists (for Windows)
where python >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Python 3 is not installed. Please install Python 3 to continue.
    pause
    exit /b 1
)

REM Check if pip is installed
where pip >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo pip is not installed. Installing pip...
    curl -o get-pip.py https://bootstrap.pypa.io/get-pip.py
    python get-pip.py
    del get-pip.py
)

REM Install required Python packages
echo Installing required packages from requirements.txt...
pip install -r requirements.txt

REM Check if Node.js and npm are installed
where node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Node.js or npm is not installed. Please install Node.js and npm to continue.
    pause
    exit /b 1
)

REM Navigate to the sprite-box directory and run npm install
echo Navigating to sprite-box directory...
cd sprite-box
echo Running npm install in sprite-box...
npm install

REM Go back to the initial directory
cd ..

echo Setup complete.
pause
