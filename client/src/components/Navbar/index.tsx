import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../context/auth/AuthHook";
import { AuthUser } from "../../context/auth/types";
import "./styles.css";

interface NavbarProps {
    user: AuthUser;
}

interface DropdownMenuProps {
    options: {
        element: string;
        action: () => void;
    }[];
}

function DropdownMenu(props: DropdownMenuProps) {
    const { options } = props;
    return (
        <ul className="dropdown-list">
            {options?.map(({ element, action }, index) => (
                <li key={index} className="dropdown-element" onClick={action}>
                    {element}
                </li>
            ))}
        </ul>
    );
}


export default function Navbar(props: NavbarProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { user } = props;
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const profileMenu = [
        {
            element: "Settings",
            action: () => {
                setShowProfileMenu(false);
                navigate(`${location.pathname}/profile`);
            }
        },
        {
            element: "Sign out",
            action: () => {
                setShowProfileMenu(false);
                signOut({
                    onHTTPSuccess: (data) => {
                        console.log(data);
                    },
                    onHTTPError: (status, data) => {
                        console.log(status);
                        console.log(data);
                    },
                    onHTTPNetworkError: (e) => {
                        console.log(e.message);
                    }
                });
            } 
        },
    ];

    function handleProfileClick() {
        setShowProfileMenu(!showProfileMenu);
    }

    return (
        <div className="navigation-container">
            <nav className="navigation">
                <div className="nav-header">
                    <Link to={user?.groups?.includes("ADMIN") ? "/admin" : "/"} className="nav-title">
                        Admin Dashboard
                    </Link>
                </div>
                <ul className="nav-sections">
                    <li className="nav-section">
                        <img
                            alt="avatar"
                            src={user?.avatar ? user.avatar : ""}
                            height={50}
                            width={50}
                            className="user-avatar"
                            onClick={handleProfileClick}
                        />
                        {showProfileMenu && (
                            <DropdownMenu options={profileMenu} />
                        )}
                    </li>
                </ul>
            </nav>
        </div>
    );
}
