import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { url, useConfig } from "../hooks/useConfig";
import { FormInput, AddressAutocomplete, FormTextarea, } from "../components/reusable/FormComponents";
// Update Password Modal
const UpdatePasswordModal = ({ show, onClose, onSuccess, }) => {
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords((prev) => ({ ...prev, [name]: value }));
        if (passwordErrors[name]) {
            setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };
    const validatePasswords = () => {
        const errors = {};
        if (!passwords.currentPassword) {
            errors.currentPassword = "Current password is required";
        }
        if (!passwords.newPassword) {
            errors.newPassword = "New password is required";
        }
        else if (passwords.newPassword.length < 8) {
            errors.newPassword = "Password must be at least 8 characters";
        }
        if (!passwords.confirmPassword) {
            errors.confirmPassword = "Please confirm your password";
        }
        else if (passwords.newPassword !== passwords.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        return errors;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = validatePasswords();
        if (Object.keys(errors).length > 0) {
            setPasswordErrors(errors);
            return;
        }
        setIsSubmitting(true);
        try {
            // Add your password update API call here
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
            setPasswords({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            setPasswordErrors({});
            onClose();
            onSuccess();
        }
        catch (error) {
            setPasswordErrors({ submit: "Failed to update password" });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleClose = () => {
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPasswordErrors({});
        onClose();
    };
    if (!show)
        return null;
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", children: _jsx("div", { className: "bg-white rounded-lg shadow-xl w-full max-w-md", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-black", children: "Update Password" }), _jsx("button", { type: "button", onClick: handleClose, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsx(FormInput, { label: "Current Password", id: "currentPassword", name: "currentPassword", type: "password", required: true, value: passwords.currentPassword, onChange: handlePasswordChange, error: passwordErrors.currentPassword }), _jsx(FormInput, { label: "New Password", id: "newPassword", name: "newPassword", type: "password", required: true, value: passwords.newPassword, onChange: handlePasswordChange, error: passwordErrors.newPassword }), _jsx(FormInput, { label: "Confirm New Password", id: "confirmPassword", name: "confirmPassword", type: "password", required: true, value: passwords.confirmPassword, onChange: handlePasswordChange, error: passwordErrors.confirmPassword }), passwordErrors.submit && (_jsx("div", { className: "text-red-500 text-sm mt-2", children: passwordErrors.submit })), _jsxs("div", { className: "flex gap-3 pt-4", children: [_jsx("button", { type: "button", onClick: handleClose, className: "flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: `flex-1 px-4 py-2 text-white rounded-lg transition-all ${isSubmitting
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-themeGreen hover:bg-green-600"}`, children: isSubmitting ? (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" }), "Updating..."] })) : ("Update Password") })] })] })] }) }) }));
};
const AccountsGeneral = () => {
    const config = useConfig();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({
        type: "",
        message: "",
    });
    const { accountsData, setAccountsData } = useOutletContext();
    const [updatedAccountData, setUpdatedAccountData] = useState({});
    const [error, setError] = useState({
        message: "",
        fieldErrors: {},
    });
    // Store current form values (combination of original data and updates)
    const currentFormValues = useMemo(() => {
        return { ...accountsData, ...updatedAccountData };
    }, [accountsData, updatedAccountData]);
    const handleChange = (e) => {
        const { id, value } = e.target;
        // Clear field error and status when user starts typing
        if (error.fieldErrors[id]) {
            setError((prev) => ({
                ...prev,
                fieldErrors: {
                    ...prev.fieldErrors,
                    [id]: undefined,
                },
            }));
        }
        if (error.message) {
            setError((prev) => ({
                ...prev,
                message: "",
            }));
        }
        // Clear submit status when user makes changes
        if (submitStatus.message) {
            setSubmitStatus({ type: "", message: "" });
        }
        if (accountsData[id] !== value) {
            setUpdatedAccountData((prev) => ({
                ...prev,
                [id]: value,
            }));
        }
        else {
            const newData = { ...updatedAccountData };
            delete newData[id];
            setUpdatedAccountData(newData);
        }
    };
    const addTodoMutation = useMutation({
        mutationFn: (newTodo) => axios.patch(url + "/retail", newTodo, config),
        onSuccess: (data) => {
            setError({ message: "", fieldErrors: {} });
            const updatedData = {
                ...accountsData,
                ...data.data.data,
                phone: data.data.data.phone_formatted,
            };
            setAccountsData(updatedData);
            setUpdatedAccountData({});
            // Show success message
            setSubmitStatus({
                type: "success",
                message: "Changes saved successfully!",
            });
            // Clear success message after 5 seconds
            setTimeout(() => {
                setSubmitStatus({ type: "", message: "" });
            }, 5000);
        },
        onError: (error) => {
            const fieldErrors = {};
            // Type guard to check if error has the expected structure
            if (error &&
                typeof error === "object" &&
                "response" in error &&
                error.response &&
                typeof error.response === "object" &&
                "data" in error.response &&
                error.response.data &&
                typeof error.response.data === "object" &&
                "data" in error.response.data &&
                Array.isArray(error.response.data.data)) {
                error.response.data.data.forEach((err) => {
                    if (err &&
                        typeof err === "object" &&
                        "field" in err &&
                        "message" in err &&
                        typeof err.field === "string" &&
                        typeof err.message === "string") {
                        fieldErrors[err.field] = err.message;
                    }
                });
            }
            // Get error message with type safety
            let errorMessage = "An error occurred";
            if (error &&
                typeof error === "object" &&
                "response" in error &&
                error.response &&
                typeof error.response === "object" &&
                "data" in error.response &&
                error.response.data &&
                typeof error.response.data === "object" &&
                "message" in error.response.data &&
                typeof error.response.data.message === "string") {
                errorMessage = error.response.data.message;
            }
            setError({
                message: errorMessage,
                fieldErrors: fieldErrors,
            });
            // Show error message
            setSubmitStatus({
                type: "error",
                message: errorMessage,
            });
        },
    });
    // Warn user about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (Object.keys(updatedAccountData).length > 0) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [updatedAccountData]);
    const handlePasswordSuccess = () => {
        setSubmitStatus({
            type: "success",
            message: "Password updated successfully!",
        });
        setTimeout(() => {
            setSubmitStatus({ type: "", message: "" });
        }, 5000);
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "w-full h-full bg-white p-themePadding rounded-2xl", children: _jsxs("div", { className: "w-full h-full bg-white rounded-2xl flex flex-col justify-between items-center", children: [_jsxs("div", { className: "w-full h-full", children: [_jsxs("div", { className: "flex items-center justify-between gap-2.5 mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl text-black font-bold", children: "General" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "Manage your account and store information" })] }), Object.keys(updatedAccountData).length > 0 && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-themeDarkGray", children: [_jsx("div", { className: "w-2 h-2 bg-orange-400 rounded-full animate-pulse" }), _jsx("span", { children: "Unsaved changes" })] }))] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-black", children: "Personal Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormInput, { label: "First Name", id: "firstname", required: true, value: currentFormValues?.firstname || "", onChange: handleChange, error: error.fieldErrors?.firstname, capitalize: true }), _jsx(FormInput, { label: "Last Name", id: "lastname", required: true, value: currentFormValues?.lastname || "", onChange: handleChange, error: error.fieldErrors?.lastname, capitalize: true }), _jsx("div", { className: "md:col-span-2", children: _jsx(FormInput, { label: "Email", id: "email", type: "email", required: true, value: currentFormValues?.email || "", onChange: handleChange, error: error.fieldErrors?.email }) })] }), _jsx("div", { className: "mt-5", children: _jsx("button", { type: "button", onClick: () => setShowPasswordModal(true), className: "text-sm text-black hover:text-themeGreen transition-colors", children: "Update password" }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-black", children: "Store Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormInput, { label: "Store Name", id: "name", required: true, disabled: true, value: currentFormValues?.name || "", onChange: handleChange, error: error.fieldErrors?.name, capitalize: true }), _jsx(FormInput, { label: "Phone", id: "phone", required: true, prefix: "+1", isPhone: true, autoComplete: "new-password", value: currentFormValues?.phone || "", onChange: handleChange, error: error.fieldErrors?.phone, placeholder: "(555) 123-4567" }), _jsx(AddressAutocomplete, { label: "Address", id: "address", required: true, value: currentFormValues?.address || "", onChange: handleChange, error: error.fieldErrors?.address }), _jsxs("div", { className: "flex items-start gap-4", children: [_jsx(FormInput, { label: "Apt", id: "apt", type: "number", value: currentFormValues?.apt || "", onChange: handleChange, error: error.fieldErrors?.apt }), _jsx(FormInput, { label: "Access code", id: "access_code", value: currentFormValues?.access_code || "", onChange: handleChange, error: error.fieldErrors?.access_code })] }), _jsx("div", { className: "md:col-span-2", children: _jsx(FormTextarea, { label: "Pickup courier note", id: "default_pickup_note", value: currentFormValues?.default_pickup_note || "", onChange: handleChange, error: error.fieldErrors?.default_pickup_note, maxLength: 100, showCharacterCount: true, resizable: true }) }), _jsx("div", { className: "md:col-span-2", children: _jsx(FormTextarea, { label: "Delivery courier note", id: "default_delivery_note", value: currentFormValues?.default_delivery_note || "", onChange: handleChange, error: error.fieldErrors?.default_delivery_note, maxLength: 100, showCharacterCount: true, resizable: true }) })] })] })] })] }), _jsxs("div", { className: "w-full flex flex-col items-center mt-8", children: [_jsx("button", { type: "button", disabled: Object.keys(updatedAccountData).length < 1 ||
                                        addTodoMutation.isPending, onClick: () => addTodoMutation.mutate(updatedAccountData), className: `w-full max-w-sm py-3 text-white shadow-btnShadow rounded-lg transition-all duration-200 font-medium ${Object.keys(updatedAccountData).length > 0 &&
                                        !addTodoMutation.isPending
                                        ? "bg-themeGreen hover:bg-green-600 hover:scale-[0.98] active:scale-95"
                                        : "bg-themeLightGray cursor-not-allowed"}`, children: addTodoMutation.isPending ? (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" }), "Saving Changes..."] })) : ("Save Changes") }), submitStatus.message && (_jsx("div", { className: `mt-3 p-3 rounded-lg text-sm font-medium w-full max-w-sm ${submitStatus.type === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"}`, children: _jsxs("div", { className: "flex items-center gap-2", children: [submitStatus.type === "success" ? (_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })) : (_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" }) })), submitStatus.message] }) })), error.message && !submitStatus.message && (_jsx("div", { className: "mt-3 p-3 bg-red-50 border border-red-200 rounded-lg w-full max-w-sm", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4 text-red-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsx("p", { className: "text-sm text-red-700 font-medium", children: error.message })] }) }))] })] }) }), _jsx(UpdatePasswordModal, { show: showPasswordModal, onClose: () => setShowPasswordModal(false), onSuccess: handlePasswordSuccess })] }));
};
export default AccountsGeneral;
