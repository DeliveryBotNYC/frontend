import { useState } from "react";
import FormBtn from "../reusable/FormBtn";
import { FormInput } from "../reusable/FormComponents";
import EyeIcon from "../../assets/eye-icon.svg";
import { FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

interface FormErrors {
  email?: string;
  password?: string;
  confirm_password?: string;
  general?: string;
}

const SignupForm = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // State management
  const [changePasswordType, setChangePasswordType] = useState<boolean>(false);
  const [changeConfirmPasswordType, setChangeConfirmPasswordType] =
    useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isValidating, setIsValidating] = useState(false);

  // Form data - Fixed typo in confirm_password
  const [signupFormValues, setSignupFormValues] = useState({
    email: state?.email || "",
    password: state?.password || "",
    confirm_password: state?.confirm_password || "", // Fixed typo
  });

  // Password strength validation
  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email is required";
    }
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  // Form validation
  const validateForm = () => {
    const errors: FormErrors = {};

    // Email validation
    const emailError = validateEmail(signupFormValues.email);
    if (emailError) {
      errors.email = emailError;
    }

    // Password validation
    const passwordError = validatePassword(signupFormValues.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    // Confirm password validation
    if (!signupFormValues.confirm_password) {
      errors.confirm_password = "Please confirm your password";
    } else if (
      signupFormValues.password !== signupFormValues.confirm_password
    ) {
      errors.confirm_password = "Passwords don't match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation helpers
  const clearError = (field: keyof FormErrors) => {
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Submit handler
  const formSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsValidating(true);

    if (!validateForm()) {
      setIsValidating(false);
      return;
    }

    // Simulate email checking (you might want to add this as an API call)
    try {
      // Navigate to setup page with form data
      navigate("/auth/signup/setup", { state: signupFormValues });
    } catch (error) {
      setFormErrors({ general: "Something went wrong. Please try again." });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <form className="w-full mt-[60px]" onSubmit={formSubmitHandler}>
      {/* General Error Message */}
      {formErrors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{formErrors.general}</p>
        </div>
      )}

      {/* Form Content */}
      <div className="w-full grid grid-cols-1 gap-4">
        {/* Email Field */}
        <div className="w-full">
          <FormInput
            label="Email"
            required
            type="email"
            placeholder="Enter your email here"
            value={signupFormValues.email}
            onChange={(e) => {
              setSignupFormValues((prev) => ({
                ...prev,
                email: e.target.value,
              }));
              clearError("email");
            }}
            error={formErrors.email}
          />
        </div>

        {/* Password Field */}
        <div className="w-full relative">
          <label
            htmlFor="passwordField"
            className="text-themeDarkGray text-xs block mb-1"
          >
            Password <span className="text-themeRed">*</span>
          </label>
          <div className="relative">
            <input
              required
              id="passwordField"
              type={changePasswordType ? "text" : "password"}
              placeholder="Enter your password here"
              className={`w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 pr-10 border-b ${
                formErrors.password ? "border-b-red-500" : "border-b-contentBg"
              } focus:border-b-themeOrange outline-none`}
              value={signupFormValues.password}
              onChange={(e) => {
                setSignupFormValues((prev) => ({
                  ...prev,
                  password: e.target.value,
                }));
                clearError("password");
              }}
            />
            {/* Eye Icon */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer">
              {changePasswordType ? (
                <FaEyeSlash
                  color="#676767"
                  size={17}
                  onClick={() => setChangePasswordType(false)}
                />
              ) : (
                <img
                  src={EyeIcon}
                  alt="eye-icon"
                  className="cursor-pointer"
                  onClick={() => setChangePasswordType(true)}
                />
              )}
            </div>
          </div>

          {formErrors.password && (
            <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="w-full relative">
          <label
            htmlFor="confirmPasswordField"
            className="text-themeDarkGray text-xs block mb-1"
          >
            Confirm password <span className="text-themeRed">*</span>
          </label>
          <div className="relative">
            <input
              required
              id="confirmPasswordField"
              type={changeConfirmPasswordType ? "text" : "password"}
              placeholder="Re-type your password"
              className={`w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 pr-10 border-b ${
                formErrors.confirm_password
                  ? "border-b-red-500"
                  : "border-b-contentBg"
              } focus:border-b-themeOrange outline-none`}
              value={signupFormValues.confirm_password}
              onChange={(e) => {
                setSignupFormValues((prev) => ({
                  ...prev,
                  confirm_password: e.target.value, // Fixed typo
                }));
                clearError("confirm_password");
              }}
            />
            {/* Eye Icon */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer">
              {changeConfirmPasswordType ? (
                <FaEyeSlash
                  color="#676767"
                  size={17}
                  onClick={() => setChangeConfirmPasswordType(false)}
                />
              ) : (
                <img
                  src={EyeIcon}
                  alt="eye-icon"
                  className="cursor-pointer"
                  onClick={() => setChangeConfirmPasswordType(true)}
                />
              )}
            </div>
          </div>

          {/* Password Match Indicator */}
          {signupFormValues.confirm_password && signupFormValues.password && (
            <div className="mt-1">
              {signupFormValues.password ===
              signupFormValues.confirm_password ? (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords match
                </p>
              ) : (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Passwords don't match
                </p>
              )}
            </div>
          )}

          {formErrors.confirm_password && (
            <p className="text-xs text-red-500 mt-1">
              {formErrors.confirm_password}
            </p>
          )}
        </div>

        {/* Password Requirements */}
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs font-medium text-gray-700 mb-2">
            Password must contain:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
            {[
              {
                check: signupFormValues.password.length >= 8,
                text: "At least 8 characters",
              },
              {
                check: /[A-Z]/.test(signupFormValues.password),
                text: "One uppercase letter",
              },
              {
                check: /[a-z]/.test(signupFormValues.password),
                text: "One lowercase letter",
              },
              {
                check: /\d/.test(signupFormValues.password),
                text: "One number",
              },
              {
                check: /[!@#$%^&*(),.?":{}|<>]/.test(signupFormValues.password),
                text: "One special character",
              },
            ].map((requirement, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full flex items-center justify-center ${
                    requirement.check ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  {requirement.check && (
                    <svg
                      className="w-2 h-2 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <span
                  className={
                    requirement.check ? "text-green-600" : "text-gray-500"
                  }
                >
                  {requirement.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <FormBtn
          hasBg={true}
          title={isValidating ? "Validating..." : "Continue"}
          disabled={isValidating}
        />
      </div>
    </form>
  );
};

export default SignupForm;
