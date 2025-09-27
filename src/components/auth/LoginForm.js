import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import FormBtn from "../reusable/FormBtn";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { url } from "../../hooks/useConfig";
import { FormPassword, FormInput } from "../reusable/FormComponents";
const LoginForm = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    const admin = location.pathname == "/auth/admin/login" ? true : false;
    // Get success message and email from navigation state
    const successMessage = location.state?.message;
    const prefilledEmail = location.state?.email || "";
    const userRef = useRef();
    const errRef = useRef();
    // Pre-fill email if provided from signup redirect
    const [user, setUser] = useState(prefilledEmail);
    const [pwd, setPwd] = useState("");
    // State to show success message and auto-hide it
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    // Show success message when component mounts if message exists
    useEffect(() => {
        if (successMessage) {
            setShowSuccessMessage(true);
            // Auto-hide the message after 7 seconds for longer messages
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);
    // Focus on password field if email is pre-filled
    useEffect(() => {
        if (prefilledEmail && pwd === "") {
            // Focus on password field since email is already filled
            const passwordField = document.getElementById("passwordField");
            passwordField?.focus();
        }
    }, [prefilledEmail, pwd]);
    // submit handler
    const formSubmitHandler = (e) => {
        e.preventDefault();
        // Clear success message when user tries to login
        setShowSuccessMessage(false);
        addTodoMutation.mutate({ email: user, password: pwd });
    };
    const addTodoMutation = useMutation({
        mutationFn: (newTodo) => axios.post(admin ? url + "/admin/login" : url + "/retail/login", {
            email: user,
            password: pwd,
        }),
        onSuccess: (data) => {
            const accessToken = data?.data?.data?.token;
            const roles = admin ? [2001, 5150] : [2001];
            setAuth({ user, pwd, roles, accessToken });
            localStorage.setItem("aT", accessToken);
            localStorage.setItem("roles", JSON.stringify(roles));
            setUser("");
            setPwd("");
            navigate(from, { replace: true });
        },
        onError: (error) => { },
    });
    return (_jsxs("div", { className: "sm:w-[55%] md:w-[60%] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]", children: [_jsx("h2", { className: "text-xl md:text-2xl text-black heading font-bold text-center", children: admin ? "Sign into your Admin account" : "Sign into your account" }), _jsxs("form", { className: "w-full mt-[60px]", onSubmit: formSubmitHandler, children: [_jsx("div", { className: "w-full", children: _jsx(FormInput, { label: "Email", required: true, id: "emailField", type: "email", placeholder: "Enter your email", value: user, onChange: (e) => {
                                setUser(e.target.value);
                            } }) }), _jsx("div", { className: "w-full mt-5 relative", children: _jsx(FormPassword, { label: "Password", id: "passwordField", required: true, value: pwd, onChange: (e) => setPwd(e.target.value), placeholder: "Enter your password" }) }), showSuccessMessage && successMessage && (_jsx("p", { className: "text-xs text-themeDarkGreen mt-5", children: successMessage })), addTodoMutation.isError &&
                        addTodoMutation?.error?.response?.data?.code == "onboarding" ? (_jsx("div", { className: "mt-5 p-3 bg-green-50 border border-green-200 rounded-md", children: _jsx("p", { className: "text-xs text-themeGreen", children: addTodoMutation.error.response.data.message }) })) : addTodoMutation?.error?.response?.data?.message ? (_jsx("p", { className: "text-xs text-themeRed mt-5", children: addTodoMutation.error.response.data.message })) : (""), _jsx(FormBtn, { hasBg: true, title: addTodoMutation.isPending ? "Signing in..." : "Login", disabled: addTodoMutation.isPending }), _jsx(Link, { to: "/auth/forgot-password", state: { email: user }, children: _jsx("p", { className: "mt-5 text-xs text-themeGray text-center hover:text-themeOrange transition-colors", children: "Forgot password?" }) })] })] }));
};
export default LoginForm;
