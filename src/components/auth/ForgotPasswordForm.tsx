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

  // Store the success message from API
  const [successMessage, setSuccessMessage] = useState("");

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post(url + "/retail/forgot-password", {
        email: loginFormValues,
      }),
    onSuccess: (data) => {
      setEmailSubmited(true);
      // Extract message from API response
      setSuccessMessage(
        data.data?.data?.message ||
          "Instructions to reset your password send to your email."
      );
    },
    onError: (error) => {
      // Handle error case - you might want to show error message
      console.error("Forgot password error:", error);
      // Optionally set an error state here
    },
  });

  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addTodoMutation.mutate(loginFormValues);
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
            disabled={emailSubmited} // Disable input after submission
          />
        </div>

        {/* If Form Submited - Show API response message */}
        {emailSubmited === true ? (
          <p className="text-xs text-themeDarkGreen mt-5">{successMessage}</p>
        ) : null}

        {/* Loading state */}
        {addTodoMutation.isPending && !emailSubmited ? (
          <p className="text-xs text-themeGray mt-5">
            Sending reset instructions...
          </p>
        ) : null}

        {/* Error state */}
        {addTodoMutation.isError && !emailSubmited ? (
          <p className="text-xs text-themeRed mt-5">
            Something went wrong. Please try again.
          </p>
        ) : null}

        {/* Submit Button */}
        {emailSubmited === true ? (
          <Link to={"/auth/login"}>
            <FormBtn hasBg={true} title={"Back to login"} />
          </Link>
        ) : (
          <FormBtn
            hasBg={true}
            title={"Reset Password"}
            disabled={addTodoMutation.isPending}
          />
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
