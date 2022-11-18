import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import useAuth from "../../context/auth/AuthHook";

export default function Home() {
    const { user } = useAuth();
    return (
        <div>
            <Navbar user={user} />
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
