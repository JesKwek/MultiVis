#!/bin/bash

cd "$(dirname "$0")"

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python 3 is installed
if ! command_exists python3; then
    echo "Python 3 is not installed. Please install Python 3 to continue."
    exit 1
fi

# Check if pip is installed
if ! command_exists pip3; then
    echo "pip is not installed. Installing pip..."
    curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
    python3 get-pip.py
    rm get-pip.py
fi

# Install required packages
echo "Installing required packages from requirements.txt..."
pip install -r ./requirements.txt


# Check if Node.js and npm are installed
if ! command_exists node || ! command_exists npm; then
    echo "Node.js or npm is not installed. Please install Node.js and npm to continue."
    exit 1
fi

# Navigate to the MultiVis-frontend directory and run npm install
echo "Navigating to MultiVis-frontend directory..."
cd MultiVis-frontend
echo "Running npm install in MultiVis-frontend..."
npm install
cd ..

echo "Setup complete."