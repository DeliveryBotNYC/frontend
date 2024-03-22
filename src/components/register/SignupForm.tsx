import { useState } from "react";
import FormBtn from "../reusable/FormBtn";

import EyeIcon from "../../assets/eye-icon.svg";

import { FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SignupForm = () => {
  // navigate to other page hook
  const navigate = useNavigate();

  // State to change the password type to text
  const [changePasswordType, setChangePasswordType] = useState<boolean>(false);
  const [changeConfirmPasswordType, setChangeConfirmPasswordType] =
    useState<boolean>(false);

  // signup form value's
  const [signupFormValues, setSignupFormValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  // submit handler
  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Navigate to other page with state
    navigate("/company-setup", { state: signupFormValues });
  };

  return (
    <form className="w-full mt-[60px]" onSubmit={formSubmitHandler}>
      {/* email field */}
      <div className="w-full">
        <label htmlFor="emailField" className="text-themeDarkGray text-xs">
          Email <span className="text-themeRed">*</span>
        </label>

        {/* input */}
        <input
          required
          id="emailField"
          type="email"
          placeholder="Enter your email here"
          className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
          value={signupFormValues.email}
          onChange={(e) =>
            setSignupFormValues({
              ...signupFormValues,
              email: e.target.value,
            })
          }
        />
      </div>

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
          value={signupFormValues.password}
          onChange={(e) =>
            setSignupFormValues({
              ...signupFormValues,
              password: e.target.value,
            })
          }
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
              onClick={() => setChangePasswordType(false)}
            />
          )}
        </div>
      </div>

      {/* password field */}
      <div className="w-full mt-5 relative">
        <label htmlFor="passwordField" className="text-themeDarkGray text-xs">
          Confirm password <span className="text-themeRed">*</span>
        </label>

        {/* input */}
        <input
          required
          id="passwordField"
          type={changeConfirmPasswordType === true ? "text" : "password"}
          placeholder="Re-type your password"
          className="w-full text-xs sm:text-sm pb-[2px] text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
          value={signupFormValues.confirmPassword}
          onChange={(e) =>
            setSignupFormValues({
              ...signupFormValues,
              confirmPassword: e.target.value,
            })
          }
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
              onClick={() => setChangeConfirmPasswordType(false)}
            />
          )}
        </div>
      </div>

      {/* Submit Button */}
      <FormBtn hasBg={true} title="Continue" />
    </form>
  );
};

export default SignupForm;
