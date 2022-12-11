import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAuth from "../../context/auth/AuthHook";
import "./styles.css";
import { validateEmail } from "../../utils/validators";
import { useNavigate } from "react-router-dom";
import { requestToken } from "../../services/tokens";
import { TokenType } from "../../types";

interface FormError {
    email: string | null;
    password: string | null;
}

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authCode, setAuthCode] = useState("");
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isAuthCodeVisible, setIsAuthCodeVisible] = useState(false)
    const [isAuthCodeTextVisible, setIsAuthCodeTextVisible] = useState(false);
    const [errors, setErrors] = useState<FormError>({
        email: null,
        password: null,
    });

    const { signIn, isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            console.log("The user groups")
            console.log(user.groups)
            if (!user.groups.includes("ADMIN")) navigate("/");
            else navigate("/");
        }
    }, [isAuthenticated]);

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
            authCode,
            onHTTPSuccess: ({ data }) => {
                setIsAuthCodeVisible(false);
                const { groups } = data;
                if (groups.includes("ADMIN")) navigate("/admin");
                else navigate("/");
            },
            onHTTPError: (status, data) => {
                if (typeof data?.detail === "object") {
                    if (data.detail?.length) {
                        const { msg } = data.detail[0];
                        setIsAuthCodeVisible(true);
                        toast.error(msg);
                    }
                } else if (data.detail === "auth.invalid-user-or-password")
                    toast.error("Incorrect email or password");
                else if (data?.detail === "auth.missing-signin-code") {
                    toast.warn("Make sure to enter the sign in code");
                    setIsAuthCodeVisible(true);
                    // Send the user an email to request the signin code
                } else if (data?.detail === "auth.token-not-found") {
                    setIsAuthCodeVisible(true);
                    toast.error("The token was not found or it expired");
                }
                else {
                    setIsAuthCodeVisible(false);
                    toast.error(data.detail);
                }
            },
            onHTTPNetworkError: (e) => {
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

    async function handleSendAuthCode() {
        await requestToken(email, TokenType.SIGNIN_CODE, {
            onHTTPSuccess: (data) => {
                const { expires_at } = data;
                const expiresAt = new Date(expires_at);
                // setExpirationTime(expiresAt);
                console.log("This fucking code expires at");
                console.log(expiresAt);
                toast.info("An email was sent with the auth code");
            },
            onHTTPError: (status, data) => {
              if (data?.detail === "token.user-last-token-has-not-been-invalidated") {
                toast.warn("The code was already sent to your email");
              }
            },
            onHTTPNetworkError: (e) => {
                toast.error(e.message);
            }
        })
    }

    return (
        <div className="view">
            <div className="form-wrapper">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="d-flex align-items-center">
                        <p className="fs-2 flex-grow-1"> Signin </p>
                    </div>
                    <div className="form-element my-5">
                        <label className="form-label my-1"> Email </label>
                        <div className="d-flex position-relative align-items-center">
                            <input
                                value={email}
                                onChange={(e) => handleEmailChange(e)}
                                type="text"
                                className="form-control ps-5 bg-input-light"
                            />
                            <i className="fa-solid fa-envelope fa-lg position-absolute p-3"></i>
                        </div>
                        {errors.email && (
                            <p className="form-text text-danger my-2"> {errors.email} </p>
                        )}
                    </div>
                    <div className="form-element my-5">
                        <label className="form-label my-1"> Password </label>
                        <div className="d-flex position-relative align-items-center">
                            <input
                                value={password}
                                onChange={handlePasswordChange}
                                type={isPasswordVisible ? "text" : "password"}
                                className="form-control ps-5 outline-none"
                            />
                            {!isPasswordVisible ? (
                                <i
                                    className="fa-solid fa-eye fa-lg position-absolute ps-3"
                                    onClick={() => setIsPasswordVisible(true)}
                                ></i>
                            ) : (
                                <i
                                    className="fa-solid fa-eye-slash fa-lg position-absolute ps-3"
                                    onClick={() => setIsPasswordVisible(false)}
                                ></i>
                            )}
                        </div>
                        {errors.email && (
                            <p className="form-text text-danger my-2"> {errors.password} </p>
                        )}
                    </div>
                    {
                        isAuthCodeVisible ? (
                            <div className="form-element my-5">
                                <label className="form-label my-1"> Code </label>
                                <div className="d-flex position-relative align-items-center">
                                    <input
                                        value={authCode}
                                        onChange={(e) => setAuthCode(e.target.value)}
                                        type={isAuthCodeTextVisible ? "text" : "password"}
                                        className="form-control ps-5 outline-none"
                                    />
                                    {!isAuthCodeTextVisible ? (
                                        <i
                                            className="fa-solid fa-eye fa-lg position-absolute ps-3"
                                            onClick={() => setIsAuthCodeTextVisible(true)}
                                        ></i>
                                    ) : (
                                        <i
                                            className="fa-solid fa-eye-slash fa-lg position-absolute ps-3"
                                            onClick={() => setIsAuthCodeTextVisible(false)}
                                        ></i>
                                    )}
                                    <a className="btn btn-sm btn-link" style={{ fontSize: "14px" }} onClick={handleSendAuthCode} > Send </a>
                                </div>
                            </div>
                        ) : null 
                    }
                    <button className="btn btn-primary btn-sm w-100 text-white">Sign In</button>
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
