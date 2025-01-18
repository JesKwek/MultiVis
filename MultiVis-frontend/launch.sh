#!/bin/bash

# Function to check if a command exists
command_exists () {
  type "$1" &> /dev/null ;
}

# Check if Node.js is installed
if command_exists node; then
  echo "Node.js is already installed."
else
  echo "Node.js is not installed. Installing Node.js..."

  # Determine OS and architecture
  OS="$(uname -s)"
  ARCH="$(uname -m)"
  
  # Set the appropriate download URL for Node.js
  case $OS in
    Linux)
      NODE_DISTRO="linux"
      ;;
    Darwin)
      NODE_DISTRO="darwin"
      ;;
    *)
      echo "Unsupported OS: $OS"
      exit 1
      ;;
  esac
  
  case $ARCH in
    x86_64)
      NODE_ARCH="x64"
      ;;
    *)
      echo "Unsupported architecture: $ARCH"
      exit 1
      ;;
  esac
  
  # Download and install Node.js
  NODE_VERSION="16.13.1"
  NODE_FILENAME="node-v$NODE_VERSION-$NODE_DISTRO-$NODE_ARCH.tar.xz"
  NODE_URL="https://nodejs.org/dist/v$NODE_VERSION/$NODE_FILENAME"
  
  echo "Downloading Node.js from $NODE_URL..."
  curl -O $NODE_URL
  
  echo "Extracting Node.js..."
  tar -xf $NODE_FILENAME
  
  echo "Installing Node.js..."
  sudo mv "node-v$NODE_VERSION-$NODE_DISTRO-$NODE_ARCH" /usr/local/nodejs
  
  # Add Node.js to PATH
  export PATH="/usr/local/nodejs/bin:$PATH"
  echo 'export PATH="/usr/local/nodejs/bin:$PATH"' >> ~/.profile
  source ~/.profile
fi

# Run npm install
echo "Running npm install..."
npm install

# Run npm start
echo "Starting application..."
npm run build

npm install -g serve
serve -s build


