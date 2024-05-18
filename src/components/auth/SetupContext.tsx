import { Link, useLocation } from "react-router-dom";
import SecondaryNav from "../primary/SecondaryNav";
import CompanySetupForm from "./SetupForm";
import BackgroundMap from "../reusable/mapBackground";

const SetupContext = () => {
  return (
    <div
      className="w-[95%] max-w-[1240px] mx-auto flex items-center py-20"
      style={{
        minHeight: "calc(100vh - 75px)",
      }}
    >
      <div className="bg-white w-full rounded-[15px] p-8 sm:p-10 md:p-14 lg:p-20 xl:p-[100px]">
        {/* Header */}
        <div className="w-full flex items-center justify-between md:flex-row flex-col gap-4">
          {/* Left side */}
          <div>
            <h2 className="text-2xl text-black font-bold heading">
              Your Company
            </h2>

            <p className="text-xs text-themeDarkGray mt-2">
              Tell us a bit more about your company.
            </p>
          </div>

          {/* Right Side */}
          <div className="flex items-center justify-center gap-2 md:gap-5">
            {/* text */}
            <p className="text-xs text-themeDarkGray">
              Already have an account?
            </p>

            {/* Button */}
            <Link to="/auth/login">
              <button className="px-5 md:px-10 py-2 md:py-2.5 text-xs text-themeDarkGray border border-secondaryBtnBorder rounded-lg">
                Login-in
              </button>
            </Link>
          </div>
        </div>

        {/* Form */}
        <CompanySetupForm />
      </div>
    </div>
  );
};

export default SetupContext;
