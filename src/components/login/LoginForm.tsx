import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";

import EyeIcon from "../../assets/eye-icon.svg";

import { FaEyeSlash } from "react-icons/fa";
import FormBtn from "../reusable/FormBtn";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";

const LoginForm = () => {
  const { state } = useLocation();
  console.log(state);
  const navigate = useNavigate();
  // State to change the password type to text
  const [changePasswordType, setChangePasswordType] = useState<boolean>(false);

  // login form value's
  const [loginFormValues, setLoginFormValues] = useState({
    email: "",
    password: "",
  });

  // submit handler
  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTodoMutation.mutate(loginFormValues);
  };

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post("https://api.dbx.delivery/retail/login", loginFormValues),
    onSuccess: (data) => {
      navigate("/");
      //accessTokenRef.current = data.token;
    },
  });
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
          value={loginFormValues.email}
          onChange={(e) =>
            setLoginFormValues({
              ...loginFormValues,
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
          value={loginFormValues.password}
          onChange={(e) =>
            setLoginFormValues({
              ...loginFormValues,
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
      {addTodoMutation.isError &&
      addTodoMutation.error.response.data.message ? (
        <p className="text-xs text-themeRed">
          {addTodoMutation.error.response.data.message}
        </p>
      ) : (
        ""
      )}
      {state ? <p className="text-xs text-themeRed">{state} </p> : ""}

      {/* Submit Button */}
      <FormBtn hasBg={true} title="Login" />

      {/* Forgot password */}
      <Link to={"/reset-password"}>
        <p className="mt-5 text-xs text-themeGray text-center">
          Forgot password
        </p>
      </Link>
    </form>
  );
};

export default LoginForm;
