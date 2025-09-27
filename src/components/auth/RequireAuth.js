import { jsx as _jsx } from "react/jsx-runtime";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();
    return auth?.roles &&
        auth?.roles.find((role) => allowedRoles?.includes(role)) ? (_jsx(Outlet, {})) : auth?.user ? (_jsx(Navigate, { to: "/auth/login", state: { from: location }, replace: true })) : (_jsx(Navigate, { to: "/auth/login", state: { from: location }, replace: true }));
};
export default RequireAuth;
