import React, { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";
import useAuth from "../../context/auth/AuthHook";
import { validateEmail, validatePassword } from "../../utils/validators";
import "./styles.css";

interface FormError {
    email: string | null;
    password: string | null;
}

export default function SignUp() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<FormError>({
        email: null,
        password: null,
    });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { signUp, loading, error } = useAuth();

    async function handleSubmit(e: any) {
        e.preventDefault();

        if (errors.email || errors.password) {
            return;
        } else if (!email?.length || !password?.length) {
            const errorMessages = {
                ...(!email.length
                    ? { email: "Missing email" }
                    : { email: null }),
                ...(!password.length
                    ? { password: "Missing password" }
                    : { password: null }),
            };
            setErrors(errorMessages);
            return;
        } else {
            setErrors({
                email: null,
                password: null,
            });
        }

        await signUp({
            email,
            password,
            onHTTPSuccess: () => {
                window.location.href = "/signin";
            },
            onHTTPError: (_, data) => {
                toast.error(data.detail);
            },
            onHTTPNetworkError(e) {
                toast.error(e.message);
            },
        });
    }

    function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        setEmail(value);

        if (!value.length) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: "Enter a valid email address",
            }));
            return;
        }

        if (!validateEmail(value)) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: "Invalid email address",
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                email: null,
            }));
        }
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value;

        const strengthLevel = validatePassword(value);

        if (strengthLevel === 0) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: "Password must be at least 8 chars long",
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: null,
            }));
        }

        setPasswordStrength(strengthLevel);

        setPassword(value);
    }

    return (
        <div className="view">
            <div className="form-wrapper">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <p className="form-title"> Signup </p>
                    <div className="form-element">
                        <label> Email </label>
                        <div className="form-input-group">
                            <input
                                value={email}
                                onChange={(e) => handleEmailChange(e)}
                                type="text"
                                className="form-input"
                                placeholder="tyler@durden.com"
                            />
                            <MdOutlineEmail className="input-icon" />
                        </div>
                        {errors.email && (
                            <p className="input-error"> {errors.email} </p>
                        )}
                    </div>
                    <div className="form-element">
                        <label> Password </label>
                        <div className="form-input-group">
                            <input
                                value={password}
                                onChange={handlePasswordChange}
                                type={isPasswordVisible ? "text" : "password"}
                                className="form-input"
                                placeholder="At least 8 characters"
                            />
                            {!isPasswordVisible ? (
                                <AiOutlineEye
                                    className="input-icon"
                                    onClick={() => setIsPasswordVisible(true)}
                                />
                            ) : (
                                <AiOutlineEyeInvisible
                                    className="input-icon"
                                    onClick={() => setIsPasswordVisible(false)}
                                />
                            )}
                        </div>
                        {errors.password && (
                            <p className="input-error"> {errors.password} </p>
                        )}
                        <p style={{ fontSize: "13px", marginTop: "2rem" }}>
                            Password strength: {passwordStrength}
                        </p>
                        <div className="password-strength">
                            <div
                                className={`strength ${
                                    passwordStrength >= 1 && "strength-level"
                                }`}
                            ></div>
                            <div
                                className={`strength ${
                                    passwordStrength >= 2 && "strength-level"
                                }`}
                            ></div>
                            <div
                                className={`strength ${
                                    passwordStrength >= 3 && "strength-level"
                                }`}
                            ></div>
                            <div
                                className={`strength ${
                                    passwordStrength >= 4 && "strength-level"
                                }`}
                            ></div>
                        </div>
                    </div>
                    <button className="submit-button">Sign Up</button>
                    <div className="form-footer">
                        <p>Already have an account ?</p>
                        <a href="/signin" className="form-link">
                            Login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
