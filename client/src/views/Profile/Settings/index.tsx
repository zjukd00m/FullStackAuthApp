import { useEffect, useRef } from "react";
import { AiFillEdit } from "react-icons/ai";
import { toast } from "react-toastify";
import { Buffer } from "buffer";
import useAuth from "../../../context/auth/AuthHook"
import { AuthUserEdit } from "../../../context/auth/types";
import { useState } from "react";
import { userService } from "../../../services/users";
import { sendConfirmationEmail } from "../../../services/mailing";

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
    const [loader, setLoader] = useState({
        email: false,
        edit: false,
    });

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
            ...(avatarFile?.content?.length && { avatar: `data:${avatarFile?.type};base64,${avatarFile.content}` }),
            ...(phone?.length && { phone_number: phone }),
            ...(name?.length && { display_name: name }),
        }

        setLoader((prevLoader) => ({ ...prevLoader, edit: true }));

        setTimeout(async () => {
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
            });
            setLoader((prevLoader) => ({ ...prevLoader, edit: false }));
        }, 2000);
    }

    const handleSendEmail = async () => {
        setLoader((prevLoader) => ({ ...prevLoader, email: true }));
        await sendConfirmationEmail(user.email, {
            onHTTPSuccess: (data) => {
                toast.success(data.message)
            },
            onHTTPError: (status, data) => {
                console.log(status);
                toast.error(data.detail);
            },
            onHTTPNetworkError: (e) => {
                console.log(e.message);
            }
        });
        setLoader((prevLoader) => ({ ...prevLoader, email: false }));
    }

        
    return (
            <div 
                className="position-relative"
                style={{
                    backgroundColor: "#f5f5f5",
                    padding: "1rem", 
                }}
            >
                <p style={{ fontSize: "26px" }}> Profile </p>
                <img className="rounded-circle my-2" src={user.avatar || DEFAULT_USER_AVATAR} height="200" width="200" />
                <div className="profile-details-container">
                    <form className="card-form" onSubmit={handleSubmitUserForm}>
                        <div className="card-form-element">
                            <div className="m-auto">
                                { 
                                    avatarFile?.content?.length && avatarFile?.type?.length ? 
                                    <img 
                                        src={`data:${avatarFile.type};base64,${avatarFile.content}`} 
                                        alt="New avatar"    
                                        height="150"
                                        width="150"
                                        style={{
                                            borderRadius: "50%",
                                            margin: "1rem auto",
                                        }}
                                    /> : 
                                    null 
                                }
                            </div>
                        </div>
                        <div className="mb-3 w-100">
                            <label className="form-label"> Name </label>
                            <div className="d-flex position-relative align-items-center">
                                <input type="text" className="form-control ps-5" value={name} onChange={(e) => enableEditName && setName(e.target.value)} disabled={!enableEditName} />
                                <i className="fa-regular fa-pen-to-square position-absolute fa-lg ps-3 text-primary" onClick={() => setEnableEditName(!enableEditName)}></i> 
                            </div>
                        </div>
                        <div className="mb-3 w-100">
                            <label className="form-label"> Phone </label>
                            <div className="d-flex position-relative align-items-center">
                                <input type="text" className="form-control ps-5" value={phone} onChange={(e) => enableEditPhone && setPhone(e.target.value)} disabled={!enableEditPhone}/>
                                <i className="fa-regular fa-pen-to-square position-absolute fa-lg ps-3 text-primary" onClick={() => setEnableEditPhone(!enableEditPhone)}></i> 
                            </div>
                        </div>
                        <div className="mb-3">
                            <label className="form-label"> Change avatar </label>
                            <input className="form-control" type="file" ref={avatarBtnRef} />
                        </div>
                        <button className="user-card-btn btn btn-icon btn-primary btn-sm text-white"> 
                            { loader.edit ? <i className="fa-solid fa-circle-notch fa-spin fa-xl" style={{ marginRight: "0.5em" }}></i> : null }
                            Save 
                        </button>
                    </form>
                    <div className="profile-details">
                        <p> Last Sign in: <span> { user?.last_sign_in ? new Date(user.last_sign_in).toLocaleString() : "-" } </span> </p>
                        <p> Active: <span> { user?.active ? "True" : "False" } </span> </p>
                        <div className="card-confirmed-container">
                            <p> Confirmed: <span> { user?.confirmed ? "True" : "False" } </span> </p>
                            { 
                                !user.confirmed && (
                                    <button className="btn btn-icon btn-primary btn-sm text-white" onClick={handleSendEmail}> 
                                        { loader.email ? <i className="fa-solid fa-circle-notch fa-spin fa-xl" style={{ marginRight: "0.5em" }}></i> : null }
                                        Send email 
                                    </button>
                                )
                            }
                        </div>
                        <p> Created at: <span> { user?.created_at ? new Date(user.created_at).toLocaleDateString() : "-" } </span> </p>
                    </div>
                </div>
            </div>
    )
}