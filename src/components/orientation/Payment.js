import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { url } from "../../hooks/useConfig";
const Payment = ({ token, setStep, orientationData, onUpdateItem }) => {
    const [error, setError] = useState({});
    const [accountLinkUrl, setAccountLinkUrl] = useState(null);
    // Get account item from passed data
    const accountItem = orientationData?.items?.find((item) => item.id === "account_id");
    // Create account link mutation
    const createAccountLinkMutation = useMutation({
        mutationFn: async () => {
            if (!accountItem?.data?.account_id) {
                throw new Error("No account ID available");
            }
            console.log("Creating account link for:", accountItem.data.account_id);
            // Construct URLs for return and refresh
            const baseUrl = window.location.origin + window.location.pathname;
            const returnUrl = `${baseUrl}?payment_complete=true`;
            const refreshUrl = `${baseUrl}?payment_refresh=true`;
            return axios
                .post(url + "/stripe/account-link", {
                account_id: accountItem.data.account_id,
                return_url: returnUrl,
                refresh_url: refreshUrl,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                console.log("Account link response:", res.data);
                const linkUrl = res.data?.data?.url;
                if (!linkUrl) {
                    throw new Error("No account link URL received from server");
                }
                return linkUrl;
            });
        },
        onSuccess: (linkUrl) => {
            console.log("Account link created successfully:", linkUrl);
            setAccountLinkUrl(linkUrl);
            setError({});
        },
        onError: (err) => {
            console.error("Failed to create account link:", err);
            setError({
                message: err.response?.data?.message ||
                    "Failed to create payment link. Please try again.",
            });
        },
    });
    // Create account link and redirect immediately when component mounts
    useEffect(() => {
        if (accountItem?.data?.account_id &&
            !accountLinkUrl &&
            !createAccountLinkMutation.data &&
            !createAccountLinkMutation.isPending) {
            console.log("Starting account link creation...");
            createAccountLinkMutation.mutate();
        }
    }, [accountItem?.data?.account_id]);
    // Redirect to account link URL when it's available
    useEffect(() => {
        if (accountLinkUrl) {
            console.log("Redirecting to account link:", accountLinkUrl);
            window.location.href = accountLinkUrl;
        }
    }, [accountLinkUrl]);
    // Handle URL parameters on mount (for return/refresh handling)
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("payment_complete") === "true") {
            console.log("Payment onboarding completed successfully");
            // Update the item status to completed
            if (onUpdateItem) {
                onUpdateItem("account_id", "completed");
            }
            // Clean up URL and return to home
            window.history.replaceState({}, document.title, window.location.pathname);
            setStep("home");
            return;
        }
        if (urlParams.get("payment_refresh") === "true") {
            console.log("Payment onboarding needs refresh");
            // Clean up URL and refresh the account link
            window.history.replaceState({}, document.title, window.location.pathname);
            handleRetry();
        }
    }, []);
    // Handle retry button click
    const handleRetry = () => {
        console.log("Retrying payment setup...");
        setError({});
        setAccountLinkUrl(null);
        createAccountLinkMutation.reset();
        createAccountLinkMutation.mutate();
    };
    const isLoading = createAccountLinkMutation.isPending;
    return (_jsx("div", { className: "min-h-screen bg-[#404954] text-white", children: _jsxs("div", { className: "h-screen flex flex-col", children: [_jsx("div", { className: "flex-shrink-0 pt-6 px-4 pb-4", children: _jsx("button", { onClick: () => setStep("home"), className: "text-[#B2D235] hover:text-white transition-colors", children: "\u2190 Back to Home" }) }), error?.message && (_jsxs("div", { className: "flex-shrink-0 mx-4 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded", children: [error.message, _jsx("button", { onClick: handleRetry, className: "ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700", disabled: isLoading, children: isLoading ? "Retrying..." : "Retry" })] })), isLoading && (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#B2D235] mb-4" }), _jsx("p", { className: "text-center", children: "Creating payment setup link..." }), _jsx("p", { className: "text-sm text-gray-300 mt-2", children: "You will be redirected shortly..." })] })), accountLinkUrl && !error?.message && (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center", children: [_jsx("div", { className: "animate-pulse text-[#B2D235] text-2xl mb-4", children: "\u2713" }), _jsx("p", { className: "text-center", children: "Redirecting to payment setup..." })] })), !accountItem?.data?.account_id && !isLoading && (_jsxs("div", { className: "flex-1 flex flex-col items-center justify-center", children: [_jsx("p", { className: "text-center text-gray-300 mb-4", children: "Payment setup information is not available." }), _jsx("button", { onClick: () => setStep("home"), className: "bg-[#B2D235] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#a0c230] transition-colors", children: "Go Back" })] }))] }) }));
};
export default Payment;
