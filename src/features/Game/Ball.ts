export class Ball {
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
        const randomRadius = Math.max(25, Math.random() * Math.min(fieldWidth, fieldHeight) / BALL_RADIUS_RATIO);
        const x = Math.max(randomRadius, Math.min(fieldWidth - randomRadius, Math.random() * fieldWidth));
        const y = Math.max(randomRadius, Math.min(fieldHeight - randomRadius, Math.random() * fieldHeight));
        const dx = (0.5 - Math.random()) * 2 * MAX_SPEED;
        const dy = (0.5 - Math.random()) * 2 * MAX_SPEED;
        // Random HEX color formula (https://www.30secondsofcode.org/js/s/random-hex-color-code/)
        const randomColor = `#${(Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6)}`;

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