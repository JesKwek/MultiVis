#!/bin/bash

# Change to the directory where the script is located
cd "$(dirname "$0")"

# Navigate to the MultiVis-frontend directory and start the npm dev server
echo "Starting npm dev server in MultiVis-frontend..."
cd MultiVis-frontend
npm run dev &  # Run npm start dev in the background
NPM_PID=$!
cd ..

# Navigate to the MultiVis-server directory and start the Python server
echo "Starting Python server in MultiVis-server..."
cd MultiVis-server
python3 main.py &  # Run the Python server in the background
PYTHON_PID=$!
cd ..

echo "All servers are up and running."
echo "To stop them, use: kill $NPM_PID $PYTHON_PID"

# Wait indefinitely to keep the script running
wait $NPM_PID $PYTHON_PID
