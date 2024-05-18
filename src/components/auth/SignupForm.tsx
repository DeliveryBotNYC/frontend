import { useState } from "react";
import FormBtn from "../reusable/FormBtn";

import EyeIcon from "../../assets/eye-icon.svg";

import { FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const SignupForm = () => {
  const [passwordError, setPasswordError] = useState("");
  // navigate to other page hook
  const navigate = useNavigate();
  const { state } = useLocation();

  // State to change the password type to text
  const [changePasswordType, setChangePasswordType] = useState<boolean>(false);
  const [changeConfirmPasswordType, setChangeConfirmPasswordType] =
    useState<boolean>(false);

  // signup form value's
  const [signupFormValues, setSignupFormValues] = useState({
    email: state?.email ? state?.email : "",
    password: state?.password ? state?.password : "",
    comfirm_password: state?.comfirm_password ? state?.comfirm_password : "",
  });

  // submit handler
  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    //check comfirm password
    if (signupFormValues.password != signupFormValues.comfirm_password) {
      setPasswordError("Passwords don't match");
    }
    //check user excists
    else {
      // Navigate to other page with state
      navigate("/auth/signup/setup", { state: signupFormValues });
    }
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
          value={signupFormValues.comfirm_password}
          onChange={(e) =>
            setSignupFormValues({
              ...signupFormValues,
              comfirm_password: e.target.value,
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
      {passwordError ? (
        <p className="text-xs text-themeRed">{passwordError}</p>
      ) : (
        ""
      )}
      {/* Submit Button */}
      <FormBtn hasBg={true} title="Continue" />
    </form>
  );
};

export default SignupForm;
