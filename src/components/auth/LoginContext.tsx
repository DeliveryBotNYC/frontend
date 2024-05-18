import { Link, Outlet } from "react-router-dom";
import FormBtn from "../reusable/FormBtn";

// Importing Images
import RightBoxImage from "../../assets/login-right-image.svg";

const LoginContext = () => {
  return (
    <div
      className="w-[95%] max-w-[1240px] mx-auto flex items-center py-20"
      style={{
        minHeight: "calc(100vh - 75px)",
      }}
    >
      {/* Form Box */}
      <div className="bg-white w-full rounded-[15px] overflow-hidden flex sm:flex-row flex-col">
        {/* Form */}
        <Outlet />

        {/* Right Side */}
        <div className="sm:w-[45%] md:w-[40%] bg-themeOrange py-10">
          {/* Upper Part */}
          <div className="px-8 md:px-10">
            <h3 className="text-xl md:text-2xl text-white font-bold heading">
              Simplest way to manage <br className="xl:block hidden" /> your
              deliveries
            </h3>

            <p className="text-xs sm:text-sm lg:text-base text-white mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Middle Image */}
          <div className="pl-8 sm:pl-10 pr-5 mt-5">
            <img src={RightBoxImage} alt="right_image" className="w-full" />
          </div>

          {/* Bottom Part */}
          <div className="mt-[30px] px-8 md:px-10">
            <Link to={"/auth/signup"}>
              <FormBtn title="Sign-up" hasBg={false} />
            </Link>

            <Link to={"/"}>
              <p className="text-white text-xs text-center mt-5">Learn more</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginContext;
