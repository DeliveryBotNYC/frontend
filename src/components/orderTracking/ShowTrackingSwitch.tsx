import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const ShowTrackingSwitch = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  return (
    <div
      onClick={() => contextValue?.setActiveSwitch((prev) => !prev)}
      className={`cursor-pointer relative ${
        contextValue?.activeSwitch === true ? "bg-themeGreen" : "bg-themeGray"
      } w-9 h-5 block rounded-full`}
    >
      <span
        className={`w-4 h-4 bg-white absolute rounded-full ${
          contextValue?.activeSwitch === true ? "left-[18px]" : "left-[2px]"
        } top-1/2 -translate-y-1/2 transition-all duration-200`}
        style={{
          filter:
            "drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.06)) drop-shadow(0px 1px 3px rgba(16, 24, 40, 0.10))",
        }}
      ></span>
    </div>
  );
};

export default ShowTrackingSwitch;
