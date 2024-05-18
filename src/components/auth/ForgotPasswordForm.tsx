import { Link } from "react-router-dom";
import { useState } from "react";
import FormBtn from "../reusable/FormBtn";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";

import { url } from "../../hooks/useConfig";

const ForgotPasswordForm = () => {
  // login form value's
  const [loginFormValues, setLoginFormValues] = useState("");

  // If the form submited then show the instruction text
  const [emailSubmited, setEmailSubmited] = useState(false);

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post(url + "/retail/forgot_password", {
        email: loginFormValues,
      }),
    onSuccess: (data) => {
      setEmailSubmited(true);
    },
  });

  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTodoMutation.mutate(loginFormValues);
    setEmailSubmited(true);
  };

  return (
    <div className="sm:w-[55%] md:w-[60%] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]">
      {/* Heading */}
      <h2 className="text-xl md:text-2xl text-black heading font-bold text-center">
        Reset your password
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
            value={loginFormValues}
            onChange={(e) => setLoginFormValues(e.target.value)}
          />
        </div>

        {/* If Form Submited */}
        {emailSubmited === true ? (
          <p className="text-xs text-themeDarkGreen mt-5">
            Instructions to reset your password send to your email.
          </p>
        ) : null}

        {/* Submit Button */}
        {emailSubmited === true ? (
          <Link to={"/auth/login"}>
            <FormBtn hasBg={true} title={"Back to login"} />
          </Link>
        ) : (
          <FormBtn hasBg={true} title={"Reset Password"} />
        )}

        {/* Forgot password */}
        <Link to={"/auth/login"}>
          <p className="mt-5 text-xs text-themeGray text-center">Login</p>
        </Link>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
