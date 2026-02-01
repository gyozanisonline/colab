class KineticLetter {
    constructor(x_, p_, m_, n_) {
        this.p = p_
        this.m = m_;
        this.n = n_;

        this.x0 = x_;
        this.y0 = 0;
        this.w = textWidth(keyArray[this.m].charAt(this.n));
        this.h = pgTextSize * 0.7;

        this.yA = 0;
        this.xA = 0;
        this.yAmax = 0;
        this.xAmax = 0;

        this.flicker = 255;

        this.xScale = 1;
        this.xScaleMax = random(1, 5);
        this.xScaleMaxB = 1;

        this.xShear = 0;
        this.xShearMax = 0;
        this.xShearMaxB = 0;

        var rs0 = random(100);
        if (rs0 < 100 * (1 / keyArray[this.m].length)) {
            this.xShearMaxB = random(-PI / 4, PI / 4);
        }

        this.ticker = -this.n * 3 - this.m * 3 - 0;

        this.anim01 = 30 / animSpeed;
        this.anim12 = this.anim01 + 30 / animSpeed;
        this.anim23 = this.anim12 + 30 / animSpeed;

        this.xBudgeScale = 0;
        this.xBudgePre = 0;
        this.xBudgePost = 0;
        // Calculate letter tracking from global trackingFactor
        var safeTracking = (typeof window.trackingFactor !== 'undefined') ? window.trackingFactor : 0.15;
        this.xTrack = pgTextSize * safeTracking;
        console.log('[KineticLetter] trackingFactor:', window.trackingFactor, 'safeTracking:', safeTracking, 'pgTextSize:', pgTextSize, 'xTrack:', this.xTrack);
        this.visible = false;
        this.influ = animIntensity;

        // Apply motion patterns AFTER setting defaults
        this.applyMotionPattern();
    }

    applyMotionPattern() {
        const wordWidth = keyArray[this.m].length * pgTextSize * 0.6;
        const letterCount = keyArray[this.m].length;

        // Reset all values to zero (patterns will be applied additively)
        this.xAmax = 0;
        this.yAmax = 0;
        this.xShearMax = 0;
        this.xShearMaxB = 0;
        this.xScaleMaxB = 1;

        // Apply Arc pattern (if enabled) - 30x stronger!
        if (motionArc) {
            const intensity = motionArcIntensity / 100;
            const direct = 1;
            const rad = wordWidth / (PI / 2);
            const altSagitta = rad / (cos(PI / 4));
            const ang = -direct * PI * 3 / 4 + direct * map(this.n, 0, letterCount - 1, 0, PI / 2);

            this.xAmax += (cos(ang) * (wordWidth / 2 + pgTextSize / 2) - this.x0) * 30 * intensity;
            this.yAmax += (sin(ang) * (wordWidth / 2 + pgTextSize / 2) + rad - altSagitta / 8) * 30 * intensity;
            this.xShearMax += (ang + direct * PI / 2) * 3 * intensity;
        }

        // Apply Diagonal pattern (if enabled) - 20x stronger!
        if (motionDiagonal) {
            const intensity = motionDiagonalIntensity / 100;
            const diagAng = atan2(pgTextSize / 2, letterCount * pgTextSize * 0.6);
            const diagSpread = pgTextSize / 4 * (animSpread / 100);

            this.yAmax += map(this.n, 0, letterCount - 1, -diagSpread, diagSpread) * 20 * intensity;
            this.xShearMax += diagAng * 3 * intensity;
        }

        // Apply ZigZag pattern (if enabled) - 20x stronger!
        if (motionZigZag) {
            const intensity = motionZigZagIntensity / 100;
            let zigzagY = pgTextSize / 4 * (animSpread / 100);
            if (this.n % 2 == 0) {
                zigzagY *= -1;
            }

            this.yAmax += zigzagY * 20 * intensity;
        }

        // Apply Bolt pattern (if enabled) - 20x stronger!
        if (motionBolt) {
            const intensity = motionBoltIntensity / 100;
            const boltAng = atan2(pgTextSize / 2, letterCount * pgTextSize * 0.6);
            const boltSpread = pgTextSize / 4 * (animSpread / 100);

            let boltY;
            if (this.n < ((letterCount + 1) / 2)) {
                boltY = map(this.n, 0, letterCount / 2, -boltSpread, boltSpread);
            } else {
                boltY = map(this.n, letterCount / 2, letterCount - 1, -boltSpread, boltSpread);
            }

            this.yAmax += boltY * 20 * intensity;
            this.xShearMax += boltAng * 3 * intensity;
        }

        // Apply Bowtie pattern (if enabled) - 10x stronger!
        if (motionBowtie) {
            const intensity = motionBowtieIntensity / 100;
            let bowtieScale = 1;

            if (this.n == Math.floor((letterCount + 1) / 2 - 1)) {
                bowtieScale = 5;  // Was 1.5, now 5!
            } else if (this.n < letterCount / 2) {
                bowtieScale = map(this.n, 0, letterCount / 2 - 1, 1.5, 5);
            } else if (this.n > letterCount / 2) {
                bowtieScale = map(this.n, letterCount / 2, letterCount - 1, 5, 1.5);
            }

            this.xScaleMaxB *= 1 + (bowtieScale - 1) * intensity;
        }

        // Apply Rays pattern (if enabled) - 10x stronger!
        if (motionRays) {
            const intensity = motionRaysIntensity / 100;
            let raysShear = 0;

            if (this.n == Math.floor((letterCount + 1) / 2 - 1)) {
                raysShear = 0;
            } else if (this.n < letterCount / 2) {
                raysShear = map(this.n, 0, letterCount / 2 - 1, -PI / 2, 0);  // Was -PI/8
            } else if (this.n > letterCount / 2) {
                raysShear = map(this.n, letterCount / 2, letterCount - 1, 0, PI / 2);  // Was PI/8
            }

            this.xShearMax += raysShear * 10 * intensity;
        }

        // Apply Lean pattern (if enabled) - 10x stronger!
        if (motionLean) {
            const intensity = motionLeanIntensity / 100;
            let leanShear = 0;

            if (this.n == Math.floor((letterCount + 1) / 2 - 1)) {
                leanShear = 0;
            } else if (this.n < letterCount / 2) {
                leanShear = map(this.n, 0, letterCount / 2 - 1, -PI / 2, 0);
            } else if (this.n > letterCount / 2) {
                leanShear = map(this.n, letterCount / 2, letterCount - 1, 0, PI / 2);
            }

            this.xShearMaxB += leanShear * 10 * intensity;
        }

        // === NEW: 15 ADDITIONAL MOTION EFFECTS ===

        // Spiral - Letters rotate outward in spiral - 30x stronger!
        if (motionSpiral) {
            const intensity = motionSpiralIntensity / 100;
            const angle = (this.n / letterCount) * PI * 4; // 2 full rotations
            const radius = (this.n / letterCount) * pgTextSize * 3;

            this.xAmax += cos(angle) * radius * 30 * intensity;
            this.yAmax += sin(angle) * radius * 30 * intensity;
            this.xShearMax += angle * intensity;
        }

        // Wave - Sine wave vertical displacement - 25x stronger!
        if (motionWave) {
            const intensity = motionWaveIntensity / 100;
            const waveFreq = 2; // 2 complete waves
            const waveY = sin((this.n / letterCount) * PI * waveFreq) * pgTextSize;

            this.yAmax += waveY * 25 * intensity;
        }

        // Ripple - Concentric circular waves - 30x stronger!
        if (motionRipple) {
            const intensity = motionRippleIntensity / 100;
            const centerX = wordWidth / 2;
            const distFromCenter = abs(this.x0 - centerX);
            const rippleY = sin(distFromCenter / 20) * pgTextSize;

            this.yAmax += rippleY * 30 * intensity;
            this.xAmax += cos(distFromCenter / 20) * pgTextSize * 15 * intensity;
        }

        // Explode - Letters fly outward from center - 40x stronger!
        if (motionExplode) {
            const intensity = motionExplodeIntensity / 100;
            const centerPos = letterCount / 2;
            const distFromCenter = this.n - centerPos;

            this.xAmax += distFromCenter * pgTextSize * 40 * intensity;
            this.yAmax += (random(-1, 1)) * pgTextSize * 20 * intensity;
        }

        // Implode - Letters collapse inward - 40x stronger!
        if (motionImplode) {
            const intensity = motionImplodeIntensity / 100;
            const centerPos = letterCount / 2;
            const distFromCenter = this.n - centerPos;

            this.xAmax -= distFromCenter * pgTextSize * 40 * intensity;
            this.yAmax -= (this.n % 2 == 0 ? 1 : -1) * pgTextSize * 20 * intensity;
        }

        // Scatter - Random directional displacement - 50x stronger!
        if (motionScatter) {
            const intensity = motionScatterIntensity / 100;

            this.xAmax += random(-pgTextSize, pgTextSize) * 50 * intensity;
            this.yAmax += random(-pgTextSize, pgTextSize) * 50 * intensity;
            this.xShearMax += random(-PI / 4, PI / 4) * intensity;
        }

        // Twist - Progressive rotation along word - 20x stronger!
        if (motionTwist) {
            const intensity = motionTwistIntensity / 100;
            const twistAngle = map(this.n, 0, letterCount - 1, -PI, PI);

            this.xShearMax += twistAngle * 20 * intensity;
            this.yAmax += sin(twistAngle) * pgTextSize * 10 * intensity;
        }

        // Rotate - Full 360° letter rotation - 15x stronger!
        if (motionRotate) {
            const intensity = motionRotateIntensity / 100;
            const rotAngle = (this.n / letterCount) * PI * 2;

            this.xShearMax += rotAngle * 15 * intensity;
        }

        // Orbit - Letters orbit around their position - 35x stronger!
        if (motionOrbit) {
            const intensity = motionOrbitIntensity / 100;
            const orbitAngle = (this.n / letterCount) * PI * 2;
            const orbitRadius = pgTextSize * 0.5;

            this.xAmax += cos(orbitAngle) * orbitRadius * 35 * intensity;
            this.yAmax += sin(orbitAngle) * orbitRadius * 35 * intensity;
        }

        // Bounce - Elastic bounce effect - 30x stronger!
        if (motionBounce) {
            const intensity = motionBounceIntensity / 100;
            const bounceHeight = abs(sin((this.n / letterCount) * PI)) * pgTextSize;

            this.yAmax += bounceHeight * 30 * intensity;
            this.xScaleMaxB *= 1 + (0.5 * intensity);
        }

        // Slide - Horizontal sliding motion - 40x stronger!
        if (motionSlide) {
            const intensity = motionSlideIntensity / 100;
            const slideDir = (this.n % 2 == 0) ? 1 : -1;

            this.xAmax += slideDir * pgTextSize * 40 * intensity;
        }

        // Flip - 3D-style flip transformation - 25x stronger!
        if (motionFlip) {
            const intensity = motionFlipIntensity / 100;
            const flipAngle = map(this.n, 0, letterCount - 1, 0, PI);

            this.xScaleMaxB *= abs(cos(flipAngle)) * intensity + (1 - intensity);
            this.yAmax += sin(flipAngle) * pgTextSize * 25 * intensity;
        }

        // Pulse - Scale pulsing in/out - 20x stronger!
        if (motionPulse) {
            const intensity = motionPulseIntensity / 100;
            const pulsePhase = (this.n / letterCount) * PI * 2;
            const pulseScale = 1 + sin(pulsePhase) * 2;

            this.xScaleMaxB *= pulseScale * intensity + (1 - intensity);
        }

        // Shake - Rapid random jitter - 45x stronger!
        if (motionShake) {
            const intensity = motionShakeIntensity / 100;

            this.xAmax += random(-pgTextSize * 0.3, pgTextSize * 0.3) * 45 * intensity;
            this.yAmax += random(-pgTextSize * 0.3, pgTextSize * 0.3) * 45 * intensity;
        }

        // Glitch - Digital glitch displacement - 50x stronger!
        if (motionGlitch) {
            const intensity = motionGlitchIntensity / 100;

            if (random(1) < 0.3) { // 30% chance to glitch
                this.xAmax += (random(1) < 0.5 ? -1 : 1) * pgTextSize * 50 * intensity;
                this.yAmax += random(-pgTextSize * 0.5, pgTextSize * 0.5) * 50 * intensity;
                this.xScaleMaxB *= random(0.5, 2) * intensity + (1 - intensity);
            }
        }
    }

    update() {
        if (this.ticker == 0) {
            this.visible = true;
        }

        this.ticker++;

        if (this.ticker < this.anim01) {
            var tick0 = map(this.ticker, 0, this.anim01, 0.5, 1);
            var tick1 = aSet(tick0, this.influ);

            this.xA = map(tick1, 0.5, 1, this.xAmax, 0);
            this.yA = map(tick1, 0.5, 1, this.yAmax, 0);

            this.xScale = map(tick1, 0.5, 1, this.xScaleMax, 1);
            this.xShear = map(tick1, 0.5, 1, this.xShearMax, 0);
        } else if (this.ticker < this.anim12) {
            tick0 = map(this.ticker, this.anim01, this.anim12, 0, 1);
            tick1 = aSet(tick0, this.influ);

            this.xScale = map(tick1, 0, 1, 1, this.xScaleMaxB);
            this.xBudgeScale = (this.xScale * this.w) - this.w;

            this.xShear = map(tick1, 0, 1, 0, this.xShearMaxB);
            if (this.xShear < 0) {
                this.xBudgePost = -tan(this.xShear) * pgTextSize * 0.65;
            } else {
                this.xBudgePre = tan(this.xShear) * pgTextSize * 0.65;
            }
        } else {
            tick0 = map(this.ticker, this.anim12, this.anim23, 0, 0.5);
            tick1 = aSet(tick0, this.influ);

            this.yA = map(tick1, 0, 0.5, 0, -20);

            this.xScale = map(tick1, 0, 0.5, this.xScaleMaxB, 1);
            this.xBudgeScale = (this.xScale * this.w) - this.w;

            this.xShear = map(tick1, 0, 0.5, this.xShearMaxB, 0);
            if (this.xShear < 0) {
                this.xBudgePost = -tan(this.xShear) * pgTextSize * 0.65;
            } else {
                this.xBudgePre = tan(this.xShear) * pgTextSize * 0.65;
            }
        }

        if (this.n < keyArray[this.m].length - 1) {
            kineticGroups[this.p].kineticWords[this.m].budgeCenter += (this.xBudgeScale + this.xBudgePost + this.xBudgePre);
        }

        if (this.ticker > this.anim23 - 1) {
            this.visible = false;

            if (this.m == keyArray.length - 1 &&
                this.n == keyArray[this.m].length - 1 &&
                this.p == groupCount - 1) {
                resetAnim();
            }
        }
    }

    display() {
        translate(this.xBudgePre, 0);

        if (this.visible) {
            push();
            translate(this.x0, this.y0);
            translate(this.xA, this.yA);
            shearX(this.xShear);
            scale(this.xScale, 1);
            noStroke();
            fill(foreColor);
            textFont(currentFont);
            textSize(pgTextSize);
            text(keyArray[this.m].charAt(this.n), 0, 0);
            pop();
        }
        translate(this.xBudgeScale, 0);
        translate(this.xBudgePost, 0);
        translate(this.xTrack, 0);
    }
}
