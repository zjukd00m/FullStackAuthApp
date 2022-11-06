import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../context/auth/AuthHook";
import "./styles.css";

interface DropdownMenuProps {
    options: {
        element: React.ReactNode;
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


export default function Navbar() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { user, signOut } = useAuth();

    const profileMenu = [
        {
            element: <Link to="/profile" className="link-element"> <p> Settings </p> </Link>,
            action: () => { }
        },
        {
            element: <p> Sign out </p>,
            action: () => signOut({
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
            })
        },
    ];

    function handleProfileClick() {
        setShowProfileMenu(!showProfileMenu);
    }

    if (!user?.id) {
        return null;
    }

    return (
        <div className="navigation-container">
            <nav className="navigation">
                <div className="nav-header">
                    <p className="nav-title"> Admin Dashboard </p>
                </div>
                <ul className="nav-sections">
                    <li className="nav-section">
                        <img
                            alt="avatar"
                            src={user.avatar ? user.avatar : "https://cdn3.iconfinder.com/data/icons/avatars-15/64/_Ninja-2-512.png"}
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
