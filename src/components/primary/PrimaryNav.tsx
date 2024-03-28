import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

import Logo from "../../assets/logo.svg";
import DashedImage from "../../assets/nav-dashed.svg";
import PlusIcon from "../../assets/plus-icon.svg";
import { Link } from "react-router-dom";

const PrimaryNav = ({ title }: { title: string }) => {
  // Context
  const contextValue = useContext(ThemeContext);

  return (
    <nav className="w-full bg-themeOrange h-16 flex items-center justify-between gap-4 px-4 fixed top-0 left-0 z-[99]">
      {/* left */}
      <div className="flex items-center gap-10">
        {/* Image */}
        <div className="flex items-end gap-3">
          {/* Dashed Image */}
          <div
            className={`${
              contextValue?.expandWidth === true ? "w-[108px]" : "w-0"
            } duration-300`}
          >
            <img src={DashedImage} alt="dashed_image" />
          </div>

          {/* Logo */}
          <img src={Logo} alt="site_logo" />
        </div>

        {/* title */}
        <p className="text-white text-xl lg:text-2xl font-bold heading">
          {title || "Dashboard"}
        </p>
      </div>

      {/* Right */}
      <div className="pr-7">
        <Link to={"/create-order"}>
          <button className="bg-newOrderBtnBg py-1.5 px-themePadding rounded-[30px] text-white flex items-center gap-2">
            <img src={PlusIcon} alt="plus-icon" />
            New order
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default PrimaryNav;
