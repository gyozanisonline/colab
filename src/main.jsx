import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// import './index.css' // We can skip global CSS if we want to inherit or use modules

try {
    const rootElement = document.getElementById('react-root');

    if (!rootElement) {
        console.error('[React] CRITICAL: react-root element not found in DOM!');
        console.error('[React] Available elements:', document.body.innerHTML.substring(0, 500));
    } else {
        console.log('[React] Mounting to react-root element...');
        ReactDOM.createRoot(rootElement).render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
        console.log('[React] Successfully mounted!');
    }
} catch (error) {
    console.error('[React] Mounting failed with error:', error);
    console.error('[React] Stack:', error.stack);
}
