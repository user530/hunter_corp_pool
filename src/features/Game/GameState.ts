type BallColors = 'RED' | 'GREEN' | 'BLUE';

interface Drawable {
    draw: (ctx: CanvasRenderingContext2D) => void;
}

class Ball implements Drawable {
    // Restitution koefficient
    private readonly _e = 0.5;
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
        this._m = this._K * Math.PI * (_r ** 2);
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

    get e() {
        return this._e;
    }

    static randomBall({ fieldWidth, fieldHeight }: { fieldWidth: number, fieldHeight: number }): Ball {
        const MAX_SPEED = 10;
        const r = Math.min(fieldWidth / 25, fieldHeight / 25);
        // const r = 50;
        const x = Math.max(r, Math.min(fieldWidth - r, Math.random() * fieldWidth));
        const y = Math.max(r, Math.min(fieldHeight - r, Math.random() * fieldHeight));
        const dx = (0.5 - Math.random()) * 2 * MAX_SPEED;
        const dy = (0.5 - Math.random()) * 2 * MAX_SPEED;
        const col = 'RED';

        return new Ball(x, y, r, dx, dy, col)
    }

    draw(ctx: CanvasRenderingContext2D): void {
        const [x, y] = this.coords;
        const [dx, dy] = this.velocity;

        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * 10, y + dy * 10);
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Check if this ball collides with some other ball
     * @param otherBall Ball to check collision against
     * @returns True is balls collide, false otherwise
     */
    isColliding(otherBall: Ball): boolean {
        // Prevent 'self-collision' check
        if (this.id === otherBall.id) return false;

        const r = this.radius;
        const r1 = otherBall.radius;

        // Distance between two balls
        const distance = this.getDistance(otherBall);

        // If balls are not clipped -> no collision we can skip
        if (distance > r + r1)
            return false;

        // If balls collide we need to check that still have collision course
        const [relX, relY] = this.getRelativePos(otherBall);
        const [relDx, relDy] = this.getRelativeVelocity(otherBall);

        const dotProduct = relX * relDx + relY * relDy;

        // If dot product of relative position and relative velocity vectors is negative -> they might collide
        if (dotProduct >= 0)
            return false;

        // Check if collision course will result in collision
        return ((relX + relDx) ** 2 + (relY + relDy) ** 2) <= (r + r1) ** 2
    }

    handleCollision(otherBall: Ball): void {
        // Prepare the data
        const [dx, dy] = this.velocity;
        const [dx1, dy1] = otherBall.velocity;
        const m = this.mass;
        const m1 = otherBall.mass;
        // Restitution
        const e = this.e;

        // Update velocity vectors to simulate non elastic collision 
        this.velocity = [
            dx + (m1 / (m + m1)) * (1 + e) * (dx1 - dx),
            dy + (m1 / (m + m1)) * (1 + e) * (dy1 - dy),
        ];

        otherBall.velocity = [
            dx1 + (m / (m + m1)) * (1 + e) * (dx - dx1),
            dy1 + (m / (m + m1)) * (1 + e) * (dy - dy1),
        ];
    }

    private getRelativePos(otherBall: Ball): [number, number] {
        const [x, y] = this.coords;
        const [x1, y1] = otherBall.coords;

        return [x1 - x, y1 - y];
    }

    private getDistance(otherBall: Ball): number {
        const [deltaX, deltaY] = this.getRelativePos(otherBall);

        // Distance between two balls
        return Math.sqrt((deltaX ** 2) + (deltaY ** 2));
    }

    private getRelativeVelocity(otherBall: Ball): [number, number] {
        const [dx, dy] = this.velocity;
        const [dx1, dy1] = otherBall.velocity;

        // Relative velocity
        return [dx1 - dx, dy1 - dy];
    }
}

export class GameState {
    private readonly _balls: Ball[] = [];
    private _mousePos: [number, number] = [-1, -1];
    private _mouseVel: [number, number] = [0, 0];

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

    get mousePos() {
        return this._mousePos;
    }

    set mousePos([x, y]: [number, number]) {
        this._mousePos = [x, y];
    }

    get mouseVel() {
        return this._mouseVel;
    }

    set mouseVel([dx, dy]: [number, number]) {
        this._mouseVel = [dx, dy];
    }

    addBall(newBall: Ball) {
        this.balls.push(newBall);
    }

    drawMouse(ctx: CanvasRenderingContext2D) {
        const [x, y] = this.mousePos;
        const [dx, dy] = this.mouseVel;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * 10, y + dy * 10);
        ctx.stroke();
        ctx.closePath();
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
                (newFlag, ball) => (newFlag && !ball.isColliding(newBall)), true
            );

            if (ready) this.addBall(newBall);
        }
    }

    updateState(): void {
        this.balls.forEach(
            ball => {
                const [x, y] = ball.coords;
                const [dx, dy] = ball.velocity;

                // Placeholder, think of some more efficient collision check
                for (let i = 0; i < this.balls.length; ++i) {
                    const otherBall = this.balls[i];
                    const collision = ball.isColliding(otherBall);

                    if (collision)
                        ball.handleCollision(otherBall);

                    // Handle ball to mouse interaction
                    this.ballToMouse(ball);
                }

                // Border collision applied
                this.ballToBorder(ball);

                ball.coords = [x + dx, y + dy];
            }
        )
    }

    private ballToMouse(ball: Ball): void {
        const [mX, mY] = this._mousePos;
        const [mDx, mDy] = this._mouseVel;

        // Virtual 'ball' representing mouse (cue)
        const cue = new Ball(mX, mY, 1, mDx * 10, mDy * 10, 'BLUE');

        if (ball.isColliding(cue))
            // Bounce them
            ball.handleCollision(cue);
    }

    private ballToBorder(ball: Ball): void {
        const [x, y] = ball.coords;
        const [dx, dy] = ball.velocity;
        const r = ball.radius;
        const e = ball.e;

        let xBounce = false;
        let yBounce = false;

        // Right border
        if (x + r >= this.width) {
            ball.coords = [this.width - r, y];

            // Bounce back from the right border 
            if (dx > 0)
                xBounce = true
        }

        // Left border
        if (x - r <= 0) {
            ball.coords = [r, y];

            // Bounce back from the left border
            if (dx < 0)
                xBounce = true;
        }

        // Top border
        if (y - r <= 0) {
            ball.coords = [ball.coords[0], r];

            // Bounce back from the top border
            if (dy < 0)
                yBounce = true;
        }

        // Bottom border
        if (y + r >= this.height) {
            ball.coords = [ball.coords[0], this.height - r];

            // Bounce back from the bottom border
            if (dy > 0)
                yBounce = true;
        }

        // Horizontal bounce - only reflect when moving to the left with negative speed, etc
        if (xBounce) {
            ball.velocity = [-dx * e, ball.velocity[1]];
        }

        // Vertical bounce
        if (yBounce) {
            ball.velocity = [ball.velocity[0], -dy * e];
        }
    }
}
