import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ServiceRequestCallbacks } from "../../services/types";
import { AuthContext } from "./AuthContext";
import { AuthServiceUser, AuthUser } from "./types";
import { API_URL } from "../../settings";

const headers = {
    "Content-Type": "application/json",
};

export default function useAuth() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const {
        state: { isAuthenticated, user, error },
        dispatch,
    } = useContext(AuthContext);

    // On every render, verify if the user is logged in
    useEffect(() => {
        if (!isAuthenticated)
        (async () => {
            await getProfile({
                onHTTPSuccess: (data) => {
                    dispatch({
                        type: "SET_USER",
                        payload: data,
                    });
                },
                onHTTPError: () => {},
                onHTTPNetworkError: () => {},
            })
        })();
    }, [isAuthenticated]);

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
                credentials: "omit",
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
            // Sign the user up
            const r = await fetch(url, {
                method: "post",
                headers: headers,
                body: body,
                credentials: "include",
            });

            const data = await r.json();

            if (r.ok) {                
                // Fetch the user profile
                onHTTPSuccess(data);
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
                navigate("/signin");
            } else {
                console.log("There was an error with the response")
                console.log(r.status)
                console.log(r.statusText)
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

    const updateUser = (userData: AuthUser) => dispatch({ type: "SET_USER", payload: { user: userData }});

    return {
        isAuthenticated,
        user,
        signUp,
        signIn,
        signOut,
        getProfile,
        loading,
        error,
        updateUser,
    };
}
