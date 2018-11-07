import Rect from './Rect.js';

export default class Sprite {

    constructor(x, y, fwd, speed) {
        this.x = x;
        this.y = y;
        this.fwd = fwd;
        this.speed = speed;
        this.gravity = 300;
        this.enemy = false;
    }

    move(dt = 1 / 60) {
        this.x += this.fwd.x * this.speed * dt;
        this.y += this.gravity * dt;
        if (this.gravity < 300 && !this.enemy) {
            this.gravity += 10;
        }

        else if (this.enemy) {

            this.gravity = 0;
            this.x += this.fwd.x * this.speed * dt;
        }
    }

    reflectX() {
        this.fwd.x *= -1;
    }

    reflectY() {
        this.fwd.y *= -1;
    }

    getRect() {
        return new Rect(this.x, this.y, this.width, this.height);
    }

    jump() {
        this.gravity = -700;
    }

    bounceDown() {
        this.gravity = 300;
    }

    setEnemy(height) {
        this.enemy = true;
        this.y = height;
    }

    collisionDetection(sprites) {
        for (let s of sprites) {
            if (s.enemy ) // only checking collisions against enemies from the
            {
                if (this.x < s.x + s.width &&
                    this.x + this.width > s.x &&
                    this.y < s.y + s.height &&
                    this.y + this.height > s.y + s.height) {
                    this.bounceDown();
                }
            }

            if (s.enemy) // only checking collisions against enemies from the top
            {
                if (this.x < s.x + s.width &&
                    this.x + this.width > s.x &&
                    this.y < s.y &&
                    this.y + this.height > s.y) {
                    s.speed = 0;
                    s.x = 2000; // move offscreen
                    this.jump();
                    return true;
                }
            }

        }
        return false;
    }

}