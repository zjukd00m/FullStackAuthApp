import { EmailService, ServiceRequestCallbacks } from "./types"

const BASE_URL = "http://localhost:8088/api/mailing";

const headers = {
    "Content-Type": "application/json",
}

export async function sendConfirmationEmail(email: string, {
    onHTTPSuccess,
    onHTTPError,
    onHTTPNetworkError,
}: ServiceRequestCallbacks) {
    const url = BASE_URL + "?" + new URLSearchParams({ service: EmailService.ACCOUNT_CONFIRMATION });

    const body = JSON.stringify({
        emails: [email],
    });

    try {
        const r = await fetch(url, {
            method: "post",
            credentials: "include",
            headers,
            body
        })

        const data = await r.json();

        if (r.ok) {
            onHTTPSuccess(data);
        } else {
            onHTTPError(r.status, data);
        }

    } catch (err: any) {
        onHTTPNetworkError(err);
    }
}