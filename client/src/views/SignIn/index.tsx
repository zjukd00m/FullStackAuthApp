import React, { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import useAuth from "../../context/auth/AuthHook";
import "./styles.css";
import { validateEmail } from "../../utils/validators";

interface FormError {
    email: string | null;
    password: string | null;
}

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [errors, setErrors] = useState<FormError>({
        email: null,
        password: null,
    });

    const { signIn, error, user, isAuthenticated } = useAuth();

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

        await signIn({
            email,
            password,
            onHTTPSuccess: async () => {
                console.log("The user data was ok")
                window.location.href = "/";
            },
            onHTTPError: (status, data) => {
                console.log(status);
                alert(data.detail);
            },
            onHTTPNetworkError: (e) => {
                console.log("A network error");
                alert(e.message);
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

        setPassword(value);

        if (!value.length) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: "Enter a valid password",
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                password: null,
            }));
        }
    }

    return (
        <div className="view">
            <div className="form-wrapper">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <p className="form-title"> Signin </p>
                    <div className="form-element">
                        <label> Email </label>
                        <div className="form-input-group">
                            <input
                                value={email}
                                onChange={(e) => handleEmailChange(e)}
                                type="text"
                                className="form-input"
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
                        {errors.email && (
                            <p className="input-error"> {errors.password} </p>
                        )}
                    </div>
                    <button className="submit-button">Sign In</button>
                    <div className="form-footer">
                        <p> Don't have an account yet ? </p>
                        <a href="/signup" className="form-link">
                            Sign up
                        </a>
                    </div>
                    <a href="#" className="password-forget">
                        I forgot my password
                    </a>
                </form>
            </div>
        </div>
    );
}
