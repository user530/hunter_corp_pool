type BallColors = 'RED' | 'GREEN' | 'BLUE';

enum Colors {
    'Red',
    'Green',
    'Blue',
}

interface Drawable {
    draw: (ctx: CanvasRenderingContext2D) => void;
}

class Ball implements Drawable {
    private readonly RESTITUTION = 0.5;
    private readonly DENSITY = 1;
    private _m: number;
    private readonly _id = Symbol('id');

    constructor(
        private _x: number,
        private _y: number,
        private readonly _r: number,
        private _dx: number,
        private _dy: number,
        private _col: string,
    ) {
        // Calculate mass based on size and density
        this._m = this.DENSITY * Math.PI * (_r ** 2);
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

    set color(color: string) {
        this._col = color;
    }

    get mass() {
        return this._m;
    }

    get id() {
        return this._id;
    }

    get restitution() {
        return this.RESTITUTION;
    }

    /**
     * Simple function to generate a random ball for a specified game field
     * @param fieldDimensions Object representing game field width and height
     * @returns New ball instance with some random data
     */
    static randomBall(fieldDimensions: { fieldWidth: number, fieldHeight: number }): Ball {
        const { fieldWidth, fieldHeight } = fieldDimensions;
        const MAX_SPEED = 10;
        const BALL_RADIUS_RATIO = 10;
        const randomRadius = Math.max(30, Math.random() * Math.min(fieldWidth, fieldHeight) / BALL_RADIUS_RATIO);
        const x = Math.max(randomRadius, Math.min(fieldWidth - randomRadius, Math.random() * fieldWidth));
        const y = Math.max(randomRadius, Math.min(fieldHeight - randomRadius, Math.random() * fieldHeight));
        const dx = (0.5 - Math.random()) * 2 * MAX_SPEED;
        const dy = (0.5 - Math.random()) * 2 * MAX_SPEED;
        // Random HEX color formula (https://css-tricks.com/snippets/javascript/random-hex-color/)
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

        return new Ball(x, y, randomRadius, dx, dy, randomColor)
    }

    /**
     Draws a ball on the canvas
     * @param ctx Canvas context to draw upon
     * @param debugMode When enabled - also draws velocity vectors
     */
    draw(ctx: CanvasRenderingContext2D, debugMode: boolean = false): void {
        const [x, y] = this.coords;
        const [dx, dy] = this.velocity;
        const color = this.color;

        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        // Optional: velocity vector
        if (debugMode) {
            ctx.strokeStyle = 'black';
            ctx.moveTo(x, y);
            ctx.lineTo(x + dx * 10, y + dy * 10);
        }

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

    /**
     * Update velocity of 2 colliding balls based on the mass and restitution koefficient
     * @param otherBall Ball to handle collision against
     */
    handleCollision(otherBall: Ball): void {
        // Prepare the data
        const [dx, dy] = this.velocity;
        const [dx1, dy1] = otherBall.velocity;
        const m = this.mass;
        const m1 = otherBall.mass;
        const e = this.restitution;

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

    /**
     * Helper method to calculate relative position vector between 2 balls
     * @param otherBall Ball to check relative position against
     * @returns Tuple of relative vector components (x, y)
     */
    private getRelativePos(otherBall: Ball): [number, number] {
        const [x, y] = this.coords;
        const [x1, y1] = otherBall.coords;

        return [x1 - x, y1 - y];
    }

    /**
     * Helper method to calculate distance between centers of 2 balls
     * @param otherBall Ball to measure distance against
     * @returns Distance (relative position vector magnituted) value
     */
    private getDistance(otherBall: Ball): number {
        const [deltaX, deltaY] = this.getRelativePos(otherBall);

        return Math.sqrt((deltaX ** 2) + (deltaY ** 2));
    }

    /**
     * Helper method to calculate relative velocity vector between 2 balls
     * @param otherBall Ball to check collision against
     * @returns Tuple of relative vector components (x, y)
     */
    private getRelativeVelocity(otherBall: Ball): [number, number] {
        const [dx, dy] = this.velocity;
        const [dx1, dy1] = otherBall.velocity;

        return [dx1 - dx, dy1 - dy];
    }
}

export class GameState {
    private _mouseMode: 'SELECTION' | 'CUE' = 'SELECTION';
    private readonly CUE_RADIUS = 10;
    private readonly CUE_STRENGTH = 0.3;
    private readonly FRICTION = 0.001;
    private readonly BALLS: Ball[] = [];
    private _mousePosition: [number, number] = [-this.CUE_RADIUS, -this.CUE_RADIUS];
    private _mouseVelocity: [number, number] = [0, 0];

    constructor(
        private readonly FIELD_WIDTH: number,
        private readonly FIELD_HEIGHT: number,
    ) { }

    get balls() {
        return this.BALLS;
    }

    get width() {
        return this.FIELD_WIDTH;
    }

    get height() {
        return this.FIELD_HEIGHT;
    }

    get mousePos() {
        return this._mousePosition;
    }

    set mousePos([x, y]: [number, number]) {
        this._mousePosition = [x, y];
    }

    get mouseVel() {
        return this._mouseVelocity;
    }

    set mouseVel([dx, dy]: [number, number]) {
        this._mouseVelocity = [dx, dy];
    }

    get mouseMode(): 'SELECTION' | 'CUE' {
        return this._mouseMode;
    }

    set mouseMode(newMode: 'SELECTION' | 'CUE') {
        this._mouseMode = newMode;
    }

    /**
     * Adds a specified ball to the balls array
     * @param newBall New ball to add
     */
    addBall(newBall: Ball): void {
        // Check against other balls and update readines flag
        const ready = this.balls.reduce(
            (newFlag, ball) => (newFlag && !ball.isColliding(newBall)),
            true
        );

        if (ready) this.balls.push(newBall);
    }

    /**
     Draws a ball on the canvas
     * @param ctx Canvas context to draw upon
     * @param debugMode When enabled - also draws velocity vectors
     */
    drawMouse(ctx: CanvasRenderingContext2D, debugMode = false): void {
        const [x, y] = this.mousePos;
        const [dx, dy] = this.mouseVel;
        const r = this.CUE_RADIUS;
        const cueStrength = this.CUE_STRENGTH;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = '#0f0';
        ctx.fill();

        // Optional: velocity vector
        if (debugMode) {
            ctx.strokeStyle = 'black';
            ctx.moveTo(x, y);
            ctx.lineTo(x + dx * cueStrength, y + dy * cueStrength);
        }

        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Add a random ball to the balls array
     */
    addRandomBall(): void {
        // IPS flag
        let iterations = 0;

        // Readiness flag - ready when new ball has no collisions
        let ready = false;

        // While not ready OR untill IPS didn't fire
        while (!ready && iterations++ < 100) {
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

            if (ready) this.balls.push(newBall);
        }
    }

    /**
     * Update the state of the game state, 1 frame skip at a time
     * Checks and handle potential collisions, updates coordinates based on velocity 
     */
    updateState(): void {
        this.balls.forEach(
            ball => {
                // Placeholder, think of some more efficient collision check
                for (let i = 0; i < this.balls.length; ++i) {
                    const otherBall = this.balls[i];
                    const collision = ball.isColliding(otherBall);

                    if (collision)
                        ball.handleCollision(otherBall);

                    // Handle ball to mouse interaction
                    if (this.mouseMode === 'CUE')
                        this.ballToCue(ball);
                }

                const [x, y] = ball.coords;
                const [dx, dy] = ball.velocity;

                // Apply velocity
                ball.coords = [x + dx, y + dy];

                // PLACEHOLDER for some back-up unclip

                // Apply friction to slow down over time
                const frictKoef = this.FRICTION;
                ball.velocity = [dx * (1 - frictKoef), dy * (1 - frictKoef)];

                // Border collision applied
                this.ballToBorder(ball);
            }
        )
    }

    findClickedBall(): Ball | undefined {
        if (this.mouseMode !== 'SELECTION') return undefined;
        const [mX, mY] = this.mousePos;

        return this.balls.find(
            (ball) => {
                const [x, y] = ball.coords;
                const r = ball.radius;

                return (
                    (mX >= x - r)
                    && (mX <= x + r)
                    && (mY >= y - r)
                    && (mY <= y + r)
                )
            }
        )
    }

    fillClickedBall() {
        // Fetch selected Ball
        // Change color
        // Clear selected Ball
    }

    /**
     * Helper function to check and handle collision of the ball with a cue (mouse)
     * @param ball Ball to check potential collision against
     */
    private ballToCue(ball: Ball): void {
        const [mX, mY] = this._mousePosition;
        const [mDx, mDy] = this._mouseVelocity;
        const r = this.CUE_RADIUS;
        const cueStrength = this.CUE_STRENGTH;

        // Virtual 'ball' representing mouse (cue)
        const cue = new Ball(mX, mY, r, mDx * cueStrength, mDy * cueStrength, 'BLUE');

        if (ball.isColliding(cue))
            ball.handleCollision(cue);
    }

    /**
     * Check wall collisions, unclip balls and changes velocity
     * @param ball Ball to check potential collision against
     */
    private ballToBorder(ball: Ball): void {
        const [x, y] = ball.coords;
        const [dx, dy] = ball.velocity;
        const r = ball.radius;
        const e = ball.restitution;

        let xBounce = false;
        let yBounce = false;

        // Right border
        if (x + r >= this.width) {
            ball.coords = [this.width - r, y];

            if (dx > 0) xBounce = true
        }

        // Left border
        if (x - r <= 0) {
            ball.coords = [r, y];

            if (dx < 0) xBounce = true;
        }

        // Top border
        if (y - r <= 0) {
            ball.coords = [ball.coords[0], r];

            if (dy < 0) yBounce = true;
        }

        // Bottom border
        if (y + r >= this.height) {
            ball.coords = [ball.coords[0], this.height - r];

            if (dy > 0) yBounce = true;
        }

        // Horizontal bounce
        if (xBounce)
            ball.velocity = [-dx * e, ball.velocity[1]];


        // Vertical bounce
        if (yBounce)
            ball.velocity = [ball.velocity[0], -dy * e];

    }
}
