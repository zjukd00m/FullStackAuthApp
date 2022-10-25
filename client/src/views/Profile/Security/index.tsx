import { useState } from "react";
import "./styles.css";


export default function ProfileSecurity() {
    const [emailCodeOnLogin, setEmailCodeOnLogin] = useState<boolean>(false);
    
    function handleEmailCodeOnLoginChange() {
        console.log("----")
        setEmailCodeOnLogin(!emailCodeOnLogin);
        console.log(emailCodeOnLogin)
        console.log("----")
    }
    
    return (
        <div className="profile-security-container">
            <p className="profile-security-title"> Profile Security </p>
            <div className="profile-security-box">
                <div className="profile-s-b-element">
                    <div>
                        <input type="radio" value={emailCodeOnLogin ? "true" : "false"} onClick={handleEmailCodeOnLoginChange} />
                        <label style={{ fontSize: "16px" }}> Email code on log in </label>
                    </div>
                    <p style={{ fontSize: "14px" }}> A 180 seconds code sent when you try to log in. </p>
                </div>
            </div>
        </div>
    )
}