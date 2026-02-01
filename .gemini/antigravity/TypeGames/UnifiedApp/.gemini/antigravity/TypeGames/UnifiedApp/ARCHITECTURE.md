# Project Architecture

## Tech Stack
- **Frontend**: React (Vite), React Three Fiber (Three.js)
- **Backend**: Express.js (Node.js)
- **Communication**: Socket.io for real-time multiplayer state
- **State Management**: React State & Leva (for controls)

## Key Directories
- `src/`: Contains all frontend logic.
  - `components/`: Reusable React components.
  - `App.jsx`: Main entry point for the React app.
- `public/`: Static assets (models, textures, etc.).
- `server.js`: The backend server handling socket connections and serving static files in production.

## Data Flow
1.  Clients connect to `server.js` via Socket.io.
2.  State updates (e.g., user positions, interactions) are emitted to the server.
3.  Server broadcasts updates to all connected clients.
4.  React Three Fiber renders the 3D scene based on current state.

## Antigravity / AI Context
- This project uses a **UnifiedApp** structure.
- When making changes, ensure both the visual components (React) and the networking logic (Socket.io) are synchronized.
- Use `npm run dev` to test changes locally.
