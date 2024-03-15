import React, { useRef, useState } from 'react';
import styles from './Pool.module.scss';
import { Ball, drawBall, newBall } from './Ball';

export const Pool = () => {
    const poolRef = useRef<HTMLCanvasElement>(null);
    const [balls, setBalls] = useState<Ball[]>([]);
    console.log(balls);
    const handleClick = () => console.log('Canvas clicked!');
    const handleMouseMove = () => console.log('Mouse moved!');

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
            console.log(ctx, width, height);
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            // Draw balls
            balls.forEach(
                ball => drawBall(ctx, ball)
            )
        },
        [balls]
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