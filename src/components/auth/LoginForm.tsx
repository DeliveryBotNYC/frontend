import { Link, useNavigate, useLocation } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

import useAuth from "../../hooks/useAuth";
import EyeIcon from "../../assets/eye-icon.svg";

import { FaEyeSlash } from "react-icons/fa";
import FormBtn from "../reusable/FormBtn";

import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { url } from "../../hooks/useConfig";

import { FormPassword, FormInput } from "../reusable/FormComponents";

const LoginForm = () => {
  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";
  const admin = location.pathname == "/auth/admin/login" ? true : false;

  // Get success message and email from navigation state
  const successMessage = location.state?.message;
  const prefilledEmail = location.state?.email || "";

  const userRef = useRef();
  const errRef = useRef();

  // Pre-fill email if provided from signup redirect
  const [user, setUser] = useState(prefilledEmail);
  const [pwd, setPwd] = useState("");

  // State to show success message and auto-hide it
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Show success message when component mounts if message exists
  useEffect(() => {
    if (successMessage) {
      setShowSuccessMessage(true);
      // Auto-hide the message after 7 seconds for longer messages
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Focus on password field if email is pre-filled
  useEffect(() => {
    if (prefilledEmail && pwd === "") {
      // Focus on password field since email is already filled
      const passwordField = document.getElementById("passwordField");
      passwordField?.focus();
    }
  }, [prefilledEmail, pwd]);

  // submit handler
  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Clear success message when user tries to login
    setShowSuccessMessage(false);
    addTodoMutation.mutate({ email: user, password: pwd });
  };

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: any) =>
      axios.post(admin ? url + "/admin/login" : url + "/retail/login", {
        email: user,
        password: pwd,
      }),
    onSuccess: (data) => {
      const { token, user_id, email, company, phone, identifier_hash } =
        data?.data?.data;
      const roles = admin ? [2001, 5150] : [2001];

      const userInfo = {
        id: user_id,
        email,
        company,
        phone,
        identifierHash: identifier_hash,
      };

      setAuth({ roles, accessToken: token, user: userInfo });
      localStorage.setItem("aT", token);
      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("user", JSON.stringify(userInfo));

      setUser("");
      setPwd("");
      navigate(from, { replace: true });
    },
    onError: (error: any) => {},
  });

  return (
    <div className="sm:w-[55%] md:w-[60%] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]">
      {/* Heading */}
      <h2 className="text-xl md:text-2xl text-black heading font-bold text-center">
        {admin ? "Sign into your Admin account" : "Sign into your account"}
      </h2>

      <form className="w-full mt-[60px]" onSubmit={formSubmitHandler}>
        {/* Email field */}
        <div className="w-full">
          <FormInput
            label="Email"
            required
            id="emailField"
            type="email"
            placeholder="Enter your email"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
            }}
          />
        </div>

        {/* Password field */}
        <div className="w-full mt-5 relative">
          <FormPassword
            label="Password"
            id="passwordField"
            required
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            placeholder="Enter your password"
          />
        </div>

        {/* Error and Success Messages */}
        {/* Success Message from Signup Redirect */}
        {showSuccessMessage && successMessage && (
          <p className="text-xs text-themeDarkGreen mt-5">{successMessage}</p>
        )}

        {/* API Error Messages */}
        {addTodoMutation.isError &&
        addTodoMutation?.error?.response?.data?.code == "onboarding" ? (
          <div className="mt-5 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-themeGreen">
              {addTodoMutation.error.response.data.message}
            </p>
          </div>
        ) : addTodoMutation?.error?.response?.data?.message ? (
          <p className="text-xs text-themeRed mt-5">
            {addTodoMutation.error.response.data.message}
          </p>
        ) : (
          ""
        )}

        {/* Submit Button */}
        <FormBtn
          hasBg={true}
          title={addTodoMutation.isPending ? "Signing in..." : "Login"}
          disabled={addTodoMutation.isPending}
        />

        {/* Forgot password */}
        <Link to={"/auth/forgot-password"} state={{ email: user }}>
          <p className="mt-5 text-xs text-themeGray text-center hover:text-themeOrange transition-colors">
            Forgot password?
          </p>
        </Link>
      </form>
    </div>
  );
};

export default LoginForm;
