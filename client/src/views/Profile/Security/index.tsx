import { useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import ChangePasswordForm from "../../../components/Forms/Password/Change";
import useAuth from "../../../context/auth/AuthHook";
import { deleteUserAccount } from "../../../services/auth";
import "./styles.css";
import { editUserSettings } from "../../../services/settings";

interface ProfileSettingsForm {
    emailCode: string;
    signInCode: boolean;
}

const schema = yup.object().shape({
    emailCode: yup.string().min(8).max(20).required(),
    signInCode: yup.boolean().required(),
});

export default function ProfileSecurity() {
    const { user } = useAuth();

    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileSettingsForm>({ 
        resolver: yupResolver(schema),
        defaultValues: {
            emailCode: user?.settings?.email_code,
            signInCode: user?.settings?.signin_code,
        },
    });

    const [showChangePasswordForm, setShowChangePasswordForm] = useState<boolean>(false);
    const [enableEditEmailCode, setEnableEditEmailCode] = useState<boolean>(false);

    async function onSubmit(data: ProfileSettingsForm) {
        await editUserSettings(user.id, {
            email_code: data.emailCode,
            signin_code: data.signInCode,
        }, {
            onHTTPSuccess: ({ data }) => {
                toast.success("The settings were updated successfully");
                const { email_code, signin_code } = data;
                setValue("emailCode", email_code);
                setValue("signInCode", signin_code);
            },
            onHTTPError: (status, data) => {
                console.log(status);
                console.log(data);
            },
            onHTTPNetworkError: (e) => {
                console.log(e.message);
            }
        });
    }
    
    const handleDeleteUserAcount = async () => {
        if (!window.confirm("Are you sure you want to delete your profile ?")) return;
        await deleteUserAccount({
            onHTTPSuccess: (data) => {
                toast.success(data.message);
                setTimeout(() => {
                    navigate("/")
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
            <form className="profile-security-box" onSubmit={handleSubmit(onSubmit)}>
                <button className="btn btn-sm btn-primary text-white my-3" style={{ width: "fit-content" }} type="submit">
                    Save
                </button>
                <div className="profile-s-b-element">
                    <div className="">
                        <input id="signInCode" {...register("signInCode")} className="form-check-input me-3" type="checkbox" defaultChecked={user?.settings?.signin_code} />
                        <label style={{ fontSize: "16px" }}> Email code on log in </label>
                    </div>
                    <p style={{ fontSize: "12px" }}> A 180 seconds code sent when you try to log in. </p>
                </div>
                <div className="profile-s-b-element">
                    <div className="">
                        <label style={{ fontSize: "16px" }}> Custom email code </label>
                        <div className="d-flex position-relative align-items-center">
                            <input {...register("emailCode")} type="text" className="form-control ps-5" disabled={!enableEditEmailCode} defaultValue={user?.settings?.email_code} />
                            <i className="fa-regular fa-pen-to-square position-absolute fa-lg ps-3 text-primary" onClick={() => setEnableEditEmailCode(!enableEditEmailCode)}></i> 
                        </div>
                    </div>
                    { errors.emailCode && <p style={{ fontSize: "13px", color: "var(--text-color-error)" }}> { errors.emailCode?.message } </p> }
                    <p style={{ fontSize: "12px" }}> A code sent on every email to verify it comes from the app. </p>
                </div>
            </form>
            <div className="profile-s-b-element">
                <div>
                    <button className="btn btn-danger btn-sm text-white" onClick={() => setShowChangePasswordForm(!showChangePasswordForm)}> Change password </button>
                    { showChangePasswordForm && <ChangePasswordForm /> }
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
    )
}
