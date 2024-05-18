import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

import useAuth from "../../hooks/useAuth";
import EyeIcon from "../../assets/eye-icon.svg";

import { FaEyeSlash } from "react-icons/fa";
import FormBtn from "../reusable/FormBtn";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { url } from "../../hooks/useConfig";

const LoginForm = () => {
  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  // State to change the password type to text
  const [changePasswordType, setChangePasswordType] = useState<boolean>(false);

  // submit handler
  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTodoMutation.mutate({ email: user, password: pwd });
  };

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post(url + "/retail/login", {
        email: user,
        password: pwd,
      }),
    onSuccess: (data) => {
      const accessToken = data?.data?.token;
      const roles = data?.data?.roles;
      setAuth({ user, pwd, roles, accessToken });
      localStorage.setItem("aT", accessToken);
      localStorage.setItem("roles", JSON.stringify(roles));
      setUser("");
      setPwd("");
      navigate(from, { replace: true });
      //navigate("/");
      //accessTokenRef.current = data.token;
    },
  });
  return (
    <div className="sm:w-[55%] md:w-[60%] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]">
      {/* Heading */}
      <h2 className="text-xl md:text-2xl text-black heading font-bold text-center">
        Sign into your account
      </h2>
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
            value={user}
            onChange={(e) => setUser(e.target.value)}
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
        {addTodoMutation.isError &&
        addTodoMutation?.error?.response?.data?.code == "onboarding" ? (
          <p className="text-xs text-themeGreen">
            {addTodoMutation.error.response.data.message}
          </p>
        ) : addTodoMutation?.error?.response?.data.message ? (
          <p className="text-xs text-themeRed">
            {addTodoMutation.error.response.data.message}
          </p>
        ) : (
          ""
        )}

        {/* Submit Button */}
        <FormBtn hasBg={true} title="Login" />

        {/* Forgot password */}
        <Link to={"/auth/forgot-password"}>
          <p className="mt-5 text-xs text-themeGray text-center">
            Forgot password
          </p>
        </Link>
      </form>
    </div>
  );
};

export default LoginForm;
