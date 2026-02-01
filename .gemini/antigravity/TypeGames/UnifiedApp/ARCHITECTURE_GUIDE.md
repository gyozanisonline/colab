# Architecture Guide: React + Legacy p5.js Integration

This application is a hybrid system that combines a modern React frontend with a legacy p5.js visual engine. This guide explains how they interact and how to add new pages or features without breaking the existing functionality.

## 1. The Gateway: `src/App.jsx`

The React application acts as the "Gateway" and state manager. It decides what is currently visible on the screen.

### App States (`activeApp`)
The app uses an `activeApp` state to determine which "mode" the application is in:
- `intro`: The initial landing screen (name/color selection)
- `typeflow`: The main TypeFlow app (React UI + p5.js canvas)
- `community`: The community gallery (React component)

### Event System (`app-changed`)
When the `activeApp` state changes in React, it dispatches a custom window event:
```javascript
window.dispatchEvent(new CustomEvent('app-changed', { detail: { app: 'intro' } }));
```
This is CRITICAL because the legacy non-React code (p5.js, main.js) listens for this event to know when to show/hide itself.

## 2. The Legacy Controller: `public/js/main.js`

`main.js` contains the logic for the legacy TypeFlow application (the controls, sliders, inputs). It listens for the `app-changed` event to manage visibility.

### How to Add a New Page/App Mode

If you want to add a new "page" (e.g., a "3D Playground" mode), follow these steps:

#### Step 1: Update React (`src/App.jsx`)
1. Add a new state value for your app (e.g., `'playground'`).
2. Add a condition to render your React component:
   ```jsx
   {activeApp === 'playground' && <PlaygroundComponent />}
   ```
3. Add a way to switch to this app (e.g., a button in `Navigation.jsx`) that calls `onSwitchApp('playground')`.

#### Step 2: Update Legacy Controller (`public/js/main.js`)
Go to the `window.addEventListener('app-changed', ...)` block and update the logic:

```javascript
window.addEventListener('app-changed', (e) => {
    const appId = e.detail.app;
    
    // Get ALL UI elements that belong to the main TypeFlow app
    const uiOverlay = document.getElementById('ui-overlay'); // Wrapper
    const chatContainer = document.getElementById('chat-container');
    const header = document.querySelector('header');
    // ... get other elements by ID

    if (appId === 'typeflow') {
        // SHOW everything
        if (chatContainer) chatContainer.style.display = 'block';
        if (header) header.style.display = 'block';
        // ...
    } else {
        // HIDE everything so your new page has a clean slate
        if (chatContainer) chatContainer.style.display = 'none';
        if (header) header.style.display = 'none';
        // ...
    }
});
```

### Important: Initial Load Logic

When the app first loads, **React renders first**. The `IntroScreen` will be visible immediately. 
`main.js` runs on `DOMContentLoaded`, but it must be **defensive**.

- **Do NOT** assume DOM elements exist immediately.
- **Do NOT** try to `app.init()` if the intro is showing (UI elements won't exist).
- Use the defensive pattern in `main.js`:
  ```javascript
  document.addEventListener('DOMContentLoaded', () => {
      // Check if critical UI element exists
      if (document.getElementById('some-critical-ui')) {
          app.init();
      } else {
          // Wait for intros to finish
          window.addEventListener('app-changed', (e) => {
               if (e.detail.app === 'typeflow') app.init();
          });
      }
  });
  ```

## 3. Z-Index Layering

The `index.html` file defines the stacking order:

1. **`#react-root`** (z-index: 0) - Where React components live (Intro, Silk background, etc.)
2. **`#canvas-background`** (z-index: 0) - The legacy p5.js background canvas
3. **`#canvas-type`** (z-index: 1) - The main type canvas
4. **`#ui-overlay`** (z-index: 10) - The main HTML UI

If you add a new full-screen React component, ensure it has a high enough Z-Index or that the `#ui-overlay` is hidden via `display: none` using the `app-changed` event logic described above.
