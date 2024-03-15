import { useRef } from 'react';
import styles from './Pool.module.scss';

export const Pool = () => {
    const poolRef = useRef<HTMLCanvasElement>(null);

    const handleClick = () => console.log('Canvas clicked!');
    const handleMouseMove = () => console.log('Mouse moved!');
    const handleAddBallClick = () => console.log('Add ball clicked!');

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