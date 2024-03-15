import React, { MouseEventHandler, useRef, useState } from 'react';
import styles from './Pool.module.scss';
import { Ball, drawBall, newBall } from './Ball';
import { drawCue } from './Cue';

export const Pool = () => {
    const poolRef = useRef<HTMLCanvasElement>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    const [line, setLine] = useState<{ x0: number, y0: number, x1: number, y1: number }>({ x0: 0, y0: 0, x1: 0, y1: 0 });

    const handleClick = () => console.log('Canvas clicked!');
    const handleMouseMove: MouseEventHandler<HTMLCanvasElement> = (e) => {
    };

    const handleAddBallClick = () => {
        // No canvas = no balls
        if (!poolRef.current) return;

        const { width, height } = poolRef.current;

        // Add new ball
        setBalls([...balls, newBall(width, height, 30)]);
    };

    // Visualize each time balls update
    React.useEffect(
        () => {
            console.log('Effect');
            if (!poolRef.current) return;

            const ctx = poolRef.current.getContext('2d')!;
            const { width, height, } = poolRef.current;

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw cue
            const { x0, x1, y0, y1 } = line;

            drawCue(ctx, { x: x0, y: y0 }, { x: x1, y: y1 });

            // Draw balls
            balls.forEach(
                ball => drawBall(ctx, ball)
            )
        },
        [balls, line]
    )

    return (
        <div className={styles['game-wrapper']}>
            <canvas
                ref={poolRef}
                className={styles['pool']}
                width={800}
                height={600}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
            />

            <div className={styles['game-controls']}>
                <button className={styles['btn']} onClick={handleAddBallClick}>Add Ball</button>
            </div>
        </div>
    )
}