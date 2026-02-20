import Logo from "../../assets/logo.png";
import PlusIcon from "../../assets/plus-icon.svg";
import { Link } from "react-router-dom";

const PrimaryNav = ({ title }: { title: string }) => {
  return (
    <nav className="w-full bg-themeOrange h-16 flex items-center justify-between gap-2 fixed top-0 left-0 z-[99] px-3 sm:px-0">
      {/* Left */}
      <div className="flex items-center gap-3 sm:gap-10 min-w-0">
        {/* Logo */}
        <div className="flex items-end gap-3 sm:ml-3 shrink-0">
          <img
            src={Logo}
            width={"45px"}
            className="sm:w-[55px]"
            alt="site_logo"
          />
        </div>

        {/* Title — truncate on small screens */}
        <p className="text-white text-base sm:text-xl lg:text-2xl font-bold heading truncate">
          {title || "Dashboard"}
        </p>
      </div>

      {/* Right */}
      <div className="pr-0 sm:pr-7 shrink-0">
        <Link to={"/create-order"}>
          <button className="bg-newOrderBtnBg py-1.5 px-3 sm:px-themePadding rounded-[30px] text-white flex items-center gap-1 sm:gap-2 text-sm sm:text-base whitespace-nowrap">
            <img src={PlusIcon} alt="plus-icon" className="w-4 h-4" />
            {/* Icon only on very small phones, full label on sm+ */}
            <span className="hidden sm:inline">New order</span>
          </button>
        </Link>
      </div>
    </nav>
  );
};

export default PrimaryNav;
