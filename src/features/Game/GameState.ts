type BallColors = 'RED' | 'GREEN' | 'BLUE';

interface Drawable {
    draw: (ctx: CanvasRenderingContext2D) => void;
}

class Ball implements Drawable {
    // Density koefficient
    private readonly _K = 1;
    private _m: number;
    private readonly _id = Symbol('id');

    constructor(
        private _x: number,
        private _y: number,
        private readonly _r: number,
        private _dx: number,
        private _dy: number,
        private _col: BallColors,
    ) {
        // Calculate mass based on size and density
        this._m = this._K * Math.PI * _r * _r;
    }

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

    get mass() {
        return this._m;
    }

    get id() {
        return this._id;
    }

    static randomBall({ fieldWidth, fieldHeight }: { fieldWidth: number, fieldHeight: number }): Ball {
        // const r = Math.min(fieldWidth / 25, fieldHeight / 25);
        const r = 100;
        const x = Math.max(r, Math.min(fieldWidth - r, Math.random() * fieldWidth));
        const y = Math.max(r, Math.min(fieldHeight - r, Math.random() * fieldHeight));
        const dx = Math.random() * 5 * (Math.round(x) % 2 === 0 ? 1 : -1);
        const dy = Math.random() * 5 * (Math.round(y) % 2 === 0 ? 1 : -1);
        const col = 'RED';

        return new Ball(x, y, r, dx, dy, col)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const [x, y] = this.coords;

        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
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
        // Prevent 'self-collision'
        if (this.id === otherBall.id) return false;

        // Check 'static' collision (not calculating movement)
        const deltaX = otherBall.coords[0] - this.coords[0];
        const deltaY = otherBall.coords[1] - this.coords[1];

        const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));

        if (distance < this.radius + otherBall.radius) {
            console.log('Static Collision!');
            console.log(this.velocity, otherBall.velocity);

            return true;
        }

        // Check 'dynamic' collision (prevent 'telefraging')
        // const [x1, y1] = otherBall.coords;
        // const [dx1, dy1] = otherBall.velocity;

        // // Relative velocity
        // const relativeVel: [number, number] = [dx1 - this._dx, dy1 - this._dy];

        // const something = Math.sqrt(relativeVel[0] * relativeVel[0] + relativeVel[1] * relativeVel[1]);
        return false
        // return something >= this._r + otherBall._r;
    }

    handleCollision(otherBall: Ball): void {
        const [dx0, dy0] = this.velocity;
        const m0 = this.mass;

        const [dx1, dy1] = otherBall.velocity;
        const m1 = otherBall.mass;

        // Restitution koefficient
        const e = 0.98;

        const thisNewVel: [number, number] = [
            ((m0 - e * m1) * dx0 + (1 + e) * m1 * dx1) / (m0 + m1),
            ((m0 - e * m1) * dy0 + (1 + e) * m1 * dy1) / (m0 + m1)
        ];

        const otherNewVel: [number, number] = [
            ((1 + e) * m0 * dx0 + (m1 - e * m0) * dx1) / (m0 + m1),
            ((1 + e) * m0 * dy0 + (m1 - e * m0) * dy1) / (m0 + m1)
        ];

        this.velocity = thisNewVel;
        otherBall.velocity = otherNewVel;
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

    get width() {
        return this._fieldWidth;
    }

    get height() {
        return this._fieldHeight;
    }

    addBall(newBall: Ball) {
        this.balls.push(newBall);
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
                    fieldWidth: this.width,
                    fieldHeight: this.height
                }
            );

            // Check against other balls and update readines flag
            ready = this.balls.reduce(
                (newFlag, ball) => (newFlag && !ball.doCollide(newBall)), true
            );

            if (ready) this.addBall(newBall);
        }
    }

    updateState(): void {
        this.balls.forEach(
            ball => {
                const [x, y] = ball.coords;
                const [dx, dy] = ball.velocity;

                ball.coords = [x + dx, y + dy];

                // Placeholder, think of some more efficient collision check
                for (let i = 0; i < this.balls.length; ++i) {
                    const otherBall = this.balls[i];
                    const collision = ball.doCollide(otherBall);
                    if (collision) ball.handleCollision(otherBall);
                }

                // Border collision applied
                this.ballToBorder(ball);
            }
        )
    }

    private ballToBorder(ball: Ball): void {
        const [x, y] = ball.coords;
        const [dx, dy] = ball.velocity;
        const r = ball.radius;

        let xBounce = false;
        let yBounce = false;

        // Right border
        if (x + r > this.width) {
            ball.coords = [this.width - r, y];
            xBounce = true;
        }

        // Left border
        if (x - r < 0) {
            ball.coords = [r, y];
            xBounce = true;
        }

        // Top border
        if (y - r < 0) {
            ball.coords = [ball.coords[0], r];
            yBounce = true;
        }

        // Bottom border
        if (y + r > this.height) {
            ball.coords = [ball.coords[0], this.height - r];
            yBounce = true;
        }

        // Horizontal bounce
        if (xBounce) {
            ball.velocity = [-dx, ball.velocity[1]];
        }

        // Vertical bounce
        if (yBounce) {
            ball.velocity = [ball.velocity[0], -dy];
        }
    }
}
