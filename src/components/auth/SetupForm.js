import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { url } from "../../hooks/useConfig";
import useAuth from "../../hooks/useAuth";
import axios from "axios";
import { FormInput, FormTextarea, AddressAutocomplete, FormSelect, } from "../reusable/FormComponents";
const SetupForm = () => {
    const { setAuth } = useAuth();
    const navigate = useNavigate();
    const { state } = useLocation();
    useEffect(() => {
        if (!state?.email) {
            navigate("/auth/signup");
        }
    }, [state, navigate]);
    // Form states
    const [deliveryPerWeek, setdeliveryPerWeek] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Delivery options
    const deliveryData = [
        { id: 1, title: "1-5", quantity: "1-5" },
        { id: 2, title: "5-20", quantity: "5-20" },
        { id: 3, title: "20-50", quantity: "20-50" },
        { id: 4, title: "100+", quantity: "100+" },
    ];
    // Store type options
    const storeTypeOptions = [
        { label: "Grocery", value: "grocery" },
        { label: "Clothing", value: "clothing" },
        { label: "Laundry", value: "laundry" },
        { label: "Flower", value: "flower" },
        { label: "Alcohol", value: "alcohol" },
        { label: "Other", value: "other" },
    ];
    // Enhanced form data with proper typing
    const [companySetupData, setCompanySetupData] = useState({
        email: state?.email || "",
        password: state?.password || "",
        firstname: "",
        lastname: "",
        store_name: "",
        store_type: "", // Added store_type to state
        phone: "",
        access_code: "",
        address: {
            address_id: null,
            full: "",
            street_address_1: "",
            street_address_2: "",
            city: "",
            state: "",
            zip: "",
            lat: "",
            lon: "",
        },
        note: "",
        estimated_monthly_volume: 0,
        // Terms acceptance tracking
        terms: null,
    });
    console.log(companySetupData);
    // Validation function
    const validateForm = () => {
        const errors = {};
        if (!companySetupData.firstname.trim()) {
            errors.firstname = "First name is required";
        }
        if (!companySetupData.lastname.trim()) {
            errors.lastname = "Last name is required";
        }
        if (!companySetupData.store_name.trim()) {
            errors.store_name = "Store name is required";
        }
        if (!companySetupData.store_type.trim()) {
            errors.store_type = "Store type is required";
        }
        if (!companySetupData.phone.trim()) {
            errors.phone = "Phone number is required";
        }
        if (!companySetupData.address.full.trim()) {
            errors.address = "Address is required";
        }
        if (!deliveryPerWeek) {
            errors.deliveryPerWeek = "Please select delivery frequency";
        }
        if (!termsAccepted) {
            errors.terms = "You must accept the terms and conditions";
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    // Check if all required fields are completed
    const isFormValid = () => {
        return (companySetupData.firstname.trim() &&
            companySetupData.lastname.trim() &&
            companySetupData.store_name.trim() &&
            companySetupData.store_type.trim() && // Added store_type validation
            companySetupData.phone.trim() &&
            companySetupData.address.address_id &&
            deliveryPerWeek &&
            termsAccepted);
    };
    // Helper function to get estimated volume
    const getEstimatedVolume = (quantity) => {
        const volumeMap = {
            "1-5": 5,
            "5-20": 20,
            "20-50": 50,
            "100+": 100,
        };
        return volumeMap[quantity] || 0;
    };
    // Enhanced submit handler
    const formSubmitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsSubmitting(true);
        // Prepare API data
        const apiData = {
            email: companySetupData.email,
            password: companySetupData.password,
            firstname: companySetupData.firstname.trim(),
            lastname: companySetupData.lastname.trim(),
            store_name: companySetupData.store_name.trim(),
            store_type: companySetupData.store_type.trim(), // Added store_type to API data
            phone: companySetupData.phone.trim(),
            estimated_monthly_volume: getEstimatedVolume(deliveryPerWeek),
            note: companySetupData.note.trim(),
            address: companySetupData.address,
            terms: new Date().toISOString(), // ISO timestamp
        };
        console.log("Sending API data:", apiData);
        addTodoMutation.mutate(apiData);
    };
    const addTodoMutation = useMutation({
        mutationFn: (userData) => axios.post(`${url}/retail`, userData),
        onSuccess: (data) => {
            console.log("Signup successful:", data.data.data);
            const results = data.data.data.retail;
            const email = results.email;
            const pwd = results.password;
            const roles = [2001];
            const accessToken = data.data.data.token;
            setAuth({ user: email, pwd, roles, accessToken });
            localStorage.setItem("aT", accessToken);
            localStorage.setItem("roles", JSON.stringify(roles));
            // Navigate to home with success message
            navigate("/auth/login", {
                state: {
                    accountCreated: true,
                    message: "Account created successfully! Your account is currently under review. You'll receive an email notification once it's approved and ready to use.",
                    email: email,
                },
            });
        },
        onError: (error) => {
            setIsSubmitting(false);
            console.error("Signup error:", error);
            if (error.response?.status === 409) {
                // Email already exists
                navigate("/auth/login", {
                    state: {
                        message: "An account with this email already exists. Please log in instead.",
                        email: companySetupData.email,
                    },
                });
            }
            else if (error.response?.status === 400) {
                // Validation errors from backend
                const backendErrors = error.response?.data?.errors || {};
                setFormErrors(backendErrors);
            }
            else {
                // Generic error
                setFormErrors({
                    general: "Something went wrong. Please try again.",
                });
            }
        },
    });
    // Handle address change
    const handleAddressChange = (e) => {
        const value = e.target.value;
        // Clear address error when user starts typing
        if (formErrors.address) {
            setFormErrors((prev) => ({ ...prev, address: "" }));
        }
        if (typeof value === "object" && value !== null) {
            setCompanySetupData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    address_id: value.address_id || null,
                    full: value.formatted || value.formatted_address || "",
                    street_address_1: value.street_address_1 || value.street || "",
                    city: value.city || "",
                    state: value.state || "",
                    zip: value.zip || "",
                    lat: value.lat || "",
                    lon: value.lon || "",
                },
            }));
        }
        else {
            setCompanySetupData((prev) => ({
                ...prev,
                address: {
                    ...prev.address,
                    full: value,
                    street_address_1: value,
                    city: "",
                    state: "",
                    zip: "",
                    lat: "",
                    lon: "",
                },
            }));
        }
    };
    // Handle terms checkbox
    const handleTermsChange = (e) => {
        const isChecked = e.target.checked;
        setTermsAccepted(isChecked);
        // Clear terms error
        if (formErrors.terms) {
            setFormErrors((prev) => ({ ...prev, terms: "" }));
        }
        // Update terms acceptance timestamp
        setCompanySetupData((prev) => ({
            ...prev,
            terms: isChecked ? new Date().toISOString() : null,
        }));
    };
    return (_jsxs("form", { className: "mt-[60px] w-full", onSubmit: formSubmitHandler, children: [formErrors.general && (_jsx("div", { className: "mb-4 p-3 bg-red-50 border border-red-200 rounded-md", children: _jsx("p", { className: "text-sm text-red-600", children: formErrors.general }) })), _jsxs("div", { className: "w-full grid grid-cols-1 md:grid-cols-2 gap-2.5", children: [_jsx(FormInput, { label: "First name", required: true, type: "text", placeholder: "Enter your first name", value: companySetupData.firstname, onChange: (e) => {
                            setCompanySetupData((prev) => ({
                                ...prev,
                                firstname: e.target.value,
                            }));
                            if (formErrors.firstname) {
                                setFormErrors((prev) => ({ ...prev, firstname: "" }));
                            }
                        }, capitalize: true, error: formErrors.firstname }), _jsx(FormInput, { label: "Last name", required: true, type: "text", placeholder: "Enter your last name", value: companySetupData.lastname, onChange: (e) => {
                            setCompanySetupData((prev) => ({
                                ...prev,
                                lastname: e.target.value,
                            }));
                            if (formErrors.lastname) {
                                setFormErrors((prev) => ({ ...prev, lastname: "" }));
                            }
                        }, capitalize: true, error: formErrors.lastname }), _jsx(FormInput, { label: "Store name", required: true, type: "text", placeholder: "Enter your store name", value: companySetupData.store_name, onChange: (e) => {
                            setCompanySetupData((prev) => ({
                                ...prev,
                                store_name: e.target.value,
                            }));
                            if (formErrors.store_name) {
                                setFormErrors((prev) => ({ ...prev, store_name: "" }));
                            }
                        }, capitalize: true, error: formErrors.store_name }), _jsx(FormSelect, { label: "Store type", required: true, type: "text", value: companySetupData.store_type, onChange: (e) => {
                            setCompanySetupData((prev) => ({
                                ...prev,
                                store_type: e.target.value,
                            }));
                            if (formErrors.store_type) {
                                setFormErrors((prev) => ({ ...prev, store_type: "" }));
                            }
                        }, options: storeTypeOptions, error: formErrors.store_type }), _jsx(FormInput, { label: "Phone", required: true, type: "tel", placeholder: "Enter the store phone number", value: companySetupData.phone, onChange: (e) => {
                            setCompanySetupData((prev) => ({
                                ...prev,
                                phone: e.target.value,
                            }));
                            if (formErrors.phone) {
                                setFormErrors((prev) => ({ ...prev, phone: "" }));
                            }
                        }, isPhone: true, error: formErrors.phone }), _jsx("div", { className: `w-full ${!companySetupData.address?.lat ? "col-span-2" : ""}`, children: _jsx(AddressAutocomplete, { label: "Address", required: true, id: "address", placeholder: "Enter your full address", value: companySetupData.address, onChange: handleAddressChange, error: formErrors.address }) }), companySetupData.address?.lat && (_jsxs("div", { className: "w-full flex items-center justify-between gap-2.5", children: [_jsx(FormInput, { label: "Apt", type: "text", placeholder: "Enter your Apartment No", value: companySetupData.address.street_address_2, onChange: (e) => setCompanySetupData((prev) => ({
                                    ...prev,
                                    address: {
                                        ...prev.address,
                                        street_address_2: e.target.value,
                                    },
                                })) }), _jsx(FormInput, { label: "Access Code", type: "text", placeholder: "Enter your Access Code", value: companySetupData.access_code, onChange: (e) => setCompanySetupData((prev) => ({
                                    ...prev,
                                    access_code: e.target.value,
                                })) })] })), _jsx("div", { className: "md:col-span-2", children: _jsx(FormTextarea, { label: "Courier pickup note", placeholder: "Enter default pickup note for courier", value: companySetupData.note, onChange: (e) => setCompanySetupData((prev) => ({
                                ...prev,
                                note: e.target.value,
                            })), maxLength: 100, showCharacterCount: true, rows: 1, resizable: true }) }), _jsxs("div", { className: "md:col-span-2 py-2.5", children: [_jsxs("p", { className: "text-themeDarkGray text-xs", children: ["Number of deliveries per week", " ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("div", { className: "grid grid-cols-4 gap-2.5 mt-2.5", children: deliveryData.map(({ id, quantity, title }) => (_jsx("div", { className: `w-full p-2.5 shadow-btnShadow border rounded-lg text-center cursor-pointer transition-all duration-200 transform ${quantity === deliveryPerWeek
                                        ? "border-themeOrange bg-themeOrange text-white font-bold scale-105"
                                        : "border-secondaryBtnBorder bg-white text-themeDarkGray font-normal hover:border-themeOrange hover:bg-orange-50 hover:scale-102"}`, onClick: () => {
                                        setdeliveryPerWeek(quantity);
                                        if (formErrors.deliveryPerWeek) {
                                            setFormErrors((prev) => ({ ...prev, deliveryPerWeek: "" }));
                                        }
                                    }, children: _jsx("p", { className: "text-sm", children: title }) }, id))) }), formErrors.deliveryPerWeek && (_jsx("p", { className: "text-xs text-themeRed mt-1", children: formErrors.deliveryPerWeek }))] }), _jsxs("div", { className: "md:col-span-2 py-2.5", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("input", { type: "checkbox", id: "terms", checked: termsAccepted, onChange: handleTermsChange, className: "mt-1 h-4 w-4 text-themeOrange focus:ring-themeOrange border-gray-300 rounded" }), _jsxs("label", { htmlFor: "terms", className: "text-sm text-themeDarkGray", children: ["I agree to the", " ", _jsx(Link, { to: "https://dbx.delivery/terms", target: "_blank", className: "text-themeOrange hover:underline", children: "Terms and Conditions" }), " ", "and", " ", _jsx(Link, { to: "https://dbx.delivery/privacy-policy", target: "_blank", className: "text-themeOrange hover:underline", children: "Privacy Policy" }), _jsx("span", { className: "text-themeRed ml-1", children: "*" })] })] }), formErrors.terms && (_jsx("p", { className: "text-xs text-themeRed mt-1", children: formErrors.terms }))] })] }), _jsxs("div", { className: "flex items-center justify-between gap-5 mt-[50px]", children: [_jsx(Link, { to: "/auth/signup", state: companySetupData, children: _jsx("p", { className: "text-xs text-themeDarkGray hover:text-themeOrange transition-colors", children: "\u2190 Back" }) }), _jsx("button", { type: "submit", disabled: isSubmitting || !isFormValid(), className: `text-sm md:text-base font-bold px-themePadding py-2.5 rounded-md transition-all duration-300 ${isFormValid() && !isSubmitting
                            ? "text-white bg-themeGreen hover:bg-green-600 transform hover:scale-105"
                            : "text-gray-400 bg-gray-300 cursor-not-allowed"}`, children: isSubmitting ? "Creating Account..." : "Create Account" })] })] }));
};
export default SetupForm;
