import { EditUserSettings } from "../types";
import { ServiceRequestCallbacks } from "./types";

const BASE_URL = "http://localhost:8088/api/users/";

const headers = {
    "Content-Type": "application/json",
}

/**
 * Get the user's profile settings
 `**/
export async function getUserSettings(user_id: number, {
    onHTTPSuccess,
    onHTTPError,
    onHTTPNetworkError,
}: ServiceRequestCallbacks) {
    const url = `${BASE_URL}${user_id}/settings`;
    try {
        const r = await fetch(url, { credentials: "include" });

        const data = await r.json();

        if (r.ok) {
            onHTTPSuccess(data);
        } else {
            onHTTPError(r.status, data);
        }
    } catch (e: any) {
        onHTTPNetworkError(e);
    }
}

export async function editUserSettings(
    user_id: number, 
    userSettings: EditUserSettings, 
    {
        onHTTPSuccess,
        onHTTPError,
        onHTTPNetworkError,
    }: ServiceRequestCallbacks
 ) {
    const url = `${BASE_URL}${user_id}/settings`;

    const { signin_code, email_code } = userSettings;

    const body = JSON.stringify({ signin_code, email_code });

    try {
        const r = await fetch(url, { 
            method: "PUT",
            credentials: "include",
            body,
            headers,
        });

        const data = await r.json();

        if (r.ok) {
            onHTTPSuccess(data);
        } else {
            onHTTPError(r.status, data);
        }
    } catch (e: any) {
        onHTTPNetworkError(e);
    }
}