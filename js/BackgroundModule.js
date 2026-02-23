const backgroundSketch = (p) => {
    let cols = 20;
    let rows = 20;
    let speed = 0.02;
    let bgColor = '#000000';
    let strokeColor = '#7d7d7d';
    let strokeSize = 1;
    let shapes = [];

    // Poster Mode State
    let isPosterMode = false;
    let posterWidth = 600;
    let posterHeight = 900;

    p.setup = () => {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        canvas.parent('canvas-background');
        p.frameRate(30);
    };

    p.setPosterMode = (val) => {
        isPosterMode = val;
        p.windowResized();
    }

    p.draw = () => {
        p.background(bgColor);

        // --- Audio Reactivity ---
        let audioLevel = 0;
        if (window.audioModule && window.audioModule.getAudioData) {
            audioLevel = window.audioModule.getAudioData(); // 0-255
        }

        // Modulate Speed based on Audio
        let currentSpeed = speed + (audioLevel / 255) * 5;

        // --- Floating Shapes ---
        p.push();
        p.strokeWeight(1); // Default for shapes
        p.noStroke();
        p.fill(strokeColor);
        p.ambientLight(100);
        p.directionalLight(255, 255, 255, 0, 0, -1);

        shapes.forEach((s) => {
            p.push();
            p.translate(s.x, s.y, s.z);
            p.rotateX(p.frameCount * s.rx);
            p.rotateY(p.frameCount * s.ry);

            // Movement
            s.x += s.vx;
            s.y += s.vy;
            s.z += s.vz;

            // Bounds check (simple wrapping)
            if (s.x > p.width / 2) s.x = -p.width / 2;
            if (s.x < -p.width / 2) s.x = p.width / 2;
            if (s.y > p.height / 2) s.y = -p.height / 2;
            if (s.y < -p.height / 2) s.y = p.height / 2;

            if (s.type === 'box') p.box(s.size);
            if (s.type === 'sphere') p.sphere(s.size);
            if (s.type === 'cone') p.cone(s.size, s.size * 2);
            p.pop();
        });
        p.pop();

        // --- Grid Field ---
        p.stroke(strokeColor);
        p.strokeWeight(strokeSize);
        p.noFill();

        let xSpace = p.width / cols;
        let ySpace = p.height / rows;

        p.push();
        p.translate(-p.width / 2, -p.height / 2);

        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                let x = i * xSpace;
                let y = j * ySpace;

                let zOffset = p.sin((p.frameCount * currentSpeed * 5) + (i * 0.5) + (j * 0.5)) * 50;

                p.push();
                p.translate(x + xSpace / 2, y + ySpace / 2, zOffset);
                p.line(-xSpace / 2, 0, xSpace / 2, 0);
                p.line(0, -ySpace / 2, 0, ySpace / 2);
                p.pop();
            }
        }
        p.pop();
    };

    p.windowResized = () => {
        if (isPosterMode) {
            p.resizeCanvas(posterWidth, posterHeight);
        } else {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        }
    };

    p.updateParams = (key, value) => {
        if (key === 'cols') cols = value;
        if (key === 'rows') rows = value;
        if (key === 'speed') speed = value;
        if (key === 'color') bgColor = value;
        if (key === 'strokeSize') strokeSize = value;
        if (key === 'strokeColor') {
            strokeColor = p.color(value); // Convert hex to p5 color
        }
    };

    p.addShape = (type) => {
        shapes.push({
            type: type,
            x: p.random(-200, 200),
            y: p.random(-200, 200),
            z: p.random(-100, 100),
            vx: p.random(-1, 1),
            vy: p.random(-1, 1),
            vz: p.random(-0.5, 0.5),
            rx: p.random(0.01, 0.05),
            ry: p.random(0.01, 0.05),
            size: p.random(20, 50)
        });
    }
};

window.bgInstance = new p5(backgroundSketch);

// Add Preset Logic to global instance
window.bgModule = {
    setPreset: (name) => {
        if (name === 'NEON') {
            window.bgInstance.updateParams('bgColor', '#0d0d0d');
            window.bgInstance.updateParams('strokeColor', '#f23e2e');
            window.bgInstance.updateParams('speed', 2);
            window.bgInstance.updateParams('cols', 40);
        }
        if (name === 'CLEAN') {
            window.bgInstance.updateParams('bgColor', '#ffffff');
            window.bgInstance.updateParams('strokeColor', '#000000');
            window.bgInstance.updateParams('speed', 0.5);
            window.bgInstance.updateParams('cols', 20);
        }
        if (name === 'GLITCH') {
            window.bgInstance.updateParams('bgColor', '#1a1a1a');
            window.bgInstance.updateParams('strokeColor', '#00ff00');
            window.bgInstance.updateParams('speed', 10);
            window.bgInstance.updateParams('cols', 80);
        }
    }
};
