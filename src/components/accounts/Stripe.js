import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import SetupForm from "./SetupForm";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useConfig, url } from "../../hooks/useConfig";
const stripePromise = loadStripe("pk_test_51IN3dSBtqkgzqqGPm3m7aK0z6yBdsczcuueCKpICWWCuiHw3d3Em24fZNELDJViYnLmyDVMEECh5HwF0wJf7mcPT00gTMrLclR");
const Stripe = ({ onSuccess, onError }) => {
    const config = useConfig();
    const { isLoading, data, error } = useQuery({
        queryKey: ["stripe_setup_intent"],
        queryFn: async () => {
            const response = await axios.get(url + "/stripe/setupintent", config);
            const setupIntentData = response.data.data || response.data;
            if (!setupIntentData?.client_secret) {
                throw new Error("Invalid setup intent response - missing client_secret");
            }
            return setupIntentData;
        },
        enabled: !!config && !!url,
        retry: (failureCount, error) => {
            return failureCount < 3;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
        onSuccess: (data) => {
            // Optional: handle success
        },
        onError: (error) => {
            // Optional: handle error
        },
    });
    if (isLoading) {
        return (_jsxs("div", { className: "flex items-center justify-center p-8", children: [_jsx("div", { className: "animate-spin h-6 w-6 border-2 border-themeOrange border-t-transparent rounded-full" }), _jsx("span", { className: "ml-2 text-sm text-themeDarkGray", children: "Loading payment form..." })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("svg", { className: "w-4 h-4 text-red-500", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" }) }), _jsx("p", { className: "text-sm text-red-700 font-medium", children: "Failed to load payment form" })] }), _jsx("p", { className: "text-xs text-red-600 mt-1", children: error.response?.data?.message || error.message }), _jsxs("details", { className: "mt-2 text-xs text-gray-600", children: [_jsx("summary", { children: "Debug Info" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap", children: JSON.stringify(error.response?.data || error, null, 2) })] })] }));
    }
    if (!data?.client_secret) {
        return (_jsxs("div", { className: "p-4 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsx("p", { className: "text-sm text-yellow-700", children: "Setup intent loaded but missing client_secret" }), _jsxs("details", { className: "mt-2 text-xs text-gray-600", children: [_jsx("summary", { children: "Data received" }), _jsx("pre", { className: "mt-1 whitespace-pre-wrap", children: JSON.stringify(data, null, 2) })] })] }));
    }
    return (_jsx(Elements, { stripe: stripePromise, options: {
            clientSecret: data.client_secret,
            appearance: {
                theme: "stripe",
                variables: {
                    colorPrimary: "#FF6B35",
                    colorBackground: "#ffffff",
                    colorText: "#30313d",
                    colorDanger: "#df1b41",
                    fontFamily: "system-ui, sans-serif",
                    spacingUnit: "4px",
                    borderRadius: "6px",
                },
            },
        }, children: _jsx(SetupForm, { clientSecret: data.client_secret, onSuccess: onSuccess, onError: onError }) }));
};
export default Stripe;
