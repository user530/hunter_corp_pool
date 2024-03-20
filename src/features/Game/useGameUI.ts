import React, { FormEventHandler, MouseEventHandler } from 'react';
import { GameState } from './GameState';
import styles from './Game.module.css';
import { MouseData } from './Game';

export const useGameUI = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    mouseRef: React.MutableRefObject<MouseData>,
    gameRef: React.RefObject<GameState>,
    setMouseMode: React.Dispatch<React.SetStateAction<"SELECTION" | "CUE">>
) => {
    const popupRef = React.useRef<HTMLFormElement>(null);
    const popupInputRef = React.useRef<HTMLInputElement>(null);
    const gameState = gameRef.current!;

    const closePopup = () => {
        popupRef.current?.classList.remove(styles['popup--active']);
        gameState.selectedBall = null;
    }

    const ballClickHandler = () => {
        // Handle selection in the game state
        gameState.selectClicked();

        // If click hit the ball
        if (gameState.selectedBall) {
            // Set ball color as default color
            popupInputRef.current!.value = gameState.selectedBall.color;
            // Show popup window
            popupRef.current?.classList.add(styles['popup--active']);
        }
        // Empty space click
        else
            closePopup();
    };

    const popupSubmitHandler: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        const newColor = popupInputRef.current!.value;

        if (!gameState.selectedBall) return;

        // If valid - update ball color
        gameState.selectedBall.color = newColor;

        closePopup();
    };

    const mouseModeBtnHandler = () => {
        setMouseMode(current => current === 'SELECTION' ? 'CUE' : 'SELECTION');
    };

    const addRandomBtnHandler = () => {
        gameState.addRandomBall();
    }

    const moveHandler: MouseEventHandler<HTMLCanvasElement> = (e) => {
        const { clientX, clientY, movementX, movementY } = e;
        const { left, top } = canvasRef.current!.getBoundingClientRect();

        if (!left || !top || !mouseRef.current)
            return;

        mouseRef.current = { ...mouseRef.current, mousePos: [clientX - left, clientY - top] };
        mouseRef.current = { ...mouseRef.current, mouseVel: [movementX, movementY] };
    };

    return {
        popupRef,
        popupInputRef,
        ballClickHandler,
        popupSubmitHandler,
        mouseModeBtnHandler,
        addRandomBtnHandler,
        moveHandler,
    }
}