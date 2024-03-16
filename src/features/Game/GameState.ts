type BallColors = 'RED' | 'GREEN' | 'BLUE';

class Ball {
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

    addRandomBall() {
        this._balls.push(Ball.randomBall(
            {
                fieldWidth: this._fieldWidth,
                fieldHeight: this._fieldHeight
            }
        ))
    }
}
