import { Ball } from './Ball';

export class GameState {
    private _mouseMode: 'SELECTION' | 'CUE' = 'SELECTION';
    private readonly CUE_RADIUS = 12;
    private readonly CUE_STRENGTH = 0.3;
    private readonly FRICTION = 0.001;
    private readonly BALLS: Ball[] = [];
    private _mousePosition: [number, number] = [-this.CUE_RADIUS, -this.CUE_RADIUS];
    private _mouseVelocity: [number, number] = [0, 0];
    private _selectedBall: Ball | null = null;
    private _selectionAngle = 0;

    constructor(
        private readonly FIELD_WIDTH: number,
        private readonly FIELD_HEIGHT: number,
    ) { }

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

    get selectedBall(): Ball | null {
        return this._selectedBall;
    }

    set selectedBall(newSelection: Ball | null) {
        this._selectedBall = newSelection;
    }

    /**
     * Adds a specified ball to the balls array
     * @param newBall New ball to add
     */
    addBall(newBall: Ball): void {
        // Check against other balls and update readines flag
        const ready = this.BALLS.reduce(
            (newFlag, ball) => (newFlag && !ball.isColliding(newBall)),
            true
        );

        if (ready) this.BALLS.push(newBall);
    }

    /**
     * Draw all balls to the context (add selection mark if there is a selected ball)
     * @param ctx Canvas context to draw upon
     * @param debugMode When enabled - also draws velocity vectors for balls
     */
    drawBalls(ctx: CanvasRenderingContext2D, debugMode = false): void {
        // Draw all stored balls
        this.BALLS.forEach(
            ball => ball.draw(ctx, debugMode)
        );

        if (!this.selectedBall) return;

        const [x, y] = this.selectedBall.coords;
        const r = this.selectedBall.radius;
        const triangleHeight = 20;

        // Draw selection triangles
        for (let i = 0; i < 4; ++i) {
            const angle = this._selectionAngle + i * Math.PI / 2;
            const triangleX = x + r * Math.cos(angle);
            const triangleY = y + r * Math.sin(angle);

            drawSelection(triangleX, triangleY, triangleHeight, angle);
        }

        // Function to draw rotated triangle
        function drawSelection(centerX: number, centerY: number, size: number, angle: number) {
            // Calculate triangle vertices
            const height = size * Math.sqrt(3) / 2;

            const topX = centerX - Math.cos(angle) * height / 2;
            const topY = centerY - Math.sin(angle) * height / 2;

            const baseLeftX = centerX + Math.cos(angle + Math.PI / 3) * height / 2;
            const baseLeftY = centerY + Math.sin(angle + Math.PI / 3) * height / 2;

            const baseRightX = centerX + Math.cos(angle - Math.PI / 3) * height / 2;
            const baseRightY = centerY + Math.sin(angle - Math.PI / 3) * height / 2;

            // Draw the triangle
            ctx.beginPath();
            ctx.moveTo(topX, topY);
            ctx.lineTo(baseLeftX, baseLeftY);
            ctx.lineTo(baseRightX, baseRightY);
            ctx.fillStyle = 'white';
            ctx.fill()
            ctx.closePath();
            ctx.stroke();
        }

        // Increment rotation angle
        this._selectionAngle -= 0.015;
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
            ready = this.BALLS.reduce(
                (newFlag, ball) => (newFlag && !ball.isColliding(newBall)), true
            );

            if (ready) this.BALLS.push(newBall);
        }
    }

    /**
     * Update the state of the game state, 1 frame skip at a time
     * Checks and handle potential collisions, updates coordinates based on velocity 
     */
    updateState(): void {
        this.BALLS.forEach(
            ball => {
                // Placeholder, think of some more efficient collision check
                for (let i = 0; i < this.BALLS.length; ++i) {
                    const otherBall = this.BALLS[i];
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

    /**
     * Check current mouse position and either set or clear ball selection
     */
    selectClicked(): void {
        if (this.mouseMode !== 'SELECTION') return;

        const [mX, mY] = this.mousePos;

        // Selection click result
        const result: Ball | undefined = this.BALLS.find(
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

        this.selectedBall = result ? result : null;
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
