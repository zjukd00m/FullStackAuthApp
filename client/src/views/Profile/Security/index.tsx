import { useState } from "react";
import ChangePasswordForm from "../../../components/Forms/Password/Change";
import { changePassword } from "../../../services/auth";
import "./styles.css";

export default function ProfileSecurity() {
    const [emailCodeOnLogin, setEmailCodeOnLogin] = useState<boolean>(false);
    const [rememberDevice, setRememberDevice] = useState<number>(0);
    const [showChangePasswordForm, setShowChangePasswordForm] = useState<boolean>(false);
    
    function handleEmailCodeOnLoginChange() {
        console.log("----")
        setEmailCodeOnLogin(!emailCodeOnLogin);
        console.log(!emailCodeOnLogin)
        console.log("----")
    }
    
    return (
        <div className="profile-security-container">
            <p className="profile-security-title"> Profile Security </p>
            <div className="profile-security-box">
                <div className="profile-s-b-element">
                    <div className="">
                        <input className="form-check-input me-3" type="checkbox" value={emailCodeOnLogin ? "true" : "false"} onClick={handleEmailCodeOnLoginChange} />
                        <label style={{ fontSize: "16px" }}> Email code on log in </label>
                    </div>
                    <p style={{ fontSize: "12px" }}> A 180 seconds code sent when you try to log in. </p>
                </div>
                <div className="profile-s-b-element">
                    <div>
                        <button className="btn btn-danger btn-sm text-white" onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}> Change password </button>
                        { showChangePasswordForm && <ChangePasswordForm />  }
                    </div>
                </div>
            </div>
        </div>
    )
}