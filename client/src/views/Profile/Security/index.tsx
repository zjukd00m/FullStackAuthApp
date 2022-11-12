import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ChangePasswordForm from "../../../components/Forms/Password/Change";
import Modal from "../../../components/Modals";
import { deleteUserAccount } from "../../../services/auth";
import "./styles.css";

interface ModalSessionProps {
    visibleModal: boolean;
    closeModalFunction: () => void;
}

function ModalSessionWillCloseBody(props: ModalSessionProps) {
    const { closeModalFunction, visibleModal } = props;
    const CLOSE_MODAL_TIMEOUT_MS = 1000 * 5;
    const [ countDown, setCountDown ] = useState(CLOSE_MODAL_TIMEOUT_MS);

    // Decrease the counter and close the modal
    const closeModal = () => setTimeout(() => {
        console.log("THis is the CouNt nigga !!.. !: ", countDown);
        if (countDown === 0) closeModalFunction();
        else setCountDown((prevCount) => prevCount - 1);
    }, CLOSE_MODAL_TIMEOUT_MS);

    useEffect(() => {
        if (visibleModal && countDown === 0) closeModal();
    }, [visibleModal]);

    return (
        <div
            style={{
                backgroundColor: "green",
            }}
        >
            <p> The count down </p>
            {
                <p> { countDown } </p>
            }
        </div>
    )
}


export default function ProfileSecurity() {
    const [emailCodeOnLogin, setEmailCodeOnLogin] = useState<boolean>(false);
    const [visibleModal, setVisibleModal] = useState<boolean>(false);
    const [showChangePasswordForm, setShowChangePasswordForm] = useState<boolean>(false);

    
    function handleEmailCodeOnLoginChange() {
        console.log("----")
        setEmailCodeOnLogin(!emailCodeOnLogin);
        console.log(!emailCodeOnLogin)
        console.log("----")
        setVisibleModal(true)
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
    
    const modalSessionWillClose = {
        title: "Your session will be closed",
        subtitle: "Sign in back again",
        body: <ModalSessionWillCloseBody
            visibleModal={visibleModal}
            closeModalFunction={() => setVisibleModal(true)}
        />
    };

    return (
        <div className="profile-security-container">
            <Modal 
                visible={visibleModal}
                title={modalSessionWillClose.title}
                subtitle={modalSessionWillClose.subtitle}
                body={modalSessionWillClose.body}
            /> 
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
                        { showChangePasswordForm && <ChangePasswordForm onSuccessCall={() => setVisibleModal(true)} />  }
                    </div>
                </div>
                <div className="profile-s-b-element">
                    <div>
                        <button className="btn btn-danger btn-sm text-white" onClick={handleDeleteUserAcount}>
                            Eliminar cuenta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}