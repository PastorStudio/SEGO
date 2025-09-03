
'use client'

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from '@/hooks/use-window-size';

type ConfettiCannonProps = {
    active: boolean;
    onComplete?: () => void;
};

export function ConfettiCannon({ active, onComplete }: ConfettiCannonProps) {
    const { width, height } = useWindowSize();
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (active) {
            setIsRunning(true);
        }
    }, [active]);

    const handleConfettiComplete = () => {
        setIsRunning(false);
        if (onComplete) {
            onComplete();
        }
    };
    
    if (!active) {
        return null;
    }

    return (
        <Confetti
            width={width}
            height={height}
            recycle={isRunning}
            numberOfPieces={isRunning ? 200 : 0}
            onConfettiComplete={handleConfettiComplete}
            gravity={0.15}
        />
    );
}

