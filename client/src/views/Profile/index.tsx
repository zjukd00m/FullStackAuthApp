import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./styles.css";

// TODO: Fix bugs here...
export default function Profile() {
    const location = useLocation();

    return (
        <div className="user-card-container">
            <Outlet />
            <div>
                <NavLink 
                    to="profile"
                    relative="path"
                    className={({ isActive }) => isActive ? "link-btn active-link" : "link-btn"}
                > 
                    Profile 
                </NavLink>
                <NavLink 
                    to="security" 
                    relative="path" 
                    className={({ isActive }) => isActive ? "link-btn active-link" : "link-btn"}
                > 
                    Security 
                </NavLink>
            </div>
        </div>
    )
}
