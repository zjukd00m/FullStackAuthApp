import { ServiceRequestCallbacks } from "./types";

const BASE_URL = "http://localhost:8088/api/auth";

interface EditUserData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export async function changePassword(data: EditUserData, {
    onHTTPSuccess,
    onHTTPError,
    onHTTPNetworkError,
}: ServiceRequestCallbacks) {
    const url = `${BASE_URL}/password/change`;
    try {
        const r = await fetch(url, {
            method: "post",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                current_password: data.currentPassword,
                new_password: data.newPassword,
                confirm_password: data.confirmPassword
            })
        })

        const responseData = await r.json();

        if (r.ok) {
            onHTTPSuccess(responseData);
        } else {
            onHTTPError(r.status, responseData)
        }

    } catch (e: any) {
        onHTTPNetworkError(e);
    }
}

