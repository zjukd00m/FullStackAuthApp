import { useContext, useState } from "react";
import { ServiceRequestCallbacks } from "../../services/types";
import { AuthContext } from "./AuthContext";
import { AuthServiceUser } from "./types";
import { API_URL } from "../../settings";

const headers = {
    "Content-Type": "application/json",
};

export default function useAuth() {
    const [loading, setLoading] = useState(false);

    const {
        state: { isAuthenticated, user, error },
        dispatch,
    } = useContext(AuthContext);

    async function signUp(requestArgs: AuthServiceUser) {
        setLoading(true);

        const {
            email,
            password,
            onHTTPError,
            onHTTPSuccess,
            onHTTPNetworkError,
        } = requestArgs;

        const url = `${API_URL}/api/auth/signup`;

        const body = JSON.stringify({
            email,
            password,
        });

        try {
            const r = await fetch(url, {
                method: "post",
                headers: headers,
                body: body,
            });

            const data = await r.json();

            if (r.ok) {
                onHTTPSuccess(data);
            } else {
                const statusCode = r.status;
                onHTTPError(statusCode, data);
            }
        } catch (e: any)  {
            onHTTPNetworkError(e);
        } finally {
            setLoading(false);
        }
    }

    async function signIn(requestArgs: AuthServiceUser) {
        setLoading(true);

        const {
            email,
            password,
            onHTTPError,
            onHTTPSuccess,
            onHTTPNetworkError,
        } = requestArgs;

        const url = `${API_URL}/api/auth/signin`;

        const body = JSON.stringify({
            email,
            password,
        });

        try {
            const r = await fetch(url, {
                method: "post",
                headers: headers,
                body: body,
                credentials: "include",
            });

            const data = await r.json();

            if (r.ok) {
                onHTTPSuccess(data);
                const { user } = data;
                dispatch({
                    type: "SET_USER",
                    payload: {
                        ...user,
                    },
                });
            } else {
                onHTTPError(r.status, data);
            }
        } catch (e: any) {
            onHTTPNetworkError(e);
        } finally {
            setLoading(false);
        }
    }

    async function signOut(requestArgs: ServiceRequestCallbacks) {
        const { onHTTPSuccess, onHTTPError, onHTTPNetworkError } = requestArgs;

        const url = `${API_URL}/api/auth/signout`;

        try {
            const r = await fetch(url, {
                method: "post",
                headers: {
                    ...headers,
                },
                credentials: "include"
            });

            const data = await r.json();

            if (r.ok) {
                onHTTPSuccess(data);
                dispatch({ type: "RESET_USER" });
            } else {
                onHTTPError(r.status, data);
            }
        } catch (e: any) {
            onHTTPNetworkError(e);
        } finally {
            setLoading(false);
        }
    }

    async function getProfile(requestArgs: ServiceRequestCallbacks) {
        const { onHTTPSuccess, onHTTPError, onHTTPNetworkError } = requestArgs;
        const url = `${API_URL}/api/auth/profile`;

        try {
            const r = await fetch(url, {
                method: "get",
                headers,
                credentials: "include"
            })

            const data = await r.json();

            if (r.ok) {
                onHTTPSuccess(data);
                dispatch({ type: "SET_USER", payload: { user: data }});
            } else {
                onHTTPError(r.status, data);
            }
        } catch (e: any) {
            onHTTPNetworkError(e);
        } finally {
            setLoading(false);
        }
    }

    return {
        isAuthenticated,
        user,
        signUp,
        signIn,
        signOut,
        getProfile,
        loading,
        error,
    };
}
