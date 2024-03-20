import React from 'react';
import { GameState } from './GameState';

interface MouseData {
    mousePos: [number, number];
    mouseVel: [number, number];
}

export const useRender = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    gameRef: React.RefObject<GameState>,
    mouseMode: 'CUE' | 'SELECTION',
    mouseRef: React.RefObject<MouseData>
): void => {
    const gameState = gameRef.current!;

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
                    if (mouseMode === 'CUE')
                        gameState.drawMouse(ctx);
                }

                // Update game state
                gameState.updateState();

                // Draw it
                gameState.drawBalls(ctx);

                // Repeat
                requestAnimationFrame(animation)
            }

            requestAnimationFrame(animation);

        },
        [gameState, mouseMode]
    )
}