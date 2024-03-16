type BallColors = 'RED' | 'GREEN' | 'BLUE';

interface Drawable {
    draw: (ctx: CanvasRenderingContext2D) => void;
}

class Ball implements Drawable {
    constructor(
        private _x: number,
        private _y: number,
        private readonly _r: number,
        private _dx: number,
        private _dy: number,
        private _col: BallColors,
    ) { }

    get coords(): [number, number] {
        return [this._x, this._y];
    }

    set coords([x, y]: [number, number]) {
        this._x = x;
        this._y = y;
    }

    get radius() {
        return this._r;
    }

    get velocity(): [number, number] {
        return [this._dx, this._dy];
    }

    set velocity([dx, dy]: [number, number]) {
        this._dx = dx;
        this._dy = dy;
    }

    get color() {
        return this._col;
    }

    set color(color: BallColors) {
        this._col = color;
    }

    static randomBall({ fieldWidth, fieldHeight }: { fieldWidth: number, fieldHeight: number }): Ball {
        const r = Math.min(fieldWidth / 25, fieldHeight / 25);
        const x = Math.max(r, Math.min(fieldWidth - r, Math.random() * fieldWidth));
        const y = Math.max(r, Math.min(fieldHeight - r, Math.random() * fieldHeight));
        const dx = 0, dy = 0;
        const col = 'RED';

        return new Ball(x, y, r, dx, dy, col)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    }

    /**
     * Check if this ball collides with some other ball
     * @param otherBall Ball to check collision against
     * @returns True is balls collide, false otherwise
     */
    doCollide(otherBall: Ball): boolean {
        const deltaX = otherBall._x - this._x;
        const deltaY = otherBall._y - this._y;
        const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

        return distance < this._r + otherBall._r;
    }
}

export class GameState {
    private readonly _balls: Ball[] = [];

    constructor(
        private readonly _fieldWidth: number,
        private readonly _fieldHeight: number,
    ) { }

    get balls() {
        return this._balls;
    }

    addBall(newBall: Ball) {
        this._balls.push(newBall);
    }

    /**
     * Try to add a random ball to a balls array
     */
    addRandomBall(): void {
        // IPS flag
        let iters = 0;

        // Readiness flag - ready when new ball has no collisions
        let ready = false;

        // While not ready OR untill IPS didn't fire
        while (!ready && iters++ < 100) {
            // Generate new ball
            let newBall = Ball.randomBall(
                {
                    fieldWidth: this._fieldWidth,
                    fieldHeight: this._fieldHeight
                }
            );

            // Check against other balls and update readines flag
            ready = this.balls.reduce(
                (newFlag, ball) => (newFlag && !ball.doCollide(newBall)), true
            );

            if (ready) this._balls.push(newBall);
        }
    }
}
