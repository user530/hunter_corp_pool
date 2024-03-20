import React from 'react';
import { GameState } from './GameState';
import styles from './Game.module.css';
import { useRender } from './useRender';
import { useMouse } from './useMouse';
import { useGameUI } from './useGameUI';

export interface MouseData {
    mousePos: [number, number];
    mouseVel: [number, number];
}

export const Game: React.FC = () => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameRef = React.useRef<GameState>(new GameState(800, 600));
    const gameState = gameRef.current;

    // Custom hook to handle mouse related functionality
    const { mouseMode, setMouseMode, mouseRef } = useMouse();

    // Activate required mouse mode on render 
    gameState.mouseMode = mouseMode;

    // Custom hook that handles render
    useRender(canvasRef, gameRef, mouseMode, mouseRef);

    // Custom hook that handles UI logic
    const {
        addRandomBtnHandler,
        ballClickHandler,
        mouseModeBtnHandler,
        moveHandler,
        popupInputRef,
        popupRef,
        popupSubmitHandler,
    } = useGameUI(canvasRef, mouseRef, gameRef, setMouseMode);

    return (
        <section className={styles["container"]}>
            <h1 className={styles["h1"]}>Pool game</h1>
            <div className={styles["canvas-wrapper"]}>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{ backgroundColor: 'white' }}
                    onClick={ballClickHandler}
                    onMouseMove={moveHandler}
                ></canvas>

                <form
                    ref={popupRef}
                    className={styles['popup']}
                    onSubmit={popupSubmitHandler}
                >
                    <h3>Pick a color</h3>
                    <input type="submit" value="Apply color" />
                    <input ref={popupInputRef} type="color" className="color-input" />
                </form>
            </div>

            <div className={styles["game-controls"]}>
                <button
                    onClick={mouseModeBtnHandler}
                >{
                        mouseMode === 'SELECTION'
                            ? 'Cue'
                            : 'Selection'
                    }</button>

                <button
                    onClick={addRandomBtnHandler}
                >Add random ball</button>
            </div>
        </section>
    )
}