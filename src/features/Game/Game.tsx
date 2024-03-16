import React from 'react';
import { GameState } from './GameState';

export const Game: React.FC = () => {
    console.log('GAME RENDERED!');
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameState = new GameState(800, 600);

    const clickHandler = () => gameState.addRandomBall();

    React.useEffect(
        () => {
            if (!canvasRef.current) return;
            // setInterval(
            //     () => console.log(gameState.balls),
            //     1000
            // );
            const ctx = canvasRef.current.getContext('2d')!;

            function animation() {
                gameState.balls.forEach(
                    ball => ball.draw(ctx)
                )

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