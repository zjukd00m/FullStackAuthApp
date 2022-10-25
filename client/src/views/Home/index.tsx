import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";

export default function Home() {
    return (
        <div>
            <Navbar />
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
