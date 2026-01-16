// Inverted Cursor Effect
(function () {
    const cursor = document.getElementById('inverted-cursor');

    if (!cursor) {
        console.warn('Inverted cursor element not found');
        return;
    }

    // Show cursor immediately
    cursor.classList.add('active');

    // Sync Color Logic
    function updateColor(color) {
        if (!color) return;
        cursor.style.backgroundColor = color;
    }

    // Init and Listen
    const colorInput = document.getElementById('player-color');
    if (colorInput) {
        updateColor(colorInput.value);
        colorInput.addEventListener('input', (e) => updateColor(e.target.value));
        colorInput.addEventListener('change', (e) => updateColor(e.target.value));
    } else {
        const storedColor = localStorage.getItem('playerColor');
        if (storedColor) updateColor(storedColor);
    }

    // Track mouse position with transform for instant response
    document.addEventListener('mousemove', (e) => {
        // Use transform for GPU acceleration and instant updates
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });

    // Hide cursor when mouse leaves window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    // Show cursor when mouse enters window
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });

    console.log('Inverted cursor effect initialized');
})();
