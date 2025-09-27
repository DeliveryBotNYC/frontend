import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, Outlet } from "react-router-dom";
import FormBtn from "../reusable/FormBtn";
// Importing Images
import RightBoxImage from "../../assets/login-right-image.svg";
const LoginContext = () => {
    const admin = location.pathname == "/auth/admin/login" ? true : false;
    return (_jsx("div", { className: "w-[95%] max-w-[1240px] mx-auto flex items-center py-20", style: {
            minHeight: "calc(100vh - 75px)",
        }, children: _jsxs("div", { className: "bg-white w-full rounded-[15px] overflow-hidden flex sm:flex-row flex-col", children: [_jsx(Outlet, {}), admin ? null : (_jsxs("div", { className: "sm:w-[45%] md:w-[40%] bg-themeOrange py-10", children: [_jsxs("div", { className: "px-8 md:px-10", children: [_jsxs("h3", { className: "text-xl md:text-2xl text-white font-bold heading", children: ["Simplest way to manage ", _jsx("br", { className: "xl:block hidden" }), " your deliveries"] }), _jsx("p", { className: "text-xs sm:text-sm lg:text-base text-white mt-1", children: "Enter your credentials to access your account" })] }), _jsx("div", { className: "pl-8 sm:pl-10 pr-5 mt-5", children: _jsx("img", { src: RightBoxImage, alt: "right_image", className: "w-full" }) }), _jsxs("div", { className: "mt-[30px] px-8 md:px-10", children: [_jsx(Link, { to: "/auth/signup", children: _jsx(FormBtn, { title: "Sign-up", hasBg: false }) }), _jsx(Link, { target: "_blank", to: "https://dbx.delivery", children: _jsx("p", { className: "text-white text-xs text-center mt-5", children: "Learn more" }) })] })] }))] }) }));
};
export default LoginContext;
