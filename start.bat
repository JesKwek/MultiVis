@echo off

REM Get the directory of the script
SET "SCRIPT_DIR=%~dp0"

REM Change to the script's directory
cd /d "%SCRIPT_DIR%"

REM Navigate to the sprite-box directory and start the npm dev server
echo Starting npm dev server in sprite-box...
cd sprite-box
start cmd /c "npm run dev"  REM Run npm start dev in a new command prompt window
cd ..

REM Navigate to the sprite-box-server directory and start the Python server
echo Starting Python server in sprite-box-server...
cd sprite-box-server
start cmd /c "python main.py"  REM Run the Python server in a new command prompt window
cd ..

echo All servers are up and running.
pause
