import React from 'react';
import { MouseData } from './Game';

export const useMouse = () => {
    const [mouseMode, setMouseMode] = React.useState<'SELECTION' | 'CUE'>('SELECTION');
    const mouseRef = React.useRef<MouseData>({ mousePos: [-100, -100], mouseVel: [0, 0] });

    return {
        mouseMode,
        setMouseMode,
        mouseRef,
    }
}