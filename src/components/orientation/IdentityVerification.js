import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import { url } from "../../hooks/useConfig";
import { loadStripe } from "@stripe/stripe-js";
const IdentityVerification = ({ token, setStep, orientationData, onUpdateItem, }) => {
    const [error, setError] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [clientSecret, setClientSecret] = useState(null);
    const initializationRef = useRef(false);
    // Get verification item from passed data
    const verificationItem = orientationData?.items?.find((item) => item.id === "vs_id");
    // Mutation to get fresh verification session client secret
    const getVerificationSessionMutation = useMutation({
        mutationFn: async () => {
            if (!verificationItem?.data?.vs_id) {
                throw new Error("No verification session ID available");
            }
            console.log("Getting verification session for:", verificationItem.data.vs_id);
            return axios
                .get(`${url}/stripe/verification-session/${verificationItem.data.vs_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                console.log("Verification session response:", res.data);
                const clientSecret = res.data?.data?.client_secret;
                if (!clientSecret) {
                    throw new Error("No client secret received from server");
                }
                return clientSecret;
            });
        },
        onSuccess: (clientSecret) => {
            console.log("Verification session retrieved successfully, client secret:", clientSecret);
            setClientSecret(clientSecret);
            setIsLoading(false); // Ensure loading is false
        },
        onError: (err) => {
            console.error("Failed to get verification session:", err);
            setError({
                message: err.response?.data?.message ||
                    "Failed to get verification session. Please try again.",
            });
            setIsLoading(false); // Ensure loading is false on error
        },
    });
    // Get fresh verification session when component mounts
    useEffect(() => {
        if (verificationItem?.data?.vs_id &&
            !clientSecret &&
            !initializationRef.current &&
            !getVerificationSessionMutation.data &&
            !getVerificationSessionMutation.isPending) {
            console.log("Starting verification session retrieval...");
            initializationRef.current = true;
            getVerificationSessionMutation.mutate();
        }
    }, [verificationItem?.data?.vs_id]);
    // Handle identity verification using Stripe Identity popup
    const handleStartVerification = async () => {
        if (!clientSecret) {
            setError({
                message: "Verification session not available. Please try again.",
            });
            return;
        }
        setIsLoading(true);
        try {
            const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
            if (!stripeKey) {
                setError({
                    message: "Stripe configuration error. Please contact support.",
                });
                setIsLoading(false);
                return;
            }
            console.log("Loading Stripe with key:", stripeKey);
            const stripe = await loadStripe(stripeKey);
            if (!stripe) {
                setError({
                    message: "Failed to load Stripe. Please check your connection.",
                });
                setIsLoading(false);
                return;
            }
            console.log("Starting identity verification with client secret:", clientSecret);
            // Use Stripe Identity to verify using client secret
            const { error: stripeError } = await stripe.verifyIdentity(clientSecret);
            setIsLoading(false);
            if (stripeError) {
                console.error("Stripe Identity error:", stripeError);
                setError({
                    message: stripeError.message || "Verification failed. Please try again.",
                });
            }
            else {
                // Verification completed successfully - just go back to home
                console.log("Identity verification completed successfully");
                if (onUpdateItem) {
                    onUpdateItem("vs_id", "completed");
                }
                setStep("home");
            }
        }
        catch (err) {
            console.error("Error during identity verification:", err);
            setError({
                message: "An unexpected error occurred. Please try again.",
            });
            setIsLoading(false);
        }
    };
    // Handle retry button click
    const handleRetry = () => {
        console.log("Retrying verification session retrieval...");
        setError({});
        setClientSecret(null);
        initializationRef.current = false;
        getVerificationSessionMutation.reset();
        getVerificationSessionMutation.mutate();
    };
    // Show loading while getting session - use clientSecret as indicator instead of mutation status
    const isGettingSession = !clientSecret && !error?.message && verificationItem?.data?.vs_id;
    return (_jsx("div", { className: "min-h-screen bg-[#404954] text-white", children: _jsxs("div", { className: "pt-24 px-4 pb-8", children: [error?.message && (_jsxs("div", { className: "mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded", children: [error.message, _jsx("button", { onClick: handleRetry, className: "ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700", disabled: isGettingSession, children: isGettingSession ? "Retrying..." : "Retry" })] })), isGettingSession && (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#B2D235] mb-4" }), _jsx("p", { className: "text-center", children: "Getting verification session..." })] })), !isGettingSession && (_jsxs("div", { className: "mb-8", children: [_jsxs("div", { className: "bg-[#5A6370] rounded-lg p-4 mb-4", children: [_jsx("h2", { className: "text-lg font-semibold mb-2", children: "Identity Verification" }), _jsx("p", { className: "text-sm text-gray-300 mb-3", children: "We need to verify your identity to ensure the security of all drivers and customers." }), verificationItem?.data?.vs_id && (_jsxs("p", { className: "text-xs text-gray-400", children: ["Verification ID: ", verificationItem.data.vs_id] }))] }), _jsxs("div", { className: "bg-[#5A6370] rounded-lg p-4", children: [_jsx("h3", { className: "font-semibold mb-2", children: "What you'll need:" }), _jsxs("ul", { className: "text-sm text-gray-300 space-y-1", children: [_jsx("li", { children: "\u2022 A government-issued photo ID (driver's license, passport, or state ID)" }), _jsx("li", { children: "\u2022 A smartphone with a camera (for mobile verification)" }), _jsx("li", { children: "\u2022 Good lighting for clear photos" })] })] })] })), !isGettingSession && clientSecret && (_jsx("div", { className: "flex flex-col items-center", children: isLoading ? (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-[#B2D235] mr-3" }), _jsx("span", { className: "text-lg", children: "Starting verification..." })] })) : (_jsxs(_Fragment, { children: [_jsx("button", { onClick: handleStartVerification, className: "bg-[#B2D235] text-white text-lg font-semibold py-4 px-8 rounded-lg mb-4 hover:bg-[#A1C024] transition-colors", children: "Start Identity Verification" }), _jsx("p", { className: "text-sm text-gray-400 text-center max-w-md", children: "This will open a secure verification window. The process takes less than 1 minute to complete." })] })) })), !verificationItem?.data?.vs_id && !isGettingSession && (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx("p", { className: "text-center text-gray-300 mb-4", children: "Identity verification information is not available." }), _jsx("button", { onClick: () => setStep("home"), className: "bg-[#B2D235] text-white px-6 py-3 rounded-lg font-semibold", children: "Go Back" })] }))] }) }));
};
export default IdentityVerification;
