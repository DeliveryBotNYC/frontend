import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SecondaryNav from "../components/primary/SecondaryNav";
import { Outlet } from "react-router-dom";
import BackgroundMap from "../components/reusable/mapBackground";
const Auth = () => {
    return (_jsxs("div", { className: "min-h-screen bg-cover bg-center bg-no-repeat", children: [_jsx(BackgroundMap, {}), _jsx(SecondaryNav, {}), _jsx(Outlet, {})] }));
};
export default Auth;
