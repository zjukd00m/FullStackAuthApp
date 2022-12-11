import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Timer from "../../components/Timer";
import useAuth from "../../context/auth/AuthHook";
import useTimer from "../../hooks/Timer";

const baseDate = new Date();
baseDate.setMinutes(baseDate.getMinutes() + 1);

export default function Home() {
    const { user } = useAuth();

    const { setStopped, stopped, timer } = useTimer({ baseDate });
    
    function x() {
        setStopped(!stopped);
    }

    return  (
        <div>
            <Navbar user={user} />
            <div>
                <button onClick={x}>
                    { stopped ? "Start" : "Stop" }
                </button>
                { timer ? <Timer baseTime={baseDate} timer={timer} /> : null }
            </div>
            <div
                style={{
                    marginLeft: "60px",
                    marginRight: "60px",
                    marginTop: "30px",
                    height: "100%"
                }}
            >
                <Outlet />
            </div>
        </div>
    );
}
