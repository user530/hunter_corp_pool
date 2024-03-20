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
    console.log('GAME RENDERED!');
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const gameRef = React.useRef<GameState>(new GameState(800, 600));
    const gameState = gameRef.current;
    // const [mouseMode, setMouseMode] = React.useState<'SELECTION' | 'CUE'>('SELECTION');
    // const mouseRef = React.useRef<MouseData>({ mousePos: [-100, -100], mouseVel: [0, 0] });
    // const gameState = React.useMemo(() => new GameState(800, 600), []);

    // Custom hook to handle mouse related functionality
    const { mouseMode, setMouseMode, mouseRef } = useMouse();

    // Activate required mouse mode on render 
    gameState.mouseMode = mouseMode;

    // Custom hook that handles render
    useRender(canvasRef, gameRef, mouseMode, mouseRef);

    // Custom hook that stores all ui handlers
    const {
        addRandomBtnHandler,
        ballClickHandler,
        mouseModeBtnHandler,
        moveHandler,
        popupInputRef,
        popupRef,
        popupSubmitHandler,
    } = useGameUI(canvasRef, mouseRef, gameRef, setMouseMode);


    // const popupRef = React.useRef<HTMLFormElement>(null);
    // const popupInputRef = React.useRef<HTMLInputElement>(null);


    // const ballClickHandler = () => {
    //     // Handle selection
    //     gameState.selectClicked();

    //     // CHANGE
    //     if (gameState.selectedBall) {
    //         popupInputRef.current!.value = gameState.selectedBall.color;
    //         // Show popup window
    //         popupRef.current?.classList.add(styles['popup--active']);
    //     }
    //     else
    //         popupRef.current?.classList.remove(styles['popup--active']);
    //     // Set Selected color + Pause frame?
    // };

    // const popupSubmitHandler: FormEventHandler<HTMLFormElement> = (e) => {
    //     e.preventDefault();
    //     // Get new color
    //     const newColor = popupInputRef.current?.value;

    //     if (!newColor) return; // Signal and close popup

    //     if (!gameState.selectedBall) return;
    //     // If valid - update ball color
    //     gameState.selectedBall.color = newColor;

    //     popupRef.current?.classList.remove(styles['popup--active']);
    //     gameState.selectedBall = null;
    // };

    // const popupCancelClickHandler = () => {
    //     // Close popup + Clear selection 
    //     popupRef.current?.classList.remove(styles['popup--active']);
    //     gameState.selectedBall = null;
    // };

    // const mouseModeBtnHandler = () => {
    //     setMouseMode(current => current === 'SELECTION' ? 'CUE' : 'SELECTION');
    // };

    // const addRandomBtnHandler = () => {
    //     gameState.addRandomBall();
    //     console.log(gameState.balls)
    // }

    // const moveHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
    //     const { clientX, clientY, movementX, movementY } = e;
    //     const { left, top } = canvasRef.current!.getBoundingClientRect();

    //     if (!left || !top || !mouseRef.current)
    //         return;

    //     mouseRef.current = { ...mouseRef.current, mousePos: [clientX - left, clientY - top] };
    //     mouseRef.current = { ...mouseRef.current, mouseVel: [movementX, movementY] };
    // };



    // React.useEffect(
    //     () => {
    //         if (!canvasRef.current) return;

    //         const ctx = canvasRef.current.getContext('2d')!;

    //         function animation() {
    //             // Clear the screen
    //             ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    //             // Fetch mouse data from the frame
    //             if (mouseRef.current) {
    //                 const { mousePos, mouseVel } = mouseRef.current!;
    //                 gameState.mousePos = mousePos;
    //                 gameState.mouseVel = mouseVel;

    //                 // Draw mouse
    //                 if (mouseMode === 'CUE')
    //                     gameState.drawMouse(ctx);
    //             }

    //             // Update game state
    //             gameState.updateState();

    //             // Draw it
    //             gameState.drawBalls(ctx);

    //             // Repeat
    //             requestAnimationFrame(animation)
    //         }

    //         requestAnimationFrame(animation);

    //     },
    //     [gameState, mouseMode]
    // )

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
                >{mouseMode === 'SELECTION'
                    ? 'CUE'
                    : 'SELECTION'
                    }</button>

                <button
                    onClick={addRandomBtnHandler}
                >Add random ball</button>
            </div>
        </section>
    )
}