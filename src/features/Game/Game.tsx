import React, { MouseEventHandler } from 'react';
import { GameState } from './GameState';

export const Game: React.FC = () => {
    console.log('GAME RENDERED!');
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameState = new GameState(800, 600);

    const clickHandler = () => { gameState.addRandomBall(); console.log(gameState.balls) };
    const moveHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
        console.log(e);
        const { clientX, clientY, movementX, movementY } = e;
        const { left, top } = canvasRef.current!.getBoundingClientRect();

        if (!left || !top)
            return;

        gameState.mousePos = [clientX - left, clientY - top];
        gameState.mouseVel = [movementX, movementY];
    };

    React.useEffect(
        () => {
            if (!canvasRef.current) return;

            const ctx = canvasRef.current.getContext('2d')!;

            function animation() {
                // Clear the screen
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

                // Draw mouse
                gameState.drawMouse(ctx);

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