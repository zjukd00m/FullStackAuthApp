import { useCallback, useEffect, useState, useRef } from "react";

export enum TimerType {
    COUNT_DOWN = "COUNT_DOWN",
    COUNT_UP = "COUNT_UP"
}

export interface TimerProps {
    timerType?: TimerType;
    // The date to be reached by the timer
    baseDate: Date;
    // Function to be executed when the timer expires
    onExpiry?: () => void;
}

export default function useTimer(timerProps: TimerProps) {
    const { timerType, baseDate, onExpiry } = timerProps;
    // This value is updated each second to reflect the time that has
    // passes since the startTime or the time left to reach the expiresAt value
    // Since it's an integer number, use the utility function from time
    const [timer, setTimer] = useState<number>(-1);
    const [stopped, setStopped] = useState<boolean>(true);
    const intervalRef = useRef<NodeJS.Timer>();

    useEffect(() => {
        if (stopped && intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = undefined;
        }

        if (timer <= 0) {
            setTimer(new Date().getTime());
        }

        if (!stopped && timer > 0) {
            tick();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = undefined;
            }
        }
    }, [stopped, timer]);
    
    function tick () {
        const intervalID = setInterval(() => {
            if (stopped) return;

            // When the timer reaches the base date, then reset it to the original state
            if (baseDate.getTime() === timer) {
                setStopped(true);
                setTimer(-9999);

                if (typeof(onExpiry) === "function") {
                    onExpiry();
                }

                return;
            }

            setTimer(() => new Date().getTime());
        }, 1000);

        intervalRef.current = intervalID;
    }
    
    return {
        setStopped,
        stopped,
        timer,
    }

}