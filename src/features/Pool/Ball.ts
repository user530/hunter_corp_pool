export interface Ball {
    x: number;
    y: number;
    radius: number;
    dX: number;
    dY: number;
    color: string;
}

export const newBall = (cvWidth: number, cvHeight: number, radius: number, color?: string): Ball => {
    return {
        x: Math.random() * cvWidth,
        y: Math.random() * cvHeight,
        radius,
        dX: 0,
        dY: 0,
        color: color || `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }
}

export const drawBall = (ctx: CanvasRenderingContext2D, ball: Ball) => {
    const { x, y, radius, color } = ball;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}