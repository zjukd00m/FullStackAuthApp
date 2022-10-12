import React, { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../context/auth/AuthHook";
import { AuthUser } from "../../context/auth/types";
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


interface NavbarProps {
    user: AuthUser;
}

export default function Navbar({ user }: NavbarProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { signOut } = useAuth();

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

    return (
        <div className="navigation-wrapper">
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
