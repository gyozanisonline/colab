# UnifiedApp (Multiplayer)

## Overview
This is a multiplayer web application built with React, Three.js (via React Three Fiber), and Express. It features real-time interaction using Socket.io and 3D graphics.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed (v16 or higher recommended).
- **npm**: Comes with Node.js.

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/gyozanisonline/colab.git
cd TypeGames/UnifiedApp
# Note: If the repo name on disk is different, navigate to the UnifiedApp directory.
```

### 2. Install Dependencies
Navigate to the `UnifiedApp` directory if you haven't already:
```bash
cd UnifiedApp
npm install
```

### 3. Run Development Server
To start both the backend server and the frontend client concurrently:
```bash
npm run dev
```
- The application should open in your browser (usually at `http://localhost:5173`).
- The server runs on port 3000 by default.

## Project Structure
- `src/`: React frontend source code.
- `public/`: Static assets.
- `server.js`: Express backend entry point.
- `vite.config.js`: Vite configuration.
