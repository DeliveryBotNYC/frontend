import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useStripe, useElements, PaymentElement, } from "@stripe/react-stripe-js";
const SetupForm = ({ clientSecret, onSuccess, onError, }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        setIsLoading(true);
        setErrorMessage(null);
        try {
            // Step 1: Submit the elements first (required by Stripe)
            const { error: submitError } = await elements.submit();
            if (submitError) {
                console.error("Elements submit error:", submitError);
                setErrorMessage(submitError.message || "Failed to submit payment details");
                onError(submitError);
                return;
            }
            // Step 2: Now confirm the setup intent
            const { error: confirmError } = await stripe.confirmSetup({
                elements,
                clientSecret, // Use the clientSecret passed as prop
                confirmParams: {
                    return_url: window.location.href, // Use current URL instead of hardcoded localhost
                },
                redirect: "if_required", // Prevent redirect for most cases
            });
            if (confirmError) {
                // Handle errors
                console.error("Setup confirmation error:", confirmError);
                setErrorMessage(confirmError.message || "Failed to confirm setup");
                onError(confirmError);
            }
            else {
                // Success! Setup completed
                console.log("Setup completed successfully");
                console.log("Calling onSuccess callback:", typeof onSuccess);
                // Optional: Make the new payment method default
                // You can either handle this in your backend webhook
                // or make an API call here to set it as default
                if (onSuccess) {
                    onSuccess();
                }
                else {
                    console.warn("onSuccess callback not provided");
                }
            }
        }
        catch (err) {
            console.error("Unexpected error:", err);
            const error = err;
            setErrorMessage("An unexpected error occurred");
            onError(error);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col justify-between items-center gap-4", children: [_jsx(PaymentElement, { className: "w-full" }), errorMessage && (_jsx("div", { className: "w-full p-3 bg-red-50 border border-red-200 rounded-lg", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4 text-red-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsx("p", { className: "text-sm text-red-700", children: errorMessage })] }) })), _jsx("button", { type: "submit", disabled: !stripe || !elements || isLoading, className: `w-full max-w-sm py-3 text-white shadow-btnShadow rounded-lg transition-all duration-200 font-medium ${!stripe || !elements || isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-themeGreen hover:bg-green-600 hover:scale-[0.98] active:scale-95"}`, children: isLoading ? (_jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx("div", { className: "animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" }), "Adding card..."] })) : ("Add Payment Method") })] }));
};
export default SetupForm;
