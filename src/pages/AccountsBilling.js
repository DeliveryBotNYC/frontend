import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { url, useConfig } from "../hooks/useConfig";
import { FormInput, FormSelect } from "../components/reusable/FormComponents";
import Stripe from "../components/accounts/Stripe";
import PaymentMethods from "../components/accounts/PaymentMethods";
const AccountsBilling = () => {
    const config = useConfig();
    const { accountsData, setAccountsData } = useOutletContext();
    const [updatedBillingData, setUpdatedBillingData] = useState({});
    const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });
    const [newCard, setNewCard] = useState(false);
    const [error, setError] = useState({
        message: "",
        fieldErrors: {},
    });
    // Fetch Stripe customer data for billing email and default payment method
    const { data: stripeCustomerData, isLoading: stripeCustomerLoading, error: stripeCustomerError, refetch: refetchStripeCustomer, } = useQuery({
        queryKey: ["stripeCustomer"],
        queryFn: () => axios.get(url + "/stripe/customer", config),
        enabled: !!config,
        select: (data) => data.data.data || null,
        staleTime: 1000 * 60 * 5,
        retry: 2,
    });
    // Store current form values (combination of original data, stripe data, and updates)
    const currentFormValues = useMemo(() => {
        const baseData = { ...accountsData };
        // Override with Stripe customer data if available
        if (stripeCustomerData) {
            baseData.email = stripeCustomerData.email || baseData.email;
            baseData.default_payment_method =
                stripeCustomerData.invoice_settings?.default_payment_method ||
                    baseData.default_payment_method;
            baseData.stripe_customer_id =
                stripeCustomerData.id || baseData.stripe_customer_id;
        }
        // Apply any local updates
        return { ...baseData, ...updatedBillingData };
    }, [accountsData, stripeCustomerData, updatedBillingData]);
    // Update customer email mutation
    const updateCustomerMutation = useMutation({
        mutationFn: (updateData) => axios.patch(url + "/stripe/customer", updateData, config),
        onSuccess: (data) => {
            refetchStripeCustomer();
            setSubmitStatus({
                type: "success",
                message: "Customer information updated successfully!",
            });
            setTimeout(() => {
                setSubmitStatus({ type: "", message: "" });
            }, 5000);
        },
        onError: (error) => {
            setSubmitStatus({
                type: "error",
                message: error.response?.data?.message ||
                    "Failed to update customer information",
            });
        },
    });
    // Handle form input changes
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
        // Compare with current value (which includes Stripe data)
        const currentValue = currentFormValues[id];
        if (currentValue !== value) {
            setUpdatedBillingData((prev) => ({
                ...prev,
                [id]: value,
            }));
        }
        else {
            const newData = { ...updatedBillingData };
            delete newData[id];
            setUpdatedBillingData(newData);
        }
    };
    // Save billing data mutation
    const saveBillingMutation = useMutation({
        mutationFn: (billingData) => axios.patch(url + "/stripe/customer", billingData, config),
        onSuccess: (data) => {
            setError({ message: "", fieldErrors: {} });
            const updatedData = {
                ...accountsData,
                ...data.data,
            };
            setAccountsData(updatedData);
            // If email was updated, also update it in Stripe
            if (updatedBillingData.email &&
                updatedBillingData.email !== stripeCustomerData?.email) {
                updateCustomerMutation.mutate({ email: updatedBillingData.email });
            }
            setUpdatedBillingData({});
            refetchStripeCustomer();
            setSubmitStatus({
                type: "success",
                message: "Billing information saved successfully!",
            });
            setTimeout(() => {
                setSubmitStatus({ type: "", message: "" });
            }, 5000);
        },
        onError: (error) => {
            const fieldErrors = {};
            if (error.response?.data?.data &&
                Array.isArray(error.response.data.data)) {
                error.response.data.data.forEach((err) => {
                    fieldErrors[err.field] = err.message;
                });
            }
            setError({
                message: error.response?.data?.message || "An error occurred",
                fieldErrors: fieldErrors,
            });
            setSubmitStatus({
                type: "error",
                message: error.response?.data?.message || "Failed to save billing information",
            });
        },
    });
    // Warn user about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (Object.keys(updatedBillingData).length > 0) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [updatedBillingData]);
    // Options for the select dropdowns
    const frequencyOptions = [
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
    ];
    const methodOptions = [
        { value: "card", label: "Card" },
        { value: "check", label: "Check" },
        { value: "ach", label: "ACH" },
    ];
    // Loading state
    if (accountsData === undefined || stripeCustomerLoading) {
        return (_jsxs("div", { className: "w-full h-full bg-white p-themePadding rounded-2xl flex items-center justify-center", children: [_jsx("div", { className: "animate-spin h-8 w-8 border-2 border-themeGreen border-t-transparent rounded-full" }), _jsx("span", { className: "ml-2 text-themeDarkGray", children: stripeCustomerLoading
                        ? "Loading billing information..."
                        : "Loading..." })] }));
    }
    return (_jsx("div", { className: "w-full h-full bg-white p-themePadding rounded-2xl", children: _jsxs("div", { className: "w-full h-full bg-white rounded-2xl flex flex-col justify-between items-center", children: [_jsxs("div", { className: "w-full h-full", children: [_jsxs("div", { className: "flex items-center justify-between gap-2.5 mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl text-black font-bold", children: "Billing" }), _jsx("p", { className: "text-sm text-themeDarkGray mt-1", children: "Manage your billing information and payment methods" })] }), !newCard && Object.keys(updatedBillingData).length > 0 && (_jsxs("div", { className: "flex items-center gap-2 text-sm text-themeDarkGray", children: [_jsx("div", { className: "w-2 h-2 bg-orange-400 rounded-full animate-pulse" }), _jsx("span", { children: "Unsaved changes" })] })), newCard && (_jsx("button", { className: "text-lg text-black font-bold cursor-pointer hover:text-themeOrange transition-colors", onClick: () => setNewCard(false), children: "Go back" }))] }), stripeCustomerError && (_jsx("div", { className: "mb-6 border border-yellow-200 rounded-lg p-4 bg-yellow-50", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-5 h-5 text-yellow-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsx("p", { className: "text-sm text-yellow-700", children: "Warning: Could not load Stripe billing information. Some data may be outdated." })] }) })), newCard ? (_jsx(Stripe, { onSuccess: () => {
                                console.log("AccountsBilling onSuccess called - closing Stripe form");
                                // Close the Stripe form
                                setNewCard(false);
                                // Show success message
                                setSubmitStatus({
                                    type: "success",
                                    message: "Payment method added successfully!",
                                });
                                // Clear the message after 5 seconds
                                setTimeout(() => {
                                    setSubmitStatus({ type: "", message: "" });
                                }, 5000);
                            }, onError: (error) => {
                                console.log("AccountsBilling onError called:", error);
                                setSubmitStatus({
                                    type: "error",
                                    message: error.message || "Failed to add payment method",
                                });
                            } })) : (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4 text-black", children: "Billing Information" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormInput, { label: "Invoice email", id: "email", type: "email", required: true, value: currentFormValues?.email || "", onChange: handleChange, placeholder: "Enter invoice email", error: error.fieldErrors?.email }), _jsx(FormInput, { label: "Stripe ID", id: "stripe_id", type: "text", required: true, disabled: true, value: stripeCustomerData?.id || "", onChange: handleChange, placeholder: "Enter Stripe customer id", error: error.fieldErrors?.customer_id })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx(FormSelect, { label: "Frequency", id: "billing_frequency", required: true, disabled: true, value: currentFormValues?.billing_frequency || "", onChange: handleChange, options: frequencyOptions, placeholder: "Select frequency", error: error.fieldErrors?.billing_frequency }), _jsx(FormSelect, { label: "Method", id: "billing_method", required: true, disabled: true, value: currentFormValues?.billing_method || "", onChange: handleChange, options: methodOptions, placeholder: "Select method", error: error.fieldErrors?.billing_method })] })] }), _jsx(PaymentMethods, { billingMethod: currentFormValues?.billing_method, stripeCustomerData: stripeCustomerData, refetchStripeCustomer: refetchStripeCustomer, newCard: newCard, setNewCard: setNewCard, setSubmitStatus: setSubmitStatus })] }))] }), !newCard && (_jsxs("div", { className: "w-full flex flex-col items-center mt-8", children: [_jsx("button", { disabled: Object.keys(updatedBillingData).length < 1 ||
                                saveBillingMutation.isPending, onClick: () => saveBillingMutation.mutate(updatedBillingData), className: `w-full max-w-sm py-3 text-white shadow-btnShadow rounded-lg transition-all duration-200 font-medium ${Object.keys(updatedBillingData).length > 0 &&
                                !saveBillingMutation.isPending
                                ? "bg-themeGreen hover:bg-green-600 hover:scale-[0.98] active:scale-95"
                                : "bg-themeLightGray cursor-not-allowed"}`, children: saveBillingMutation.isPending ? (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" }), "Saving Billing Info..."] })) : ("Save Billing Information") }), submitStatus.message && (_jsx("div", { className: `mt-3 p-3 rounded-lg text-sm font-medium w-full max-w-sm ${submitStatus.type === "success"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : "bg-red-50 text-red-700 border border-red-200"}`, children: _jsxs("div", { className: "flex items-center gap-2", children: [submitStatus.type === "success" ? (_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })) : (_jsx("svg", { className: "w-4 h-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" }) })), submitStatus.message] }) })), error.message && !submitStatus.message && (_jsx("div", { className: "mt-3 p-3 bg-red-50 border border-red-200 rounded-lg w-full max-w-sm", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4 text-red-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsx("p", { className: "text-sm text-red-700 font-medium", children: error.message })] }) }))] }))] }) }));
};
export default AccountsBilling;
