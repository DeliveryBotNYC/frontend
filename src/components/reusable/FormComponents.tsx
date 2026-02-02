import { forwardRef, useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { enforceFormat, formatToPhone } from "./functions";
import { url, useConfig } from "../../hooks/useConfig";
import { FaEyeSlash } from "react-icons/fa";
import EyeIcon from "../../assets/eye-icon.svg";

// Type definitions
interface SelectOption {
  value: string;
  label: string;
}

interface RadioOption {
  value: string | boolean;
  label: string;
}

interface CheckboxOption {
  id: string;
  label: string;
}

interface AddressData {
  street_address_1: string;
  formatted: string;
  [key: string]: string | number | boolean | null | undefined;
}

interface FormPasswordProps {
  label?: string;
  id?: string;
  name?: string; // Add this
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  className?: string;
  error?: string;
  placeholder?: string;
  showToggle?: boolean;
  passwordValue?: string;
  showMatchIndicator?: boolean;
  [key: string]:
    | string
    | number
    | boolean
    | undefined
    | ((e: React.ChangeEvent<HTMLInputElement>) => void)
    | ((e: React.KeyboardEvent<HTMLInputElement>) => void);
}

interface FormInputProps {
  label?: string;
  id?: string;
  name?: string; // Add this
  type?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  className?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  capitalize?: boolean;
  isPhone?: boolean;
  step?: string;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  title?: string;
  readOnly?: boolean;
  tabIndex?: number;
}

interface FormSelectProps {
  label?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: SelectOption[];
  className?: string;
  error?: string;
  placeholder?: string;
  multiple?: boolean;
  size?: number;
  form?: string;
  name?: string;
}

interface RadioGroupProps {
  label?: string;
  name?: string;
  options: RadioOption[];
  value?: string | boolean;
  onChange: (value: string | boolean) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

interface CheckboxGroupProps {
  label?: string;
  options: CheckboxOption[];
  values: Record<string, boolean>;
  onChange: (id: string, checked: boolean) => void;
  error?: string;
  required?: boolean;
  className?: string;
}

interface FormCheckboxProps {
  label?: string;
  value?: string;
  id?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface FormTextareaProps {
  label?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  error?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  resizable?: boolean;
  cols?: number;
  wrap?: "hard" | "soft" | "off";
  spellCheck?: boolean;
  readOnly?: boolean;
  form?: string;
  name?: string;
}

interface AddressDropdownProps {
  options: AddressData[];
  onSelect: (address: AddressData) => void;
  show: boolean;
  onClose: () => void;
}

interface AddressAutocompleteProps {
  label?: string;
  id?: string;
  name?: string; // Add this
  required?: boolean;
  value?: string | AddressData;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
  placeholder?: string;
  debounceDelay?: number;
  minSearchLength?: number;
  disabled?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  readOnly?: boolean;
  size?: number;
  spellCheck?: boolean;
  tabIndex?: number;
  title?: string;
}

// Enhanced reusable password component with visibility toggle and error display
export const FormPassword = forwardRef<HTMLInputElement, FormPasswordProps>(
  (
    {
      label = "Password",
      id = "password",
      name, // Add this
      required = false,
      disabled = false,
      value,
      onChange,
      onKeyUp,
      onKeyDown,
      autoComplete = "current-password",
      className = "",
      error,
      placeholder = "Enter your password here",
      showToggle = true,
      passwordValue,
      showMatchIndicator = false,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    // Password matching logic (only when passwordValue is provided)
    const isConfirmationField = passwordValue !== undefined;
    const passwordsMatch =
      isConfirmationField && passwordValue && value && passwordValue === value;
    const showMismatchError =
      isConfirmationField && value && passwordValue && !passwordsMatch;

    // Determine border color based on validation state
    const getBorderColor = () => {
      if (error || showMismatchError)
        return "border-b-red-500 focus:border-b-red-500";
      if (showMatchIndicator && passwordsMatch && value)
        return "border-b-green-500 focus:border-b-green-500";
      return "border-b-themeLightGray focus:border-b-themeOrange";
    };

    return (
      <div className="w-full">
        <label htmlFor={id} className="text-themeDarkGray text-xs">
          {label} {required && <span className="text-themeRed">*</span>}
        </label>

        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            id={id}
            name={name} // Add this
            value={value || ""}
            onChange={onChange}
            onKeyUp={onKeyUp}
            onKeyDown={onKeyDown}
            disabled={disabled}
            autoComplete={autoComplete}
            placeholder={placeholder}
            className={`w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b outline-none ${getBorderColor()} ${
              disabled ? "cursor-not-allowed" : ""
            } ${showToggle ? "pr-8" : ""} ${className}`}
            {...props}
          />

          {/* Eye Icon Toggle */}
          {showToggle && (
            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              {!showPassword ? (
                <img
                  src={EyeIcon}
                  alt="Show password"
                  className="cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              ) : (
                <FaEyeSlash
                  color="#676767"
                  size={17}
                  className="cursor-pointer"
                  onClick={togglePasswordVisibility}
                />
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Password mismatch error (only for confirmation fields) */}
        {showMismatchError && !error && showMatchIndicator && (
          <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>Passwords do not match</span>
          </div>
        )}

        {/* Password match success (only for confirmation fields) */}
        {passwordsMatch && value && showMatchIndicator && (
          <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>Passwords match</span>
          </div>
        )}
      </div>
    );
  }
);
FormPassword.displayName = "FormPassword";

// Enhanced reusable input component with error display and prefix support
// Enhanced FormInput component with suffix support
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      id,
      name,
      type = "text",
      required = false,
      disabled = false,
      value,
      onChange,
      onKeyUp,
      onKeyDown,
      onBlur,
      autoComplete,
      className = "",
      error,
      prefix = "",
      suffix = "", // Add suffix prop
      placeholder,
      capitalize = false,
      isPhone = false,
      ...props
    },
    ref
  ) => {
    // Handle phone formatting
    const handlePhoneKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isPhone) {
        formatToPhone(e);
      }
      if (onKeyUp) {
        onKeyUp(e);
      }
    };

    const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isPhone) {
        enforceFormat(e);
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    // Handle capitalization - now capitalizes every word
    const handleCapitalizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    return (
      <div className="w-full">
        <label className="text-themeDarkGray text-xs">
          {label} {required && <span className="text-themeRed">*</span>}
        </label>
        {prefix || suffix ? (
          // Input with prefix/suffix
          <div
            className={`flex items-end border-b outline-none ${
              error
                ? "border-b-red-500 focus-within:border-b-red-500"
                : "border-b-contentBg focus-within:border-b-themeOrange"
            }`}
          >
            {prefix && (
              <span className="text-sm text-themeLightBlack pr-1 pb-1">
                {prefix}
              </span>
            )}
            <input
              ref={ref}
              type={type}
              id={id}
              name={name}
              value={value || ""}
              onChange={capitalize ? handleCapitalizeChange : onChange}
              onKeyUp={isPhone ? handlePhoneKeyUp : onKeyUp}
              onKeyDown={isPhone ? handlePhoneKeyDown : onKeyDown}
              onBlur={onBlur}
              disabled={disabled}
              autoComplete={isPhone ? "new-password" : autoComplete}
              placeholder={placeholder}
              className={`flex-1 text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 outline-none bg-transparent ${
                disabled ? "cursor-not-allowed" : ""
              } ${className}`}
              {...props}
            />
            {suffix && (
              <span className="text-sm text-themeLightBlack pl-1 pb-1">
                {suffix}
              </span>
            )}
          </div>
        ) : (
          // Regular input without prefix/suffix
          <input
            ref={ref}
            type={type}
            id={id}
            name={name}
            value={value || ""}
            onChange={capitalize ? handleCapitalizeChange : onChange}
            onKeyUp={isPhone ? handlePhoneKeyUp : onKeyUp}
            onKeyDown={isPhone ? handlePhoneKeyDown : onKeyDown}
            onBlur={onBlur}
            disabled={disabled}
            autoComplete={isPhone ? "new-password" : autoComplete}
            placeholder={placeholder}
            className={`w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b outline-none ${
              error
                ? "border-b-red-500 focus:border-b-red-500"
                : "border-b-contentBg focus:border-b-themeOrange"
            } ${
              disabled ? "bg-transparent cursor-not-allowed" : ""
            } ${className}`}
            {...props}
          />
        )}
        {error && (
          <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";

// Enhanced reusable select component with error display and ref support
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  (
    {
      label,
      id,
      required = false,
      disabled = false,
      value,
      onChange,
      options = [],
      className = "",
      error,
      placeholder = "Select an option",
      ...props
    },
    ref
  ) => (
    <div className="w-full">
      <label className="text-themeDarkGray text-xs">
        {label} {required && <span className="text-themeRed">*</span>}
      </label>
      <select
        ref={ref}
        id={id}
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className={`w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack border-b outline-none
    appearance-none pl-0 ${
      error
        ? "border-b-red-500 focus:border-b-red-500"
        : "border-b-contentBg focus:border-b-themeOrange"
    } ${disabled ? "bg-transparent cursor-not-allowed" : ""} ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
);

FormSelect.displayName = "FormSelect";

// Enhanced radio group component
export const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      label,
      name,
      options,
      value,
      onChange,
      error,
      required = false,
      className = "",
    },
    ref
  ) => (
    <div className={`w-full ${className}`} ref={ref}>
      <label className="text-themeDarkGray text-xs">
        {label} {required && <span className="text-themeRed">*</span>}
      </label>
      <div className="flex items-center gap-2.5 mt-1.5">
        {options.map((option) => (
          <label
            key={String(option.value)}
            htmlFor={`${name}-${option.value}`}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className={`
                peer appearance-none w-4 h-4 rounded-full
                shadow-[0_0_0_0.5px_theme(colors.themeLightBlack)]
                checked:bg-themeOrange
                transition-all
                shrink-0
            `}
            />
            <span className="text-sm text-themeLightBlack leading-none pt-1">
              {option.label}
            </span>
          </label>
        ))}
      </div>

      {error && (
        <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
);

RadioGroup.displayName = "RadioGroup";

// Enhanced checkbox group component
export const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  (
    {
      label,
      options,
      values,
      onChange,
      error,
      required = false,
      className = "",
    },
    ref
  ) => (
    <div className={`w-full ${className}`} ref={ref}>
      <label className="text-themeDarkGray text-xs">
        {label} {required && <span className="text-themeRed">*</span>}
      </label>
      <div className="flex items-center gap-4 mt-1">
        {options.map((option) => (
          <div key={option.id} className="flex items-center gap-1.5">
            <input
              id={option.id}
              type="checkbox"
              checked={values[option.id] || false}
              onChange={(e) => onChange(option.id, e.target.checked)}
              className={`
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
            `}
            />
            <label
              htmlFor={option.id}
              className="text-sm leading-none pt-[3px] cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && (
        <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
);

CheckboxGroup.displayName = "CheckboxGroup";

// Single checkbox component with ref support
export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  (
    {
      label,
      value,
      id,
      checked = false,
      onChange,
      error,
      required = false,
      disabled = false,
      className = "",
    },
    ref
  ) => (
    <div className={`w-full ${className}`}>
      <label className="text-themeDarkGray text-xs">
        {label} {required && <span className="text-themeRed">*</span>}
      </label>
      <div className="flex items-center gap-1.5 mt-1">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="accent-themeOrange scale-125"
        />
        <label
          htmlFor={id}
          className={`text-themeLightBlack text-sm leading-none pt-[3px] cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {value} {required && <span className="text-themeRed">*</span>}
        </label>
      </div>
      {error && (
        <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
);

FormCheckbox.displayName = "FormCheckbox";

// Enhanced Textarea component with optional character count and resize control
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  (
    {
      label,
      id,
      required = false,
      disabled = false,
      value,
      onChange,
      className = "",
      error,
      placeholder,
      rows = 1,
      maxLength,
      showCharacterCount = false,
      resizable = false,
      ...props
    },
    ref
  ) => {
    const currentLength = value?.length || 0;
    const shouldShowCount = showCharacterCount && maxLength;

    // Determine resize class based on resizable prop
    const resizeClass = resizable ? "resize-y" : "resize-none";

    return (
      <div className="w-full">
        {shouldShowCount ? (
          <div className="flex justify-between items-center">
            <label className="text-themeDarkGray text-xs">
              {label} {required && <span className="text-themeRed">*</span>}
            </label>
            <div className="text-xs text-themeDarkGray">
              {currentLength}/{maxLength}
            </div>
          </div>
        ) : (
          <label className="text-themeDarkGray text-xs">
            {label} {required && <span className="text-themeRed">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={`w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b outline-none ${resizeClass} ${
            error
              ? "border-b-red-500 focus:border-b-red-500"
              : "border-b-contentBg focus:border-b-themeOrange"
          } ${
            disabled ? "bg-transparent cursor-not-allowed" : ""
          } ${className}`}
          {...props}
        />
        {error && (
          <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

FormTextarea.displayName = "FormTextarea";

// Debounce utility function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Address Dropdown Component
const AddressDropdown: React.FC<AddressDropdownProps> = ({
  options,
  onSelect,
  show,
}) => {
  if (!show || !options.length) return null;

  return (
    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto mt-1">
      {options.map((item, index) => (
        <button
          key={index}
          type="button"
          className="w-full px-4 py-3 text-left hover:bg-gray-100 text-sm transition-colors duration-150 border-b border-gray-50 last:border-b-0"
          onClick={() => onSelect(item)}
        >
          <div className="font-medium text-themeLightBlack">
            {item.street_address_1}
          </div>
          <div className="text-xs text-themeDarkGray mt-1">
            {item.formatted}
          </div>
        </button>
      ))}
    </div>
  );
};

// Address Autocomplete Component with ref support
// Address Autocomplete Component with ref support
export const AddressAutocomplete = forwardRef<
  HTMLInputElement,
  AddressAutocompleteProps
>(
  (
    {
      label = "Address",
      id = "address",
      name,
      required = false,
      value,
      onChange,
      error,
      className = "",
      placeholder = "",
      debounceDelay = 300,
      minSearchLength = 2,
      ...props
    },
    ref
  ) => {
    const config = useConfig();
    const [autoFillDropdown, setAutoFillDropdown] = useState<AddressData[]>([]);
    const [showAddressDropdown, setShowAddressDropdown] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Initialize input value when value prop changes
    useEffect(() => {
      if (value && typeof value === "object" && "street_address_1" in value) {
        setInputValue(value.street_address_1);
      } else if (typeof value === "string") {
        setInputValue(value);
      } else {
        setInputValue("");
      }
    }, [value]);

    // Address autocomplete mutation
    const checkAddressExist = useMutation({
      mutationFn: (address: string) =>
        axios.get(
          url + "/address/autocomplete?address=" + encodeURI(address),
          config
        ),
      onSuccess: (response: { data?: { data?: AddressData[] } }) => {
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
    const debouncedAddressSearch = useCallback(
      debounce((address: string) => {
        if (address.length > minSearchLength) {
          checkAddressExist.mutate(address);
        }
      }, debounceDelay),
      [minSearchLength, debounceDelay]
    );

    // Create a synthetic event that can handle both string and object values
    const createSyntheticEvent = (
      value: string | AddressData
    ): React.ChangeEvent<HTMLInputElement> => {
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
        preventDefault: () => {},
        isDefaultPrevented: () => false,
        stopPropagation: () => {},
        isPropagationStopped: () => false,
        persist: () => {},
        timeStamp: Date.now(),
        type: "change",
      } as React.ChangeEvent<HTMLInputElement>;
    };

    const handleAddressInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const address = e.target.value;
      setInputValue(address);

      // Call the parent onChange with the standard React event
      if (onChange) {
        onChange(e);
      }

      // Trigger search if address is long enough
      if (address.length > minSearchLength) {
        debouncedAddressSearch(address);
      } else {
        setShowAddressDropdown(false);
      }
    };

    const handleAddressSelect = (selectedAddress: AddressData) => {
      // Update the input field to show the street address
      const addressString = selectedAddress.street_address_1;
      setInputValue(addressString);

      // Create a synthetic event with the FULL address object (not just the string)
      const syntheticEvent = createSyntheticEvent(selectedAddress);

      // Call the parent onChange with the synthetic event containing the full address object
      if (onChange) {
        onChange(syntheticEvent);
      }

      // Close the dropdown
      setShowAddressDropdown(false);
    };

    // Click outside to close dropdown
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest(`#${id}-container`)) {
          setShowAddressDropdown(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [id]);

    return (
      <div id={`${id}-container`} className="relative w-full">
        <label className="text-themeDarkGray text-xs block">
          {label} {required && <span className="text-themeRed">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type="search"
            id={id}
            name={name}
            value={inputValue}
            onChange={handleAddressInput}
            placeholder={placeholder}
            autoComplete="new-password"
            className={`w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b outline-none pr-8 ${
              error
                ? "border-b-red-500 focus:border-b-red-500"
                : "border-b-contentBg focus:border-b-themeOrange"
            } ${className}`}
            {...props}
          />
          {checkAddressExist.isPending && (
            <div className="absolute right-2 top-1">
              <div className="animate-spin h-4 w-4 border-2 border-themeOrange border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <AddressDropdown
          options={autoFillDropdown}
          onSelect={handleAddressSelect}
          show={showAddressDropdown}
          onClose={() => setShowAddressDropdown(false)}
        />
      </div>
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";
