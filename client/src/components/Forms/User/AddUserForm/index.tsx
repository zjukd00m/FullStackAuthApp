import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import useAuth from "../../../../context/auth/AuthHook";

const schema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().required().min(8).max(33),
});

type FormInput = {
    email: string;
    password: string;
}

type FormProps = {
    onSuccess: (data: any) => void;
    onCancel: () => void;
}

export default function AddUserForm(props: FormProps) {
    const { onSuccess, onCancel } = props;
    const { signUp } = useAuth();
    const { register, handleSubmit, formState: { errors }, setError } = useForm<FormInput>({
        resolver: yupResolver(schema),
    });

    async function onSubmit(data: FormInput) {
        const validForm = await schema.isValid(data);

        if (validForm) {
            const { email, password } = data;

            await signUp({
                email,
                password,
                onHTTPSuccess: (data) => {
                    onSuccess(data);
                },
                onHTTPError: (status, data) => {
                    const error = data.detail
                    if (status === 422) {
                        if (!error.length) return
                        const errorMessage = error[0].msg;
                        alert(errorMessage);
                    }
                },
                onHTTPNetworkError: (e) => {
                    alert(e.message);
                }
            })
        }
    }

    function handleGeneratePassword() {
        const password = "password-xyz";
        console.log(password);
    }

    return (
        <div className="d-flex p-3" style={{ backgroundColor: "white", zIndex: 99999, border: "1px solid #222222" }}>
            <form className="row w-100" onSubmit={handleSubmit(onSubmit)}>
                <div className="col">
                    <label className="form-label"> Email </label>
                    <input {...register("email")} className="form-control" />
                    { errors.email ? <p className="form-text text-danger my-2"> Enter a valid email address </p> : null }
                </div> 
                <div className="col">
                    <label className="form-label"> Password </label>
                    <div className="d-flex align-items-center position-relative">
                        <input {...register("password")} className="form-control" />
                        <i className="fa-solid fa-key fa-lg position-absolute end-0 px-2" onClick={handleGeneratePassword}></i>
                    </div>
                    { errors.password ? <p className="form-text text-danger my-2"> Password must has at least 8 characters </p> : null }
                </div>
                <div className="d-flex flex-row mt-3">
                    <div className="flex-grow-1"></div>
                    <button className="btn btn-sm btn-light mx-1" onClick={onCancel}> Cancel </button>
                    <button className="btn btn-primary btn-sm text-white mx-1" type="submit">
                        Add user
                    </button>
                </div>
            </form>
        </div>
    )
}
