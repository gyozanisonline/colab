/*! 
 * TypeModule - Clean kinetic text animation
 * Uses system fonts only
 */

const typeSketch = (p) => {
    let pgTextSize = 70;
    let lineHeight = pgTextSize * 0.8;
    let foreColor;

    let keyArray = [];
    let mainText = "UNIFIED FLOW";

    let groupCount = 7;
    let kineticGroups = [];

    let fullHeight = 0;
    let widthHold, heightHold;
    let newWidth, newHeight;
    let horzSpacer;

    p.setup = () => {
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent('canvas-type');

        widthHold = p.width;
        heightHold = p.height;
        newWidth = widthHold;
        newHeight = heightHold;
        horzSpacer = widthHold / 2;

        foreColor = p.color('#ffffff');

        p.textSize(pgTextSize);
        p.textAlign(p.LEFT, p.BASELINE);
        p.frameRate(30);

        setText(mainText);
    };

    function setText(text) {
        mainText = text;
        p.textSize(pgTextSize);

        keyArray = text.match(/[^\r\n]+/g);
        if (keyArray == null || keyArray.length === 0) {
            keyArray = [text];
        }

        resetAnim();
    }

    function resetAnim() {
        fullHeight = keyArray.length * lineHeight;
        kineticGroups = [];

        for (var p_idx = 0; p_idx < groupCount; p_idx++) {
            kineticGroups[p_idx] = new KineticGroup(
                p,
                -horzSpacer * ((groupCount - 1) / 2) + p_idx * horzSpacer,
                0,
                p_idx,
                keyArray,
                pgTextSize,
                newHeight,
                lineHeight,
                kineticGroups,
                groupCount,
                foreColor,
                horzSpacer,
                resetAnim
            );
        }
    }

    p.draw = () => {
        p.clear();

        p.push();
        p.translate(0, -fullHeight / 2 + lineHeight);

        for (var p_idx = 0; p_idx < kineticGroups.length; p_idx++) {
            kineticGroups[p_idx].update();
            kineticGroups[p_idx].run();
        }
        p.pop();
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        widthHold = p.width;
        heightHold = p.height;
        newWidth = widthHold;
        newHeight = heightHold;
        horzSpacer = widthHold / 2;
        resetAnim();
    };

    p.updateParams = (key, value) => {
        if (key === 'text') setText(value);
        if (key === 'size') {
            pgTextSize = value;
            lineHeight = pgTextSize * 0.8;
            setText(mainText);
        }
        if (key === 'color') foreColor = p.color(value);
    };

    window.typeModule = {
        setPreset: (name) => {
            if (name === 'NEON') foreColor = p.color('#00ffff');
            if (name === 'CLEAN') foreColor = p.color('#000000');
            if (name === 'GLITCH') foreColor = p.color('#ffff00');
            resetAnim();
        }
    };
};

window.typeInstance = new p5(typeSketch);
