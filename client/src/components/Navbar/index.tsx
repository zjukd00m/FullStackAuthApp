import React, { useState } from "react";
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

const profileMenu = [
    {
        element: <p> Settings </p>,
        action: () => {
            alert("Let's go to the settings");
        },
    },
    {
        element: <p> Sign out </p>,
        action: () => {
            alert("Will sign out");
        },
    },
];

interface NavbarProps {
    user: AuthUser;
}

export default function Navbar({ user }: NavbarProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);

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
