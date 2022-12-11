import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../context/auth/AuthHook";

// As long as the user is signed in and the token jwt is valid, on every refresh
// keep the user on the current route
export default function useRouteObserver() {
    const { isAuthenticated } = useAuth();

    const location = useLocation();
    const navigate = useNavigate();

    // useEffect(() => {
    //     // TODO: Add the condition to verify if the user's cookie is valid
    //     console.log(isAuthenticated)
    //     if (isAuthenticated) {
    //         navigate(location.pathname);
    //     }
    // }, [location.pathname]);
}