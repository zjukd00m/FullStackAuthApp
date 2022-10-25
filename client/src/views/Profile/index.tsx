import { Link, Outlet } from "react-router-dom";
import "./styles.css";

export default function Profile() {
    return (
        <div className="user-card-container">
            <Outlet />
            <div>
                <Link to="/profile" className="link-btn"> Profile </Link>
                <Link to="/profile/security" className="link-btn"> Security </Link>
            </div>
        </div>
    )
}
