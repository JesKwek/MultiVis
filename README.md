<h1 align="center">
  <a href="https://github.com/JesKwek/SPRITEVisu/tree/main">
    <img src="MultiVis-frontend/src/app/favicon.ico" alt="Logo" width="25" height="25">
    <b>MultiVis</b>
  </a>
  
</h1>


<div align="center">
  <a href="https://github.com/JesKwek/SPRITEVisu/issues">Report a Bug</a>
  ·
  <a href="https://github.com/JesKwek/SPRITEVisu/issues">Request a Feature</a>
  .
  <a href="https://github.com/JesKwek/SPRITEVisu/issues">Ask a Question</a>
</div>

<br />


[![MultiVis Full Tutorial video](https://img.youtube.com/vi/a5YBAw0kY04/0.jpg)](https://www.youtube.com/watch?v=a5YBAw0kY04)

## MultiVis Installation Guide
<details>
  <summary><strong>Method 1: Scripted Installation (Quick and Easy)</strong></summary>

This guide provides step-by-step instructions for setting up the MultiVis web software on your local machine.

### Prerequisites

Before you start, ensure that you have the following installed:

- **Node.js** (version 14 or higher) - [Download Node.js](https://nodejs.org/)
- **Python** (version 3.8 or higher) - [Download Python](https://www.python.org/downloads/)

### Step 1: Clone or download the Repository

First, clone the MultiVis repository to your local machine or download it via here [MultiVis.zip](https://github.com/JesKwek/MultiVis/archive/refs/heads/main.zip):

```bash
git clone https://github.com/JesKwek/MultiVis.git
```

### Step 2: Install Dependencies
Before you start any installation, ensure that you have Node.js and Python. To install the necessary dependencies, follow the steps based on your operating system:

- **MacBook:** Run [install.command](./install.command)
- **Windows:** Run [install.bat](./install.bat)
- **Linux:** Run [install.sh](./install.sh)

Make sure to execute the appropriate script for your platform to ensure all dependencies are installed correctly.

### Step 3: Start the Server
To start the server, use the appropriate command for your operating system:

- **MacBook:** Run [start.command](./start.command)
- **Windows:** Run [start.bat](./start.bat)
- **Linux:** Run [start.sh](./start.sh)

Ensure you execute the correct script for your platform to launch the server successfully.

### Step 4: Go to this address

```
http://localhost:3000
```

</details>


<details>
  <summary><strong>Method 2: Manual Installation</strong></summary>

This guide provides step-by-step instructions for manually setting up the MultiVis web software on your local machine.

### Prerequisites

Before you start, ensure that you have the following installed:

- **Node.js** (version 14 or higher) - [Download Node.js](https://nodejs.org/)
- **Python** (version 3.8 or higher) - [Download Python](https://www.python.org/downloads/)

### Step 1: Clone the Repository

First, clone the SPRITEVisu repository to your local machine or download it via here [MultiVis.zip](https://github.com/JesKwek/MultiVis/archive/refs/heads/main.zip):

```bash
git clone https://github.com/JesKwek/MultiVis.git
```

### Step 2: Install Frontend Dependencies

Navigate to the frontend directory `MultiVis-frontend` and install the required Node.js packages: 

```bash
cd MultiVis-frontend
npm install
```

### Step 3: Install Backend Dependencies

Next, navigate to the backend directory `MultiVis-server` and install the required Python packages:

```
cd ..
pip install -r requirements.txt
```
### Step 4: Start the Frontend Server

Go back to the frontend directory and start the Next.js development server:

```
cd ../MultiVis-server
npm run dev
```

The frontend server should now be running at http://localhost:3000.

### Step 5: Start the Backend Server

In a new terminal window, navigate to the backend directory and start the Flask server:

```
cd MultiVis-server
python main.py
```

The backend server should now be running at http://localhost:5000.

### Step 6: Go to this address

```
http://localhost:3000
```

</details>

## Additional Notes
- Ensure both the frontend and backend servers are running simultaneously for the application to function correctly.
- You can customize the ports or other configurations by modifying the respective configuration files in the project.
