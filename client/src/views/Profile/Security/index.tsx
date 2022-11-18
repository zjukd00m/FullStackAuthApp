import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ChangePasswordForm from "../../../components/Forms/Password/Change";
import { deleteUserAccount } from "../../../services/auth";
import "./styles.css";


// By default, the user will have a 
export default function ProfileSecurity() {
    const [emailCodeOnLogin, setEmailCodeOnLogin] = useState<boolean>(false);
    const [visibleModal, setVisibleModal] = useState<boolean>(false);
    const [showChangePasswordForm, setShowChangePasswordForm] = useState<boolean>(false);
    const [emailCode, setEmailCode] = useState<string>("");
    const [enableEditEmailCode, setEnableEditEmailCode] = useState<boolean>(false);
    
    function handleEmailCodeOnLoginChange(e: any) {
        setEmailCodeOnLogin(!emailCodeOnLogin);
        setVisibleModal(!visibleModal)
    }

    function handleEditEmailCode(e: any) {
        setEmailCode(e.target.value);
    }

    const handleDeleteUserAcount = async () => {
        if (!window.confirm("Are you sure you want to delete your profile ?")) return;
        await deleteUserAccount({
            onHTTPSuccess: (data) => {
                toast.success(data.message);
                setTimeout(() => {
                    window.location.href = "/";
                }, 3000);
            },
            onHTTPError: (status, data) => {
                toast.error(data.detail);
            },
            onHTTPNetworkError: (e) => {
                console.error(e.message);
            }
        });
    }
    
    return (
        <div className="profile-security-container">
            <p className="profile-security-title"> Profile Security </p>
            <div className="profile-security-box">
                <div className="profile-s-b-element">
                    <div className="">
                        <input className="form-check-input me-3" type="checkbox" value={emailCodeOnLogin ? "true" : "false"} onChange={handleEmailCodeOnLoginChange} />
                        <label style={{ fontSize: "16px" }}> Email code on log in </label>
                    </div>
                    <p style={{ fontSize: "12px" }}> A 180 seconds code sent when you try to log in. </p>
                </div>
                <div className="profile-s-b-element">
                    <div className="">
                        <label style={{ fontSize: "16px" }}> Custom email code </label>
                        <div className="d-flex position-relative align-items-center">
                            <input type="text" className="form-control ps-5" value={emailCode} onChange={handleEditEmailCode} disabled={!enableEditEmailCode}/>
                            <i className="fa-regular fa-pen-to-square position-absolute fa-lg ps-3 text-primary" onClick={() => setEnableEditEmailCode(!enableEditEmailCode)}></i> 
                        </div>
                    </div>
                    <p style={{ fontSize: "12px" }}> A code sent on every email to verify it comes from the app. </p>
                </div>
                <div className="profile-s-b-element">
                    <div>
                        <button className="btn btn-danger btn-sm text-white" onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}> Change password </button>
                        { showChangePasswordForm && <ChangePasswordForm onSuccessCall={() => setVisibleModal(true)} />  }
                    </div>
                </div>
                <div className="profile-s-b-element">
                    <div>
                        <button className="btn btn-danger btn-sm text-white" onClick={handleDeleteUserAcount}>
                            Delete account
                        </button>
                    </div>
                </div>
            </div>
            <button className="btn btn-sm btn-primary text-white my-3" style={{ width: "fit-content" }}>
                Save
            </button>
        </div>
    )
}