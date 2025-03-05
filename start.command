#!/bin/bash

# Change to the directory where the script is located
cd "$(dirname "$0")"

# Navigate to the MultiVis-frontend directory and start the npm dev server
echo "Starting npm dev server in MultiVis-frontend..."
cd MultiVis-frontend
npm run dev &  # Run npm start dev in the background
NPM_PID=$!
cd ..

# Start the Python server in a new macOS Terminal window
echo "Starting Python server in MultiVis-server..."
osascript -e "tell application \"Terminal\" to do script \"cd '$(pwd)/MultiVis-server' && python3 main.py\""

echo "All servers are up and running."
echo "To stop them, use: kill $NPM_PID"

# Wait indefinitely to keep the script running
wait $NPM_PID