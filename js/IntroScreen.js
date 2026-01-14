class LogoBlock {
    constructor(x, y, color, size) {
        this.targetX = x;
        this.targetY = y;
        this.color = color;
        this.size = size;

        // Start from a random position off-screen or scattered
        this.pos = createVector(random(width), random(height));

        // Random usage for more dynamic entrance
        if (random() > 0.5) {
            this.pos.x = random() > 0.5 ? -100 : width + 100;
        } else {
            this.pos.y = random() > 0.5 ? -100 : height + 100;
        }

        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.maxSpeed = random(10, 20);
        this.maxForce = random(0.5, 1);

        this.arrived = false;
    }

    update() {
        let target = createVector(this.targetX, this.targetY);
        let desired = p5.Vector.sub(target, this.pos);
        let d = desired.mag();

        // Arrive behavior
        let speed = this.maxSpeed;
        if (d < 100) {
            speed = map(d, 0, 100, 0, this.maxSpeed);
        }

        desired.setMag(speed);
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(this.maxForce);

        this.acc.add(steer);
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);

        if (d < 1) {
            this.arrived = true;
            this.pos.x = this.targetX;
            this.pos.y = this.targetY;
        }
    }

    display() {
        noStroke();
        fill(this.color);
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.size, this.size);
    }
}

class IntroScreen {
    constructor(logoImage) {
        this.isActive = true;
        this.logoImage = logoImage;
        this.blocks = [];
        this.blockSize = 8; // Size of each block (pixels)
        this.scanStep = 8;  // Step size for scanning (match block size for solid look)
        this.isAssembled = false;
        this.assemblyTime = 0;
        this.holdDuration = 60; // Frames to hold after assembly (~2 seconds)
        this.fadeAlpha = 0;

        this.initBlocks();
    }

    initBlocks() {
        this.logoImage.loadPixels();

        // Calculate offsets to center the logo
        let imgW = this.logoImage.width;
        let imgH = this.logoImage.height;

        // Scale down if image is huge
        let scaleFactor = 1;
        if (imgW > width * 0.8) {
            scaleFactor = (width * 0.8) / imgW;
        }

        let displayW = imgW * scaleFactor;
        let displayH = imgH * scaleFactor;

        let startX = (width - displayW) / 2;
        let startY = (height - displayH) / 2;

        for (let y = 0; y < imgH; y += this.scanStep) {
            for (let x = 0; x < imgW; x += this.scanStep) {
                let index = (x + y * imgW) * 4;
                let a = this.logoImage.pixels[index + 3];

                if (a > 128) { // If pixel is not transparent
                    let r = this.logoImage.pixels[index];
                    let g = this.logoImage.pixels[index + 1];
                    let b = this.logoImage.pixels[index + 2];

                    let targetX = startX + x * scaleFactor;
                    let targetY = startY + y * scaleFactor;

                    this.blocks.push(new LogoBlock(targetX, targetY, color(r, g, b), this.blockSize * scaleFactor));
                }
            }
        }
    }

    update() {
        if (!this.isActive) return;

        let allArrived = true;
        for (let block of this.blocks) {
            block.update();
            if (!block.arrived) {
                allArrived = false;
            }
        }

        if (allArrived) {
            this.assemblyTime++;
            if (this.assemblyTime > this.holdDuration) {
                this.fadeAlpha += 15;
                if (this.fadeAlpha > 255) {
                    this.isActive = false;
                    // Trigger any post-intro visibility things here if needed
                    console.log("Intro finished");
                }
            }
        }
    }

    display() {
        if (!this.isActive) return;

        background(0, 0, 0); // Black background for intro

        for (let block of this.blocks) {
            block.display();
        }

        // Fade out overlay
        if (this.fadeAlpha > 0) {
            fill(0, this.fadeAlpha);
            noStroke();
            rect(width / 2, height / 2, width, height); // Assumes CENTER rect mode
        }
    }
}
