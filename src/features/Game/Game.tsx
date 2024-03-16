import React from 'react';
import { GameState } from './GameState';

export const Game: React.FC = () => {
    console.log('GAME RENDERED!');
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameState = new GameState(800, 600);

    const clickHandler = () => { gameState.addRandomBall(); console.log(gameState.balls) };

    React.useEffect(
        () => {
            if (!canvasRef.current) return;
            // setInterval(
            //     () => console.log(gameState.balls),
            //     1000
            // );
            const ctx = canvasRef.current.getContext('2d')!;

            function animation() {
                // Clear the screen
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

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
            ></canvas>
        </>
    )
}