import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import FormBtn from "../reusable/FormBtn";
import EyeIcon from "../../assets/eye-icon.svg";
import { FaEyeSlash } from "react-icons/fa";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import { url } from "../../hooks/useConfig";

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const { token } = useParams(); // Get token from URL params

  // Form values
  const [pwd, setPwd] = useState("");
  const [cpwd, setCpwd] = useState("");

  const [errmsg, setErrmsg] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string>("");

  // State to change the password type to text
  const [changePasswordType, setChangePasswordType] = useState<boolean>(false);
  const [changeConfirmPasswordType, setChangeConfirmPasswordType] =
    useState<boolean>(false);

  const resetPasswordMutation = useMutation({
    mutationFn: (password: string) =>
      axios.post(
        url + "/retail/reset-password",
        {
          password: password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      ),
    onSuccess: (data) => {
      // Show success message or navigate to login
      navigate("/auth/login", {
        state: {
          message:
            "Password reset successfully! Please login with your new password.",
        },
      });
    },
    onError: (error: any) => {
      // Handle API errors
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setApiError(errorMessage);
    },
  });

  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear previous errors
    setErrmsg(false);
    setApiError("");

    // Check if passwords match
    if (pwd !== cpwd) {
      setErrmsg(true);
      return;
    }

    // Check if token exists
    if (!token) {
      setApiError("Invalid reset link. Please request a new password reset.");
      return;
    }

    // Submit the form
    resetPasswordMutation.mutate(pwd);
  };

  return (
    <div className="sm:w-[55%] md:w-[60%] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]">
      {/* Heading */}
      <h2 className="text-xl md:text-2xl text-black heading font-bold text-center">
        Set your new password
      </h2>
      <form className="w-full mt-[60px]" onSubmit={formSubmitHandler}>
        {/* password field */}
        <div className="w-full mt-5 relative">
          <label htmlFor="passwordField" className="text-themeDarkGray text-xs">
            Password <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="passwordField"
            type={changePasswordType === true ? "text" : "password"}
            placeholder="Enter your password here"
            className="w-full text-xs sm:text-sm pb-[2px] text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            disabled={resetPasswordMutation.isPending}
            minLength={8}
          />

          {/* Eye Icon */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {changePasswordType === false ? (
              <img
                src={EyeIcon}
                alt="eye-icon"
                className="cursor-pointer"
                onClick={() => setChangePasswordType(true)}
              />
            ) : (
              <FaEyeSlash
                color="#676767"
                size={17}
                className="cursor-pointer"
                onClick={() => setChangePasswordType(false)}
              />
            )}
          </div>
        </div>

        {/* confirm password field */}
        <div className="w-full mt-5 relative">
          <label
            htmlFor="confirmPasswordField"
            className="text-themeDarkGray text-xs"
          >
            Confirm password <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="confirmPasswordField"
            type={changeConfirmPasswordType === true ? "text" : "password"}
            placeholder="Re-type your password"
            className="w-full text-xs sm:text-sm pb-[2px] text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={cpwd}
            onChange={(e) => setCpwd(e.target.value)}
            disabled={resetPasswordMutation.isPending}
            minLength={8}
          />

          {/* Eye Icon */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            {changeConfirmPasswordType === false ? (
              <img
                src={EyeIcon}
                alt="eye-icon"
                className="cursor-pointer"
                onClick={() => setChangeConfirmPasswordType(true)}
              />
            ) : (
              <FaEyeSlash
                color="#676767"
                size={17}
                className="cursor-pointer"
                onClick={() => setChangeConfirmPasswordType(false)}
              />
            )}
          </div>
        </div>

        {/* Error Messages */}
        {errmsg && (
          <p className="text-xs text-themeRed mt-5">Passwords don't match.</p>
        )}

        {apiError && <p className="text-xs text-themeRed mt-5">{apiError}</p>}

        {!token && (
          <p className="text-xs text-themeRed mt-5">
            Invalid reset link. Please request a new password reset.
          </p>
        )}

        {/* Loading state */}
        {resetPasswordMutation.isPending && (
          <p className="text-xs text-themeGray mt-5">
            Resetting your password...
          </p>
        )}

        <FormBtn
          hasBg={true}
          title={"Reset Password"}
          disabled={resetPasswordMutation.isPending || !token}
        />

        {/* Back to login */}
        <Link to={"/auth/login"}>
          <p className="mt-5 text-xs text-themeGray text-center">
            Back to Login
          </p>
        </Link>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
