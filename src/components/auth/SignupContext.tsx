import SignupForm from "./SignupForm";
import { Link } from "react-router-dom";
// Image
import SignupLogos from "../../assets/signup-logos.svg";

const SignupContext = () => {
  return (
    <div
      className="w-[95%] max-w-[1240px] mx-auto flex items-center py-20"
      style={{
        minHeight: "calc(100vh - 75px)",
      }}
    >
      {/* Form Box */}
      <div className="bg-white w-full rounded-[15px] overflow-hidden flex sm:flex-row flex-col">
        {/* Left Side */}
        <div className="sm:w-[45%] md:w-[40%] bg-themeLightGray py-10">
          {/* Image */}
          <div className="px-8 sm:px-10">
            <img src={SignupLogos} alt="right_image" className="w-full" />
          </div>

          {/* Links */}
          <div className="mt-12">
            <p className="text-sm text-center text-secondaryBtnBorder">
              Join our customers
            </p>

            {/* login */}
            <div className="flex items-center justify-center gap-5 mt-[50px]">
              {/* text */}
              <p className="text-xs text-secondaryBtnBorder">
                Already have an account?
              </p>

              {/* Button */}
              <Link to="/auth/login">
                <button className="px-10 py-2.5 text-xs text-secondaryBtnBorder border border-secondaryBtnBorder rounded-lg">
                  Login-in
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="sm:w-[55%] md:w-[60%] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]">
          {/* Heading */}
          <h2 className="text-xl md:text-2xl text-black heading font-bold text-center">
            Sign Up
          </h2>

          {/* Form */}
          <SignupForm />
        </div>
      </div>
    </div>
  );
};

export default SignupContext;
