<h1 align="center">
  <a href="https://github.com/JesKwek/SPRITEVisu/tree/main">
    <img src="SPRITEVisu/src/app/favicon.ico" alt="Logo" width="25" height="25">
    <b>SPRITEVisu</b>
  </a>
  
</h1>

<div align="center">
  Coming Soon
  <br />
  <br />
  <a href="https://github.com/JesKwek/SPRITEVisu/issues">Report a Bug</a>
  ·
  <a href="https://github.com/JesKwek/SPRITEVisu/issues">Request a Feature</a>
  .
  <a href="https://github.com/JesKwek/SPRITEVisu/issues">Ask a Question</a>
</div>

<br />

## SPRITEVisu Installation Guide
<details>
  <summary><strong>Method 1: Scripted Installation (Quick and Easy)</strong></summary>
</details>
  

<details>
  <summary><strong>Method 2: Manual Installation</strong></summary>

This guide provides step-by-step instructions for manually setting up the SPRITEVisu web software on your local machine.

### Prerequisites

Before you start, ensure that you have the following installed:

- **Node.js** (version 14 or higher) - [Download Node.js](https://nodejs.org/)
- **Python** (version 3.8 or higher) - [Download Python](https://www.python.org/downloads/)

### Step 1: Clone the Repository

First, clone the SPRITEVisu repository to your local machine:

```bash
git clone https://github.com/JesKwek/SPRITEVisu.git
```

### Step 2: Install Frontend Dependencies

Navigate to the frontend directory `SPRITEVisu-frontend` and install the required Node.js packages: 

```bash
cd SPRITEVisu-frontend
npm install
```

### Step 3: Install Backend Dependencies

Next, navigate to the backend directory `SPRITEVisu-server` and install the required Python packages:

```
cd ../SPRITEVisu-server
pip install -r requirements.txt
```
### Step 4: Start the Frontend Server

Go back to the frontend directory and start the Next.js development server:

```
cd ../SPRITEVisu
npm run dev
```

The frontend server should now be running at http://localhost:3000.

### Step 5: Start the Backend Server

In a new terminal window, navigate to the backend directory and start the Flask server:

```
cd SPRITEVisu-server
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
