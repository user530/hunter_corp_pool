import React, { MouseEventHandler } from 'react';
import { GameState } from './GameState';

interface MouseData {
    mousePos: [number, number];
    mouseVel: [number, number];
}

export const Game: React.FC = () => {
    console.log('GAME RENDERED!');
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const mouseRef = React.useRef<MouseData>({ mousePos: [0, 0], mouseVel: [0, 0] });
    const gameState = new GameState(800, 600);

    const clickHandler = () => { gameState.addRandomBall(); console.log(gameState.balls) };
    const moveHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
        const { clientX, clientY, movementX, movementY } = e;
        const { left, top } = canvasRef.current!.getBoundingClientRect();

        if (!left || !top || !mouseRef.current)
            return;

        mouseRef.current = { ...mouseRef.current, mousePos: [clientX - left, clientY - top] };
        mouseRef.current = { ...mouseRef.current, mouseVel: [movementX, movementY] };
    };

    React.useEffect(
        () => {
            if (!canvasRef.current) return;

            const ctx = canvasRef.current.getContext('2d')!;

            function animation() {
                // Clear the screen
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                // Fetch mouse data from the frame
                if (mouseRef.current) {
                    const { mousePos, mouseVel } = mouseRef.current!;
                    gameState.mousePos = mousePos;
                    gameState.mouseVel = mouseVel;

                    // Draw mouse
                    gameState.drawMouse(ctx);
                }


                // Update game state
                gameState.updateState();

                // Draw it
                gameState.balls.forEach(
                    ball => ball.draw(ctx)
                )

                // Repeat
                requestAnimationFrame(animation)
            }

            requestAnimationFrame(animation);

        },
        []
    )

    return (
        <>
            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ backgroundColor: 'white' }}
                onClick={clickHandler}
                onMouseMove={moveHandler}
            ></canvas>
        </>
    )
}