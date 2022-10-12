import { Link } from "react-router-dom";
import { AiFillEdit } from "react-icons/ai";
import useAuth from "../../context/auth/AuthHook"
import { AuthUser, AuthUserEdit } from "../../context/auth/types";
import "./styles.css";
import { useState } from "react";
import { userService } from "../../services/users";

interface UserCardProps {
    user: AuthUser;
}

const DEFAULT_USER_AVATAR = "https://imgs.search.brave.com/lMxuKwFzR-jhWAjWhFLwRAkTNjWMjs08M1_X_PFMnmQ/rs:fit:512:512:1/g:ce/aHR0cHM6Ly9jZG4z/Lmljb25maW5kZXIu/Y29tL2RhdGEvaWNv/bnMvYXZhdGFycy0x/NS82NC9fTmluamEt/Mi01MTIucG5n";

function UserCard(props?: UserCardProps) {
    const { user, updateUser } = useAuth();
    const [enableEditPhone, setEnableEditPhone] = useState(false);
    const [enableEditName, setEnableEditName] = useState(false);
    const [enableEditAvatar, setEnableEditAvatar] = useState(false);
    const [phone, setPhone] = useState(user.phone_number);
    const [name, setName] = useState(user.display_name);
    const [avatar, setAvatar] = useState(user.avatar || DEFAULT_USER_AVATAR);

    async function handleSubmitUserForm(e: any) {
        e.preventDefault();

        if (!phone?.length || !name?.length) return;

        const userData: AuthUserEdit = {
            active: user.active,
            ...(avatar?.length ? { avatar } : { avatar: DEFAULT_USER_AVATAR  }),
            ...(phone?.length && { phone_number: phone }),
            ...(name?.length && { display_name: name }),
        }
       
        await userService.editUser(user.id, userData, {
            onHTTPSuccess: (data) => {
                console.log(data);
                updateUser(data);
            },
            onHTTPError: (status, data) => {
                console.log(data);
                alert(status);
            },
            onHTTPNetworkError: (e) => {
                console.log(e.message);
            }
        })
    }

    return (
        <div className="user-card-container">
            <div>
                <form className="card-form" onSubmit={handleSubmitUserForm}>
                    <div className="card-form-element">
                        <label> Avatar </label>
                        <img className="card-form-img" src={user.avatar || DEFAULT_USER_AVATAR} height="150" width="150" />
                        {/* <input className="card-form-img-input" type="file" /> */}
                        <div className="card-form-input-group input-with-icon">
                            <input className="card-form-input" value={avatar} style={{ paddingRight: "3rem", overflow: "hidden" }}  type="text" onChange={(e) => setAvatar(e.target.value)} disabled={!enableEditAvatar} />
                            <AiFillEdit className="card-form-element-icon" onClick={() => setEnableEditAvatar(!enableEditAvatar)} /> 
                        </div>
                    </div>
                    <div className="card-form-element">
                        <label> Name </label>
                        <div className="card-form-input-group input-with-icon">
                            <input type="text" className="card-form-input" value={name} onChange={(e) => enableEditName && setName(e.target.value)} disabled={!enableEditName} />
                            <AiFillEdit className="card-form-element-icon" onClick={() => setEnableEditName(!enableEditName)} /> 
                        </div>
                    </div>
                    <div className="card-form-element">
                        <label> Phone </label>
                        <div className="card-form-input-group input-with-icon">
                            <input type="text" className="card-form-input" value={phone} onChange={(e) => enableEditPhone && setPhone(e.target.value)} disabled={!enableEditPhone}/>
                            <AiFillEdit className="card-form-element-icon" onClick={() => setEnableEditPhone(!enableEditPhone)} /> 
                        </div>
                    </div>
                    <button className="user-card-btn btn btn-primary btn-small"> Save </button>
                </form>
                <p> Last Sign in: <span> { user.last_sign_in } </span> </p>
                <p> Active: <span> { user.active ? "True" : "False" } </span> </p>
                <div className="card-confirmed-container">
                    <p> Confirmed: <span> { user.confirmed ? "True" : "False" } </span> </p>
                    { !user.confirmed && <button className="btn btn-primary btn-small"> Send email </button> }
                </div>
                <p> Created at: <span> { user.created_at } </span> </p>
            </div>
            <div>
                <Link to="/profile"> <p> Profile </p> </Link>
                <Link to="/profile/security"> <p> Security </p> </Link>
            </div>
        </div>
    )
}

export default function Profile() {
    const { user } = useAuth();

    return (
        <div>
            <UserCard user={user} />
        </div>
    )
}