import { timestamp2TimeString } from "../../utils/time";

interface TimerProps {
    timer: number;
    baseTime: Date;
}


export default function Timer (props: TimerProps) {
    const { timer, baseTime } = props;

    return (
        <div className="">
            <p className="">
                { timestamp2TimeString(timer, baseTime) } 
            </p>
        </div>
    )
}