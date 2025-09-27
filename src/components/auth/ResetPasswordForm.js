import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import FormBtn from "../reusable/FormBtn";
import EyeIcon from "../../assets/eye-icon.svg";
import { FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { url } from "../../hooks/useConfig";
const ResetPasswordForm = () => {
    const navigate = useNavigate();
    const { token } = useParams(); // Get token from URL params
    // Form values
    const [pwd, setPwd] = useState("");
    const [cpwd, setCpwd] = useState("");
    const [errmsg, setErrmsg] = useState(false);
    const [apiError, setApiError] = useState("");
    // State to change the password type to text
    const [changePasswordType, setChangePasswordType] = useState(false);
    const [changeConfirmPasswordType, setChangeConfirmPasswordType] = useState(false);
    const resetPasswordMutation = useMutation({
        mutationFn: (password) => axios.post(url + "/retail/reset-password", {
            password: password,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }),
        onSuccess: (data) => {
            // Show success message or navigate to login
            navigate("/auth/login", {
                state: {
                    message: "Password reset successfully! Please login with your new password.",
                },
            });
        },
        onError: (error) => {
            // Handle API errors
            const errorMessage = error.response?.data?.message ||
                "Failed to reset password. Please try again.";
            setApiError(errorMessage);
        },
    });
    const formSubmitHandler = (e) => {
        e.preventDefault();
        // Clear previous errors
        setErrmsg(false);
        setApiError("");
        // Check if passwords match
        if (pwd !== cpwd) {
            setErrmsg(true);
            return;
        }
        // Check if token exists
        if (!token) {
            setApiError("Invalid reset link. Please request a new password reset.");
            return;
        }
        // Submit the form
        resetPasswordMutation.mutate(pwd);
    };
    return (_jsxs("div", { className: "sm:w-[55%] md:w-[60%] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]", children: [_jsx("h2", { className: "text-xl md:text-2xl text-black heading font-bold text-center", children: "Set your new password" }), _jsxs("form", { className: "w-full mt-[60px]", onSubmit: formSubmitHandler, children: [_jsxs("div", { className: "w-full mt-5 relative", children: [_jsxs("label", { htmlFor: "passwordField", className: "text-themeDarkGray text-xs", children: ["Password ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("input", { required: true, id: "passwordField", type: changePasswordType === true ? "text" : "password", placeholder: "Enter your password here", className: "w-full text-xs sm:text-sm pb-[2px] text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none", value: pwd, onChange: (e) => setPwd(e.target.value), disabled: resetPasswordMutation.isPending, minLength: 8 }), _jsx("div", { className: "absolute right-0 top-1/2 -translate-y-1/2", children: changePasswordType === false ? (_jsx("img", { src: EyeIcon, alt: "eye-icon", className: "cursor-pointer", onClick: () => setChangePasswordType(true) })) : (_jsx(FaEyeSlash, { color: "#676767", size: 17, className: "cursor-pointer", onClick: () => setChangePasswordType(false) })) })] }), _jsxs("div", { className: "w-full mt-5 relative", children: [_jsxs("label", { htmlFor: "confirmPasswordField", className: "text-themeDarkGray text-xs", children: ["Confirm password ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("input", { required: true, id: "confirmPasswordField", type: changeConfirmPasswordType === true ? "text" : "password", placeholder: "Re-type your password", className: "w-full text-xs sm:text-sm pb-[2px] text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none", value: cpwd, onChange: (e) => setCpwd(e.target.value), disabled: resetPasswordMutation.isPending, minLength: 8 }), _jsx("div", { className: "absolute right-0 top-1/2 -translate-y-1/2", children: changeConfirmPasswordType === false ? (_jsx("img", { src: EyeIcon, alt: "eye-icon", className: "cursor-pointer", onClick: () => setChangeConfirmPasswordType(true) })) : (_jsx(FaEyeSlash, { color: "#676767", size: 17, className: "cursor-pointer", onClick: () => setChangeConfirmPasswordType(false) })) })] }), errmsg && (_jsx("p", { className: "text-xs text-themeRed mt-5", children: "Passwords don't match." })), apiError && _jsx("p", { className: "text-xs text-themeRed mt-5", children: apiError }), !token && (_jsx("p", { className: "text-xs text-themeRed mt-5", children: "Invalid reset link. Please request a new password reset." })), resetPasswordMutation.isPending && (_jsx("p", { className: "text-xs text-themeGray mt-5", children: "Resetting your password..." })), _jsx(FormBtn, { hasBg: true, title: "Reset Password", disabled: resetPasswordMutation.isPending || !token }), _jsx(Link, { to: "/auth/login", children: _jsx("p", { className: "mt-5 text-xs text-themeGray text-center", children: "Back to Login" }) })] })] }));
};
export default ResetPasswordForm;
