import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import FormBtn from "../reusable/FormBtn";
import EyeIcon from "../../assets/eye-icon.svg";
import { FaEyeSlash } from "react-icons/fa";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import { url } from "../../hooks/useConfig";

import { useConfig } from "../../hooks/UseGetJtoken";

const ForgotPasswordForm = () => {
  const config = useConfig();
  const navigate = useNavigate();
  // login form value's
  const [pwd, setPwd] = useState("");
  const [cpwd, setCpwd] = useState("");

  const [errmsg, setErrmsg] = useState<boolean>(false);
  // State to change the password type to text
  const [changePasswordType, setChangePasswordType] = useState<boolean>(false);
  const [changeConfirmPasswordType, setChangeConfirmPasswordType] =
    useState<boolean>(false);

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.patch(
        url + "/retail/profile",
        {
          password: pwd,
        },
        config
      ),
    onSuccess: (data) => {
      navigate("/login");
    },
  });

  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    pwd != cpwd
      ? setErrmsg(true)
      : (setErrmsg(false), addTodoMutation.mutate(pwd));
  };

  return (
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
          value={cpwd}
          onChange={(e) => setCpwd(e.target.value)}
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

      {/* If Form Submited */}
      {errmsg ? (
        <p className="text-xs text-themeRed mt-5">Passwords don't match.</p>
      ) : null}

      <FormBtn hasBg={true} title={"Reset Password"} />

      {/* Forgot password */}
      <Link to={"/login"}>
        <p className="mt-5 text-xs text-themeGray text-center">Login</p>
      </Link>
    </form>
  );
};

export default ForgotPasswordForm;
