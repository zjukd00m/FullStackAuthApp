// TODO: Move this interface to an appropiate folder
import { ServiceRequestCallbacks } from "./types"
import { TokenType } from "../types";

const BASE_URL = "http://localhost:8088/api/tokens";

const headers = {
    "Content-Type": "application/json",
}

export async function requestToken(
    user_email: string, 
    token_type: TokenType,
    {
        onHTTPSuccess,
        onHTTPError,
        onHTTPNetworkError,
    }: ServiceRequestCallbacks
) {
    const url = `${BASE_URL}/`;
    const body = JSON.stringify({
        user_email,
        token_type,
    });

    try {
        const r = await fetch(url, {
            "method": "POST",
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