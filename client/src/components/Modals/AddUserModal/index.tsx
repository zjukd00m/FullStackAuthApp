import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineMail } from "react-icons/ai";
import useAuth from "../../../context/auth/AuthHook";
import { AuthUser } from "../../../context/auth/types";
import { validateEmail, validatePassword } from "../../../utils/validators";
import "./styles.css";

interface AddUserModalProps {
    onButtonCancel: () => void;
    onSuccess: (responseData: AuthUser) => void;
}

interface AddUserErrors {
    email: string | null;
    password: string | null;
}

export default function AddUserModal(props: AddUserModalProps) {
    const { onSuccess, onButtonCancel } = props;
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [passwordStength, setPasswordStrength] = useState<number>(0);
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
    const [errors, setErrors] = useState<AddUserErrors>({
        email: null,
        password: null,
    });

    const { signUp } = useAuth();

    const setError = (type: "email" | "password", value: string | null) => 
        setErrors((prevErrors) => ({
                ...prevErrors,
                ...(type === "email" && { email: value }),
                ...(type === "password" && { password: value }),
        }))

    async function handleAddUser(e: any) {
        e.preventDefault();

        if (!email?.length) {
            setError("email", "Enter a valid email address");
        } else {
            setError("email", null);
        }

        if (!password?.length) {
            setError("password", "Enter a valid password");
        } else {
            setError("password", null);
        }

        if (!email?.length || !password?.length) return

        await signUp({
            email,
            password,
            onHTTPSuccess: (data) => {
                onSuccess(data);
            },
            onHTTPError: (status, data) => {
                console.log(status);
                alert(data.detail);
            },
            onHTTPNetworkError: (e) => {
                alert(e.message);
            }
        })
    }

    function handleEmailChange(e: any) {
        const _email = e.target.value;
        setEmail(_email);

        if (!validateEmail(_email))
            setError("email", "Not a valid email");
        else setError("email", null);
    }

    function handlePasswordChange(e: any) {
        const password = e.target.value;

    	setPassword(password);
        setPasswordStrength(validatePassword(password));

        if (password.length >= 8) setError("password", null);
        else setError("password", "Password must be at least 8 characters long");
    }

    return (
        <div className="container user-modal">
            <form className="add-user-form" onSubmit={handleAddUser} >
                <div className="user-form-input-group">
                    <label className="user-form-label"> Email </label>
                    <div className="user-form-input-with-icon">
                        <AiOutlineMail className="input-icon" />
                        <input 
                            className="user-form-input" 
                            type="email" 
                            onChange={handleEmailChange}
                            value={email}
                        />
                    </div>
                    { errors.email && <p className="input-error"> { errors.email } </p> }
                </div>
                <div className="user-form-input-group">
                    <div className="user-form-password-header">
                        <p className="user-form-label">  Password </p>
                        <p className="user-form-label-password"> Strength: { passwordStength } / 4 </p>
                    </div>
                    <div className="user-form-input-with-icon">
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
                        <input 
                            className="user-form-input" 
                            type={isPasswordVisible ? "text" : "password" } 
                            onChange={handlePasswordChange}
                            value={password}
                        />
                    </div>
                    { errors.password && <p className="input-error"> { errors.password } </p> }
                </div>
                <div className="btn-group-v">
                    <button className="btn btn-small" onClick={onButtonCancel}> Cancel </button>
                    <button className="btn btn-primary btn-small" type="submit"> Add user </button>
                </div>
            </form>
        </div>
    )
}
