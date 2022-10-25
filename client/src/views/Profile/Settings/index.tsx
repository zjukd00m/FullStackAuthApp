import { useEffect, useRef } from "react";
import { AiFillEdit } from "react-icons/ai";
import { toast } from "react-toastify";
import { Buffer } from "buffer";
import useAuth from "../../../context/auth/AuthHook"
import { AuthUserEdit } from "../../../context/auth/types";
import { useState } from "react";
import { userService } from "../../../services/users";

const DEFAULT_USER_AVATAR = "https://imgs.search.brave.com/lMxuKwFzR-jhWAjWhFLwRAkTNjWMjs08M1_X_PFMnmQ/rs:fit:512:512:1/g:ce/aHR0cHM6Ly9jZG4z/Lmljb25maW5kZXIu/Y29tL2RhdGEvaWNv/bnMvYXZhdGFycy0x/NS82NC9fTmluamEt/Mi01MTIucG5n";


export default function ProfileSettings() {
    const { user, updateUser } = useAuth();
    const [enableEditPhone, setEnableEditPhone] = useState<boolean>(false);
    const [enableEditName, setEnableEditName] = useState<boolean>(false);
    const [phone, setPhone] = useState<string | undefined>("");
    const [name, setName] = useState<string | undefined>("");
    const [avatar, setAvatar] = useState<string | undefined>("");
    const [avatarFile, setAvatarFile] = useState<{
        content: string;
        type: string;
    }>();

    const avatarBtnRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;
        setName(user.display_name);
        setPhone(user.phone_number);
        setAvatar(user.avatar);
    }, [user]);

    useEffect(() => {
        if (!avatarBtnRef) return;

        avatarBtnRef.current?.addEventListener("change", async () => {
            const files = avatarBtnRef.current?.files;

            if (!files?.length) return;
            
            const { type, size } = files[0];

            if (type !== "image/png" && type !== "image/jpeg") {
                toast.warn(`The mimetype ${type} is not supported`);
                return;
            } else if (size / (1024 ** 2) > 10.0) {
                toast.warn("The image size can't be greater than 10 MB");
                return;
            }

            if (avatarBtnRef?.current)
                avatarBtnRef.current.style.backgroundColor = "green";

            const buffer = await files[0].arrayBuffer();

            const imageBase64 = Buffer.from(buffer).toString("base64");

            setAvatarFile({ content: imageBase64, type });
        });
    }, []);

    async function handleSubmitUserForm(e: any) {
        e.preventDefault();

        if (!phone?.length || !name?.length) return;

        const userData: AuthUserEdit = {
            active: user?.active,
            ...(avatarFile?.content?.length ? { avatar: `data:${avatarFile?.type};base64,${avatarFile.content}` } : { avatar: DEFAULT_USER_AVATAR  }),
            ...(phone?.length && { phone_number: phone }),
            ...(name?.length && { display_name: name }),
        }

        console.log(userData)
       
        await userService.editUser(user.id, userData, {
            onHTTPSuccess: (data) => {
                updateUser(data);
                toast.success("Your information was updated");
            },
            onHTTPError: (status, data) => {
                if (data.message)
                    toast.error(data.message);
                else
                    toast.error(status);
            },
            onHTTPNetworkError: (e) => {
                toast.error(e.message);
            }
        })
    }

    return (
            <div style={{ position: "relative" }}>
                <form className="card-form" onSubmit={handleSubmitUserForm}>
                    <div className="card-form-element">
                        <p style={{ fontSize: "26px" }}> Profile </p>
                        <img className="card-form-img" src={user.avatar || DEFAULT_USER_AVATAR} height="150" width="150" />
                        <input className="card-form-img-input" type="file" ref={avatarBtnRef} />
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
                <p> Last Sign in: <span> { user?.last_sign_in ? new Date(user.last_sign_in).toLocaleString() : "-" } </span> </p>
                <p> Active: <span> { user?.active ? "True" : "False" } </span> </p>
                <div className="card-confirmed-container">
                    <p> Confirmed: <span> { user?.confirmed ? "True" : "False" } </span> </p>
                    { !user.confirmed && <button className="btn btn-primary btn-small"> Send email </button> }
                </div>
                <p> Created at: <span> { user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-" } </span> </p>
            </div>
    )
}