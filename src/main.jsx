import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// import './index.css' // We can skip global CSS if we want to inherit or use modules

ReactDOM.createRoot(document.getElementById('react-root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
