import { AuthUserEdit } from "../context/auth/types";
import { API_URL } from "../settings";
import { ServiceRequestCallbacks } from "./types";

const headers = {
    "Content-Type": "application/json",
};

export class UserService {
    BASE_URL: string;

    constructor(base_url: string) {
        this.BASE_URL = base_url;
    }

    async getUsers({
        onHTTPSuccess,
        onHTTPError,
        onHTTPNetworkError,
    }: ServiceRequestCallbacks, args?: { query: string }) {
        const url = new URL(`${this.BASE_URL}/api/users/`);
        
        if (args?.query?.length)
            url.searchParams.append("query", args.query);

        try {
            const r = await fetch(url, {
                method: "get",
                headers: headers,
                credentials: "include"
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

    async getUser(user_id: number, {
        onHTTPSuccess,
        onHTTPError,
        onHTTPNetworkError,
    }: ServiceRequestCallbacks) {
        const url = `${this.BASE_URL}/api/users/${user_id}`;

        try {
            const r = await fetch(url, {
                method: "get",
                headers: headers,
            })

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

    async getProfile({
        onHTTPSuccess,
        onHTTPError,
        onHTTPNetworkError,
    }: ServiceRequestCallbacks) {
        const url = `${this.BASE_URL}/api/auth/profile`;

        try {
            const r = await fetch(url, {
                method: "get",
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

    async deleteUser(
        userId: number,
        {
            onHTTPSuccess,
            onHTTPError,
            onHTTPNetworkError,
        }: ServiceRequestCallbacks
    ) {
        const url = `${this.BASE_URL}/api/users/${userId}`;

        try {
            const r = await fetch(url, {
                method: "delete",
                headers: headers,
                credentials: "include"
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

    async editUser(
        userId: number,
        userData: AuthUserEdit,
        {
            onHTTPSuccess,
            onHTTPError,
            onHTTPNetworkError,
        }: ServiceRequestCallbacks
    ) {
        const url = `${this.BASE_URL}/api/users/${userId}`;

        const payload = JSON.stringify(userData);

        try {
            const r = await fetch(url, {
                method: "put",
                headers: headers,
                body: payload,
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

}

export const userService = new UserService(API_URL);
