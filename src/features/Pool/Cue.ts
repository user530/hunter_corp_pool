export interface Point {
    x: number;
    y: number;
}

export const drawCue = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    console.log('draw cue');
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.closePath();
}