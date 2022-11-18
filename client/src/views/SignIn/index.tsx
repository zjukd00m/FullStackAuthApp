import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import useAuth from "../../context/auth/AuthHook";
import "./styles.css";
import { validateEmail } from "../../utils/validators";
import { useNavigate } from "react-router-dom";

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

    const { signIn, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) navigate("/");
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
            onHTTPSuccess: () => {
                navigate("/");
            },
            onHTTPError: (_, data) => {
                if (data.detail === "auth.invalid-user-or-password")
                    toast.error("Incorrect email or password");
                else
                    toast.error(data.detail);
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

    return (
        <div className="view">
            <div className="form-wrapper">
                <form className="signup-form" onSubmit={handleSubmit}>
                    <p className="fs-2"> Signin </p>
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
