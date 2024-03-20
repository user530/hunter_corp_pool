import React, { FormEventHandler, MouseEventHandler } from 'react';
import { GameState } from './GameState';
import styles from './Game.module.css';

interface MouseData {
    mousePos: [number, number];
    mouseVel: [number, number];
}

export const Game: React.FC = () => {
    console.log('GAME RENDERED!');
    const [mouseMode, setMouseMode] = React.useState<'SELECTION' | 'CUE'>('SELECTION');
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const mouseRef = React.useRef<MouseData>({ mousePos: [-100, -100], mouseVel: [0, 0] });
    const gameState = React.useMemo(() => new GameState(800, 600), []);


    const popupRef = React.useRef<HTMLFormElement>(null);
    const popupInputRef = React.useRef<HTMLInputElement>(null);

    // Activate required mouse mode on render 
    gameState.mouseMode = mouseMode;

    const ballClickHandler = () => {
        // Handle selection
        gameState.selectClicked();

        // CHANGE
        if (gameState.selectedBall) {
            console.log(gameState.selectedBall.color)
            // Show popup window
            popupRef.current?.classList.add(styles['popup--active']);
        }
        else
            popupRef.current?.classList.remove(styles['popup--active']);
        // Set Selected color + Pause frame?
    };

    const popupSubmitHandler: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        // Get new color
        const newColor = popupInputRef.current?.value;
        console.log(newColor);
        if (!newColor) return; // Signal and close popup
        // Validate it
        const isValidColor = /^/.test(newColor);
        if (!isValidColor) return; // Signal and close popup
        if (!gameState.selectedBall) return;
        // If valid - update ball color
        gameState.selectedBall.color = newColor;

        popupRef.current?.classList.remove(styles['popup--active']);
        gameState.selectedBall = null;
    };


    const popupCancelClickHandler = () => {
        // Close popup + Clear selection 
        popupRef.current?.classList.remove(styles['popup--active']);
        gameState.selectedBall = null;
    };

    const mouseModeBtnHandler = () => {
        setMouseMode(current => current === 'SELECTION' ? 'CUE' : 'SELECTION');
    };

    const addRandomBtnHandler = () => {
        gameState.addRandomBall();
        console.log(gameState.balls)
    }

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

    return (
        <>
            <form
                ref={popupRef}
                className={styles['popup']}
                onSubmit={popupSubmitHandler}
            >
                <h3>Pick a color</h3>
                <input ref={popupInputRef} type="text" className="color-input" placeholder='#FFF' pattern='^#(?:[0-9a-fA-F]{3,4}){1,2}$' />
                <input type="submit" value="Set color" />
                <input type="button" value="Cancel" onClick={popupCancelClickHandler} />
            </form>

            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                style={{ backgroundColor: 'white' }}
                onClick={ballClickHandler}
                onMouseMove={moveHandler}
            ></canvas>

            <button
                onClick={mouseModeBtnHandler}
            >SET MOUSE MODE: {mouseMode === 'SELECTION'
                ? 'CUE'
                : 'SELECTION'
                }</button>

            <button
                onClick={addRandomBtnHandler}
            >Add random ball</button>
        </>
    )
}