import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useState } from "react";
import FormBtn from "../reusable/FormBtn";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { url } from "../../hooks/useConfig";
const ForgotPasswordForm = () => {
    // login form value's
    const [loginFormValues, setLoginFormValues] = useState("");
    // If the form submited then show the instruction text
    const [emailSubmited, setEmailSubmited] = useState(false);
    // Store the success message from API
    const [successMessage, setSuccessMessage] = useState("");
    const addTodoMutation = useMutation({
        mutationFn: (newTodo) => axios.post(url + "/retail/forgot-password", {
            email: loginFormValues,
        }),
        onSuccess: (data) => {
            setEmailSubmited(true);
            // Extract message from API response
            setSuccessMessage(data.data?.data?.message ||
                "Instructions to reset your password send to your email.");
        },
        onError: (error) => {
            // Handle error case - you might want to show error message
            console.error("Forgot password error:", error);
            // Optionally set an error state here
        },
    });
    const formSubmitHandler = (e) => {
        e.preventDefault();
        addTodoMutation.mutate(loginFormValues);
    };
    return (_jsxs("div", { className: "sm:w-[55%] md:w-[60%] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]", children: [_jsx("h2", { className: "text-xl md:text-2xl text-black heading font-bold text-center", children: "Reset your password" }), _jsxs("form", { className: "w-full mt-[60px]", onSubmit: formSubmitHandler, children: [_jsxs("div", { className: "w-full", children: [_jsxs("label", { htmlFor: "emailField", className: "text-themeDarkGray text-xs", children: ["Email ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("input", { required: true, id: "emailField", type: "email", placeholder: "Enter your email here", className: "w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none", value: loginFormValues, onChange: (e) => setLoginFormValues(e.target.value), disabled: emailSubmited })] }), emailSubmited === true ? (_jsx("p", { className: "text-xs text-themeDarkGreen mt-5", children: successMessage })) : null, addTodoMutation.isPending && !emailSubmited ? (_jsx("p", { className: "text-xs text-themeGray mt-5", children: "Sending reset instructions..." })) : null, addTodoMutation.isError && !emailSubmited ? (_jsx("p", { className: "text-xs text-themeRed mt-5", children: "Something went wrong. Please try again." })) : null, emailSubmited === true ? (_jsx(Link, { to: "/auth/login", children: _jsx(FormBtn, { hasBg: true, title: "Back to login" }) })) : (_jsx(FormBtn, { hasBg: true, title: "Reset Password", disabled: addTodoMutation.isPending })), _jsx(Link, { to: "/auth/login", children: _jsx("p", { className: "mt-5 text-xs text-themeGray text-center", children: "Login" }) })] })] }));
};
export default ForgotPasswordForm;
