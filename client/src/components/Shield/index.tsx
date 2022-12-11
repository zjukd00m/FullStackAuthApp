import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../context/auth/AuthHook";
import { AuthGroup } from "../../types";

interface ShieldProps {
    allowedRoles?: AuthGroup[];
}

export default function Shield(props: ShieldProps) {
    const { allowedRoles } = props;

    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/signin" state={{ from: location }} replace />
    }

    if (
        allowedRoles?.length && 
        allowedRoles?.find((allowedRole) => user?.groups?.includes(allowedRole))
    ) {
        return <Outlet />
    } else if (
        allowedRoles?.length &&
        !allowedRoles?.find((allowedRole) => user?.groups?.includes(allowedRole))
    ) {
        return <Navigate to="/unauthorized" state={{from: location }} replace />
    }

    return <Outlet />
}