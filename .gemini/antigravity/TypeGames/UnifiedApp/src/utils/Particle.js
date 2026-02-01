export class Particle {
    constructor(x, y, a, hl, stripHeight = 85) {
        this.dragging = false; // Is the object being dragged?
        this.rollover = false; // Is the mouse over the ellipse?
        this.draggingHandle = false;
        this.draggingHandleAlt = false;

        this.x = x;
        this.y = y;
        this.a = a;

        this.hl = hl;
        this.althl = hl;

        // Dimensions
        this.w = stripHeight / 2;
        this.h = stripHeight / 2;
        this.hw = 10;
        this.hh = 10;

        // Internal calculations for handles
        this.updateHandles();
    }

    updateHandles() {
        this.hx = Math.cos(this.a) * this.hl + this.x;
        this.hy = Math.sin(this.a) * this.hl + this.y;
        this.althx = -Math.cos(this.a) * this.althl + this.x;
        this.althy = -Math.sin(this.a) * this.althl + this.y;
    }

    over(mouseX, mouseY) {
        if (
            mouseX > this.x - this.w / 2 &&
            mouseX < this.x + this.w / 2 &&
            mouseY > this.y - this.h / 2 &&
            mouseY < this.y + this.h / 2
        ) {
            this.rollover = true;
        } else {
            this.rollover = false;
        }
    }

    update(mouseX, mouseY) {
        if (this.dragging) {
            this.x = mouseX + this.offsetX;
            this.hx = mouseX + this.offsetHoldX;
            this.althx = mouseX + this.offsetHoldXalt;
            this.y = mouseY + this.offsetY;
            this.hy = mouseY + this.offsetHoldY;
            this.althy = mouseY + this.offsetHoldYalt;
        }

        if (this.draggingHandle) {
            this.hx = mouseX - this.offsetHX;
            this.hy = mouseY - this.offsetHY;

            this.hl = Math.hypot(this.hx - this.x, this.hy - this.y);
            this.a = Math.atan2(this.hy - this.y, this.hx - this.x);

            this.althx = -Math.cos(this.a) * this.althl + this.x;
            this.althy = -Math.sin(this.a) * this.althl + this.y;
        }

        if (this.draggingHandleAlt) {
            this.althx = mouseX - this.offsetHXalt;
            this.althy = mouseY - this.offsetHYalt;

            this.althl = Math.hypot(this.althx - this.x, this.althy - this.y);
            this.a = Math.atan2(this.althy - this.y, this.althx - this.x);

            this.hx = -Math.cos(this.a) * this.hl + this.x;
            this.hy = -Math.sin(this.a) * this.hl + this.y;
        }
    }

    show(p5, handleColor, isSelected) {
        p5.strokeWeight(1);
        p5.stroke(handleColor);

        if (this.dragging || this.draggingHandle || this.draggingHandleAlt || isSelected) {
            p5.fill(0, 0, 255);
        } else {
            p5.noFill();
        }

        p5.ellipse(this.x, this.y, this.w, this.h);
        p5.rectMode(p5.CENTER);
        p5.rect(this.hx, this.hy, this.hw, this.hh);
        p5.rect(this.althx, this.althy, this.hw, this.hh);
        p5.fill(255);
        p5.line(this.hx, this.hy, this.althx, this.althy);
    }

    pressed(mouseX, mouseY) {
        // Did I click on the center?
        if (
            mouseX > this.x - this.w / 2 &&
            mouseX < this.x + this.w / 2 &&
            mouseY > this.y - this.h / 2 &&
            mouseY < this.y + this.h / 2
        ) {
            this.dragging = true;
            // If so, keep track of relative location of click to corner of rectangle
            this.offsetX = this.x - mouseX;
            this.offsetHoldX = this.hx - mouseX;
            this.offsetHoldXalt = this.althx - mouseX;
            this.offsetY = this.y - mouseY;
            this.offsetHoldY = this.hy - mouseY;
            this.offsetHoldYalt = this.althy - mouseY;
            return true;
        }

        const halfHw = this.hw / 2;
        const halfHh = this.hh / 2;

        // Handle 1
        if (
            mouseX > this.hx - halfHw &&
            mouseX < this.hx + halfHw &&
            mouseY > this.hy - halfHh &&
            mouseY < this.hy + halfHh
        ) {
            this.draggingHandle = true;
            this.offsetHX = this.hx - mouseX;
            this.offsetHY = this.hy - mouseY;
            return true;
        }

        // Handle 2
        if (
            mouseX > this.althx - halfHw &&
            mouseX < this.althx + halfHw &&
            mouseY > this.althy - halfHh &&
            mouseY < this.althy + halfHh
        ) {
            this.draggingHandleAlt = true;
            this.offsetHXalt = this.althx - mouseX;
            this.offsetHYalt = this.althy - mouseY;
            return true;
        }

        return false;
    }

    released() {
        // Quit dragging
        this.dragging = false;
        this.draggingHandle = false;
        this.draggingHandleAlt = false;
    }
}
