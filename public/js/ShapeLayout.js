// ShapeLayout.js - Calculate letter positions for different shape formations

class ShapeLayout {
    static getPositions(shapeMode, letterCount, wordWidth, pgTextSize) {
        switch (shapeMode) {
            case 'circle':
                return this.circleLayout(letterCount, pgTextSize);
            case 'rectangle':
                return this.rectangleLayout(letterCount, wordWidth, pgTextSize);
            case 'triangle':
                return this.triangleLayout(letterCount, pgTextSize);
            case 'star':
                return this.starLayout(letterCount, pgTextSize);
            case 'spiral':
                return this.spiralLayout(letterCount, pgTextSize);
            default:
                return null; // No shape transformation
        }
    }

    static circleLayout(letterCount, size) {
        const positions = [];
        const radius = size * letterCount / (2 * PI);

        for (let i = 0; i < letterCount; i++) {
            const angle = (i / letterCount) * PI * 2;
            positions.push({
                x: cos(angle) * radius,
                y: sin(angle) * radius,
                rotation: angle + PI / 2
            });
        }
        return positions;
    }

    static rectangleLayout(letterCount, wordWidth, size) {
        const positions = [];
        const cols = Math.ceil(Math.sqrt(letterCount));
        const rows = Math.ceil(letterCount / cols);
        const spacing = size * 1.2;

        for (let i = 0; i < letterCount; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            positions.push({
                x: (col - cols / 2) * spacing,
                y: (row - rows / 2) * spacing,
                rotation: 0
            });
        }
        return positions;
    }

    static triangleLayout(letterCount, size) {
        const positions = [];
        const height = size * Math.sqrt(letterCount);

        let currentRow = 0;
        let lettersInRow = 1;
        let letterIndex = 0;

        while (letterIndex < letterCount) {
            const rowWidth = lettersInRow * size;
            for (let i = 0; i < lettersInRow && letterIndex < letterCount; i++) {
                positions.push({
                    x: (i - lettersInRow / 2) * size,
                    y: currentRow * size - height / 2,
                    rotation: 0
                });
                letterIndex++;
            }
            currentRow++;
            lettersInRow++;
        }
        return positions;
    }

    static starLayout(letterCount, size) {
        const positions = [];
        const outerRadius = size * letterCount / 5;
        const innerRadius = outerRadius * 0.4;

        for (let i = 0; i < letterCount; i++) {
            const angle = (i / letterCount) * PI * 2 - PI / 2;
            const isOuter = i % 2 === 0;
            const radius = isOuter ? outerRadius : innerRadius;

            positions.push({
                x: cos(angle) * radius,
                y: sin(angle) * radius,
                rotation: angle + PI / 2
            });
        }
        return positions;
    }

    static spiralLayout(letterCount, size) {
        const positions = [];
        const spiralTightness = 0.5;

        for (let i = 0; i < letterCount; i++) {
            const angle = (i / letterCount) * PI * 6; // 3 full rotations
            const radius = (i / letterCount) * size * 5 * spiralTightness;

            positions.push({
                x: cos(angle) * radius,
                y: sin(angle) * radius,
                rotation: angle
            });
        }
        return positions;
    }
}
