import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../context/auth/AuthHook";

export default function Shield() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    // Replace the current user location with the sign in route
    return (
        isAuthenticated ? <Outlet /> : <Navigate state={{ from: location }} to="/signin" replace />
    )
}