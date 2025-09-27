import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SignupForm from "./SignupForm";
import { Link } from "react-router-dom";
// Image
import SignupLogos from "../../assets/signup-logos.svg";
const SignupContext = () => {
    return (_jsx("div", { className: "w-[95%] max-w-[1240px] mx-auto flex items-center py-20", style: {
            minHeight: "calc(100vh - 75px)",
        }, children: _jsxs("div", { className: "bg-white w-full rounded-[15px] overflow-hidden flex sm:flex-row flex-col", children: [_jsxs("div", { className: "sm:w-[45%] md:w-[40%] bg-themeLightGray py-10", children: [_jsx("div", { className: "px-8 sm:px-10", children: _jsx("img", { src: SignupLogos, alt: "right_image", className: "w-full" }) }), _jsxs("div", { className: "mt-12", children: [_jsx("p", { className: "text-sm text-center text-secondaryBtnBorder", children: "Join our customers" }), _jsxs("div", { className: "flex items-center justify-center gap-5 mt-[50px]", children: [_jsx("p", { className: "text-xs text-secondaryBtnBorder", children: "Already have an account?" }), _jsx(Link, { to: "/auth/login", children: _jsx("button", { className: "px-10 py-2.5 text-xs text-secondaryBtnBorder border border-secondaryBtnBorder rounded-lg", children: "Login-in" }) })] })] })] }), _jsxs("div", { className: "sm:w-[55%] md:w-[60%] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]", children: [_jsx("h2", { className: "text-xl md:text-2xl text-black heading font-bold text-center", children: "Sign Up" }), _jsx(SignupForm, {})] })] }) }));
};
export default SignupContext;
