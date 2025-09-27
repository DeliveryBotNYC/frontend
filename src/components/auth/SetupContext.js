import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import CompanySetupForm from "./SetupForm";
const SetupContext = () => {
    return (_jsx("div", { className: "w-[95%] max-w-[1240px] mx-auto flex items-center py-20", style: {
            minHeight: "calc(100vh - 75px)",
        }, children: _jsxs("div", { className: "bg-white w-full rounded-[15px] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]", children: [_jsxs("div", { className: "w-full flex items-center justify-between md:flex-row flex-col gap-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl text-black font-bold heading", children: "Your Company" }), _jsx("p", { className: "text-xs text-themeDarkGray mt-2", children: "Tell us a bit more about your company." })] }), _jsxs("div", { className: "flex items-center justify-center gap-2 md:gap-5", children: [_jsx("p", { className: "text-xs text-themeDarkGray", children: "Already have an account?" }), _jsx(Link, { to: "/auth/login", children: _jsx("button", { className: "px-5 md:px-10 py-2 md:py-2.5 text-xs text-themeDarkGray border border-secondaryBtnBorder rounded-lg", children: "Login-in" }) })] })] }), _jsx(CompanySetupForm, {})] }) }));
};
export default SetupContext;
