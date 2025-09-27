import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { enforceFormat, formatToPhone } from "./functions";
import { url, useConfig } from "../../hooks/useConfig";
import { FaEyeSlash } from "react-icons/fa";
import EyeIcon from "../../assets/eye-icon.svg";
// Enhanced reusable password component with visibility toggle and error display
export const FormPassword = forwardRef(({ label = "Password", id = "password", name, // Add this
required = false, disabled = false, value, onChange, onKeyUp, onKeyDown, autoComplete = "current-password", className = "", error, placeholder = "Enter your password here", showToggle = true, passwordValue, showMatchIndicator = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    // Password matching logic (only when passwordValue is provided)
    const isConfirmationField = passwordValue !== undefined;
    const passwordsMatch = isConfirmationField && passwordValue && value && passwordValue === value;
    const showMismatchError = isConfirmationField && value && passwordValue && !passwordsMatch;
    // Determine border color based on validation state
    const getBorderColor = () => {
        if (error || showMismatchError)
            return "border-b-red-500 focus:border-b-red-500";
        if (showMatchIndicator && passwordsMatch && value)
            return "border-b-green-500 focus:border-b-green-500";
        return "border-b-themeLightGray focus:border-b-themeOrange";
    };
    return (_jsxs("div", { className: "w-full", children: [_jsxs("label", { htmlFor: id, className: "text-themeDarkGray text-xs", children: [label, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { ref: ref, type: showPassword ? "text" : "password", id: id, name: name, value: value || "", onChange: onChange, onKeyUp: onKeyUp, onKeyDown: onKeyDown, disabled: disabled, autoComplete: autoComplete, placeholder: placeholder, className: `w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b outline-none ${getBorderColor()} ${disabled ? "cursor-not-allowed" : ""} ${showToggle ? "pr-8" : ""} ${className}`, ...props }), showToggle && (_jsx("div", { className: "absolute right-0 top-1/2 -translate-y-1/2", children: !showPassword ? (_jsx("img", { src: EyeIcon, alt: "Show password", className: "cursor-pointer", onClick: togglePasswordVisibility })) : (_jsx(FaEyeSlash, { color: "#676767", size: 17, className: "cursor-pointer", onClick: togglePasswordVisibility })) }))] }), error && (_jsxs("div", { className: "mt-1 text-xs text-red-500 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] })), showMismatchError && !error && showMatchIndicator && (_jsxs("div", { className: "mt-1 text-xs text-red-500 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: "Passwords do not match" })] })), passwordsMatch && value && showMatchIndicator && (_jsxs("div", { className: "mt-1 text-xs text-green-600 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z", clipRule: "evenodd" }) }), _jsx("span", { children: "Passwords match" })] }))] }));
});
FormPassword.displayName = "FormPassword";
// Enhanced reusable input component with error display and prefix support
export const FormInput = forwardRef(({ label, id, name, type = "text", required = false, disabled = false, value, onChange, onKeyUp, onKeyDown, onBlur, autoComplete, className = "", error, prefix = "", placeholder, capitalize = false, isPhone = false, ...props }, ref) => {
    // Handle phone formatting
    const handlePhoneKeyUp = (e) => {
        if (isPhone) {
            formatToPhone(e);
        }
        if (onKeyUp) {
            onKeyUp(e);
        }
    };
    const handlePhoneKeyDown = (e) => {
        if (isPhone) {
            enforceFormat(e);
        }
        if (onKeyDown) {
            onKeyDown(e);
        }
    };
    // Handle capitalization - now capitalizes every word
    const handleCapitalizeChange = (e) => {
        if (capitalize && e.target.value) {
            const words = e.target.value.split(" ");
            const capitalizedWords = words.map((word) => {
                if (word.length > 0) {
                    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
                }
                return word;
            });
            e.target.value = capitalizedWords.join(" ");
        }
        if (onChange) {
            onChange(e);
        }
    };
    return (_jsxs("div", { className: "w-full", children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: [label, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] }), prefix ? (
            // Input with prefix
            _jsxs("div", { className: `flex items-end border-b outline-none ${error
                    ? "border-b-red-500 focus-within:border-b-red-500"
                    : "border-b-contentBg focus-within:border-b-themeOrange"}`, children: [_jsx("span", { className: "text-sm text-themeLightBlack pr-1 pb-1", children: prefix }), _jsx("input", { ref: ref, type: type, id: id, name: name, value: value || "", onChange: capitalize ? handleCapitalizeChange : onChange, onKeyUp: isPhone ? handlePhoneKeyUp : onKeyUp, onKeyDown: isPhone ? handlePhoneKeyDown : onKeyDown, onBlur: onBlur, disabled: disabled, autoComplete: isPhone ? "new-password" : autoComplete, placeholder: placeholder, className: `flex-1 text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 outline-none bg-transparent ${disabled ? "cursor-not-allowed" : ""} ${className}`, ...props })] })) : (
            // Regular input without prefix
            _jsx("input", { ref: ref, type: type, id: id, name: name, value: value || "", onChange: capitalize ? handleCapitalizeChange : onChange, onKeyUp: isPhone ? handlePhoneKeyUp : onKeyUp, onKeyDown: isPhone ? handlePhoneKeyDown : onKeyDown, onBlur: onBlur, disabled: disabled, autoComplete: isPhone ? "new-password" : autoComplete, placeholder: placeholder, className: `w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b outline-none ${error
                    ? "border-b-red-500 focus:border-b-red-500"
                    : "border-b-contentBg focus:border-b-themeOrange"} ${disabled ? "bg-transparent cursor-not-allowed" : ""} ${className}`, ...props })), error && (_jsxs("div", { className: "mt-1 text-xs text-red-500 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] }))] }));
});
FormInput.displayName = "FormInput";
// Enhanced reusable select component with error display and ref support
export const FormSelect = forwardRef(({ label, id, required = false, disabled = false, value, onChange, options = [], className = "", error, placeholder = "Select an option", ...props }, ref) => (_jsxs("div", { className: "w-full", children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: [label, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsxs("select", { ref: ref, id: id, value: value || "", onChange: onChange, disabled: disabled, className: `w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack border-b outline-none
    appearance-none pl-0 ${error
                ? "border-b-red-500 focus:border-b-red-500"
                : "border-b-contentBg focus:border-b-themeOrange"} ${disabled ? "bg-transparent cursor-not-allowed" : ""} ${className}`, ...props, children: [placeholder && (_jsx("option", { value: "", disabled: true, children: placeholder })), options.map((option) => (_jsx("option", { value: option.value, children: option.label }, option.value)))] }), error && (_jsxs("div", { className: "mt-1 text-xs text-red-500 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] }))] })));
FormSelect.displayName = "FormSelect";
// Enhanced radio group component
export const RadioGroup = forwardRef(({ label, name, options, value, onChange, error, required = false, className = "", }, ref) => (_jsxs("div", { className: `w-full ${className}`, ref: ref, children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: [label, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("div", { className: "flex items-center gap-2.5 mt-1.5", children: options.map((option) => (_jsxs("label", { htmlFor: `${name}-${option.value}`, className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { id: `${name}-${option.value}`, name: name, type: "radio", checked: value === option.value, onChange: () => onChange(option.value), className: `
                peer appearance-none w-4 h-4 rounded-full
                shadow-[0_0_0_0.5px_theme(colors.themeLightBlack)]
                checked:bg-themeOrange
                transition-all
                shrink-0
            ` }), _jsx("span", { className: "text-sm text-themeLightBlack leading-none pt-1", children: option.label })] }, String(option.value)))) }), error && (_jsxs("div", { className: "mt-1 text-xs text-red-500 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] }))] })));
RadioGroup.displayName = "RadioGroup";
// Enhanced checkbox group component
export const CheckboxGroup = forwardRef(({ label, options, values, onChange, error, required = false, className = "", }, ref) => (_jsxs("div", { className: `w-full ${className}`, ref: ref, children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: [label, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("div", { className: "flex items-center gap-4 mt-1", children: options.map((option) => (_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("input", { id: option.id, type: "checkbox", checked: values[option.id] || false, onChange: (e) => onChange(option.id, e.target.checked), className: `
                appearance-none w-4 h-4 rounded
                shadow-[0_0_0_0.5px_theme(colors.themeLightBlack)]
                checked:bg-themeOrange checked:shadow-[0_0_0_0.5px_theme(colors.themeOrange)]
                transition-all
                shrink-0
                relative
                checked:after:content-['✓']
                checked:after:absolute
                checked:after:inset-0
                checked:after:flex
                checked:after:items-center
                checked:after:justify-center
                checked:after:text-white
                checked:after:text-xs
                checked:after:leading-none
            ` }), _jsx("label", { htmlFor: option.id, className: "text-sm leading-none pt-[3px] cursor-pointer", children: option.label })] }, option.id))) }), error && (_jsxs("div", { className: "mt-1 text-xs text-red-500 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] }))] })));
CheckboxGroup.displayName = "CheckboxGroup";
// Single checkbox component with ref support
export const FormCheckbox = forwardRef(({ label, value, id, checked = false, onChange, error, required = false, disabled = false, className = "", }, ref) => (_jsxs("div", { className: `w-full ${className}`, children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: [label, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsxs("div", { className: "flex items-center gap-1.5 mt-1", children: [_jsx("input", { ref: ref, id: id, type: "checkbox", checked: checked, onChange: onChange, disabled: disabled, className: "accent-themeOrange scale-125" }), _jsxs("label", { htmlFor: id, className: `text-themeLightBlack text-sm leading-none pt-[3px] cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""}`, children: [value, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] })] }), error && (_jsxs("div", { className: "mt-1 text-xs text-red-500 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] }))] })));
FormCheckbox.displayName = "FormCheckbox";
// Enhanced Textarea component with optional character count and resize control
export const FormTextarea = forwardRef(({ label, id, required = false, disabled = false, value, onChange, className = "", error, placeholder, rows = 1, maxLength, showCharacterCount = false, resizable = false, ...props }, ref) => {
    const currentLength = value?.length || 0;
    const shouldShowCount = showCharacterCount && maxLength;
    // Determine resize class based on resizable prop
    const resizeClass = resizable ? "resize-y" : "resize-none";
    return (_jsxs("div", { className: "w-full", children: [shouldShowCount ? (_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: [label, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsxs("div", { className: "text-xs text-themeDarkGray", children: [currentLength, "/", maxLength] })] })) : (_jsxs("label", { className: "text-themeDarkGray text-xs", children: [label, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] })), _jsx("textarea", { ref: ref, id: id, value: value || "", onChange: onChange, disabled: disabled, placeholder: placeholder, rows: rows, maxLength: maxLength, className: `w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b outline-none ${resizeClass} ${error
                    ? "border-b-red-500 focus:border-b-red-500"
                    : "border-b-contentBg focus:border-b-themeOrange"} ${disabled ? "bg-transparent cursor-not-allowed" : ""} ${className}`, ...props }), error && (_jsxs("div", { className: "mt-1 text-xs text-red-500 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] }))] }));
});
FormTextarea.displayName = "FormTextarea";
// Debounce utility function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
// Address Dropdown Component
const AddressDropdown = ({ options, onSelect, show, }) => {
    if (!show || !options.length)
        return null;
    return (_jsx("div", { className: "absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1", children: options.map((item, index) => (_jsxs("button", { type: "button", className: "w-full px-4 py-3 text-left hover:bg-gray-100 text-sm transition-colors duration-150 border-b border-gray-50 last:border-b-0", onClick: () => onSelect(item), children: [_jsx("div", { className: "font-medium text-themeLightBlack", children: item.street_address_1 }), _jsx("div", { className: "text-xs text-themeDarkGray mt-1", children: item.formatted })] }, index))) }));
};
// Address Autocomplete Component with ref support
export const AddressAutocomplete = forwardRef(({ label = "Address", id = "address", name, required = false, value, onChange, error, className = "", placeholder = "", debounceDelay = 300, minSearchLength = 2, ...props }, ref) => {
    const config = useConfig();
    const [autoFillDropdown, setAutoFillDropdown] = useState([]);
    const [showAddressDropdown, setShowAddressDropdown] = useState(false);
    const [inputValue, setInputValue] = useState("");
    // Initialize input value when value prop changes
    useEffect(() => {
        if (value && typeof value === "object" && "street_address_1" in value) {
            setInputValue(value.street_address_1);
        }
        else if (typeof value === "string") {
            setInputValue(value);
        }
        else {
            setInputValue("");
        }
    }, [value]);
    // Address autocomplete mutation
    const checkAddressExist = useMutation({
        mutationFn: (address) => axios.get(url + "/address/autocomplete?address=" + encodeURI(address), config),
        onSuccess: (response) => {
            if (response?.data?.data) {
                setAutoFillDropdown(response.data.data);
                setShowAddressDropdown(true);
            }
        },
        onError: () => {
            setShowAddressDropdown(false);
        },
    });
    // Debounced address search
    const debouncedAddressSearch = useCallback(debounce((address) => {
        if (address.length > minSearchLength) {
            checkAddressExist.mutate(address);
        }
    }, debounceDelay), [minSearchLength, debounceDelay]);
    // Create a synthetic event that matches React.ChangeEvent signature
    const createSyntheticEvent = (value) => {
        return {
            target: {
                id: id || "address",
                value: value,
            },
            currentTarget: {
                id: id || "address",
                value: value,
            },
            nativeEvent: new Event("change"),
            bubbles: true,
            cancelable: true,
            defaultPrevented: false,
            eventPhase: 0,
            isTrusted: true,
            preventDefault: () => { },
            isDefaultPrevented: () => false,
            stopPropagation: () => { },
            isPropagationStopped: () => false,
            persist: () => { },
            timeStamp: Date.now(),
            type: "change",
        };
    };
    const handleAddressInput = (e) => {
        const address = e.target.value;
        setInputValue(address);
        // Call the parent onChange with the standard React event
        if (onChange) {
            onChange(e);
        }
        // Trigger search if address is long enough
        if (address.length > minSearchLength) {
            debouncedAddressSearch(address);
        }
        else {
            setShowAddressDropdown(false);
        }
    };
    const handleAddressSelect = (selectedAddress) => {
        // Update the input field to show the street address
        const addressString = selectedAddress.street_address_1;
        setInputValue(addressString);
        // Create a synthetic event with the selected address string
        const syntheticEvent = createSyntheticEvent(addressString);
        // Call the parent onChange with the synthetic event
        if (onChange) {
            onChange(syntheticEvent);
        }
        // Close the dropdown
        setShowAddressDropdown(false);
    };
    // Click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            const target = event.target;
            if (!target.closest(`#${id}-container`)) {
                setShowAddressDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [id]);
    return (_jsxs("div", { id: `${id}-container`, className: "relative w-full", children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: [label, " ", required && _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx("input", { ref: ref, type: "search", id: id, name: name, value: inputValue, onChange: handleAddressInput, placeholder: placeholder, autoComplete: "new-password", className: `w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b outline-none pr-8 ${error
                            ? "border-b-red-500 focus:border-b-red-500"
                            : "border-b-contentBg focus:border-b-themeOrange"} ${className}`, ...props }), checkAddressExist.isPending && (_jsx("div", { className: "absolute right-2 top-1", children: _jsx("div", { className: "animate-spin h-4 w-4 border-2 border-themeOrange border-t-transparent rounded-full" }) }))] }), error && (_jsxs("div", { className: "mt-1 text-xs text-red-500 flex items-center gap-1", children: [_jsx("svg", { className: "w-3 h-3", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z", clipRule: "evenodd" }) }), _jsx("span", { children: error })] })), _jsx(AddressDropdown, { options: autoFillDropdown, onSelect: handleAddressSelect, show: showAddressDropdown, onClose: () => setShowAddressDropdown(false) })] }));
});
AddressAutocomplete.displayName = "AddressAutocomplete";
