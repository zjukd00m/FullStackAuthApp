import React, { useState } from "react";
import { toast } from "react-toastify";
import { changePassword } from "../../../../services/auth";
import { validatePassword } from "../../../../utils/validators";
import "./styles.css";

interface ChangePasswordFormProps {
    onSuccessCall: () => void;
}

export default function ChangePasswordForm(props: ChangePasswordFormProps) {
    const { onSuccessCall } = props;
    const [currentPasswd, setCurrentPasswd] = useState("");
    const [newPasswd, setNewPasswd] = useState("");
    const [confirmPasswd, setConfirmPasswd] = useState("");
    const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [errors, setErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const setError = (
        field: "currentPassword" | "newPassword" | "confirmPassword",
        value: string,
    ) => {
        setErrors((prevErrors) => ({
            ...prevErrors,
            [field]: value,
        }))
    }

    function handleChangeCurrentPassword(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        setCurrentPasswd(val);

        if (!val?.length) {
            setError("currentPassword", "Introduce a valid password");
            return;
        }
        
        setError("currentPassword", "");
    }

    function handleChangeNewPassword(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        setNewPasswd(val);

        if (!val?.length) {
            setError("newPassword", "Introduce a valid password");
        } else setError("newPassword", "");
        if (val !== confirmPasswd) {
            setError("confirmPassword", "The passwords doesn't match");
        } else setError("confirmPassword", "")
        if (validatePassword(val) === 0) {
            setError("newPassword", "Make sure to enter a secure password");
        } else setError("newPassword", "");

    }

    function handleChangeConfirmPassword(e: React.ChangeEvent<HTMLInputElement>) {
        const val = e.target.value;
        setConfirmPasswd(val);

        if (!val?.length) {
            setError("confirmPassword", "Introduce a valid password");
            return;
        } else if (val !== newPasswd) {
            setError("confirmPassword", "The passwords doesn't match");
            return;
        }
        setError("confirmPassword", "");
    }

    async function onFormSubmit(e: any) {
        e.preventDefault();

        let allowSubmit = true;

        if (!currentPasswd.length) {
            setError("currentPassword", "Introduce a valid password");
            allowSubmit = false;
        }
        if (!newPasswd.length) {
            setError("newPassword", "Introduce a valid password");
            allowSubmit = false;
        }
        if (!confirmPasswd.length) {
            setError("confirmPassword", "Introduce a valid password");
            allowSubmit = false;
        }

        if (!allowSubmit) return;
        
        if (newPasswd !== confirmPasswd) {
            setError("confirmPassword", "The passwords doesn't match");
        } else {
            setError("confirmPassword", "");
        }

        await changePassword({
            currentPassword: currentPasswd,
            newPassword: newPasswd,
            confirmPassword: confirmPasswd,
        }, {
            onHTTPSuccess: () => {
                toast.success("The password was changed");
                onSuccessCall();
            },
            onHTTPError: (_, data) => {
                toast.error(data.detail);
            },
            onHTTPNetworkError: (e) => {
                toast.error(e.message);
            }
        })
        
    }

    return (
        <form onSubmit={onFormSubmit} className="">
            <div className="change-password-form-element">
                <label> Current password </label>
                <div className="input-group-with-icon">
                    <input 
                        type={isCurrentPasswordVisible ? "text" : "password"} 
                        value={currentPasswd} 
                        onChange={handleChangeCurrentPassword}
                    />
                    {!isCurrentPasswordVisible ? (
                            <i
                                className="fa-solid fa-solid fa-eye fa-lg position-absolute p-2"
                                onClick={() => setIsCurrentPasswordVisible(true)}
                            ></i>
                    ) : (
                        <i
                            className="fa-solid fa-eye-slash fa-lg position-absolute p-2"
                            onClick={() => setIsCurrentPasswordVisible(false)}
                        ></i>
                    )}
                </div>
                { errors.currentPassword?.length ? <p className="text-error"> { errors.currentPassword } </p> : null }
            </div>
            <div className="change-password-form-element">
                <label> New password </label>
                <div className="input-group-with-icon">
                    <input 
                        type={isNewPasswordVisible ? "text" : "password"} 
                        value={newPasswd} 
                        onChange={handleChangeNewPassword} 
                    />
                    {!isNewPasswordVisible ? (
                            <i
                                className="fa-solid fa-eye fa-lg position-absolute p-2"
                                onClick={() => setIsNewPasswordVisible(true)}
                            ></i>
                    ) : (
                        <i
                            className="fa-solid fa-eye-slash fa-lg position-absolute p-2"
                            onClick={() => setIsNewPasswordVisible(false)}
                        ></i>
                    )}
                </div>
                { errors.newPassword?.length ? <p className="text-error"> { errors.newPassword } </p> : null }
            </div>
            <div className="change-password-form-element">
                <label> Confirm password </label>
                <div className="input-group-with-icon">
                    <input 
                        type={isConfirmPasswordVisible ? "text" : "password"} 
                        value={confirmPasswd} 
                        onChange={handleChangeConfirmPassword} 
                    />
                    {!isConfirmPasswordVisible ? (
                            <i
                                className="fa-solid fa-eye fa-lg position-absolute p-2"
                                onClick={() => setIsConfirmPasswordVisible(true)}
                            ></i>
                    ) : (
                        <i
                            className="fa-solid fa-eye-slash fa-lg position-absolute p-2"
                            onClick={() => setIsConfirmPasswordVisible(false)}
                        ></i>
                    )}
                </div>
                { errors.confirmPassword?.length ? <p className="text-error"> { errors.confirmPassword } </p> : null }
            </div>
            <button type="submit" className="btn btn-primary btn-sm text-white">
                Change
            </button>
        </form>
    )
}