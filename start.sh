#!/bin/bash

# Change to the directory where the script is located
cd "$(dirname "$0")"

# Navigate to the sprite-box directory and start the npm dev server
echo "Starting npm dev server in sprite-box..."
cd sprite-box
npm run dev &  # Run npm start dev in the background
cd ..

# Navigate to the sprite-box-server directory and start the Python server
echo "Starting Python server in sprite-box-server..."
cd sprite-box-server
python3 main.py &  # Run the Python server in the background
cd ..

echo "All servers are up and running."
