import SearchIcon from "../../assets/search.svg";
import DownloadIcon from "../../assets/download-icon.svg";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const CustomersSearchbox = () => {
  // Importing the context
  const contextValue = useContext(ThemeContext);

  return (
    <div className="flex items-center justify-between gap-2.5 px-7 py-5 bg-white rounded-tr-2xl rounded-tl-2xl">
      {/* SearchBox */}
      <div className="w-full">
        <div className="w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2">
          <img src={SearchIcon} alt="searchbox" />

          {/* Search Input */}
          <input
            type="text"
            className="w-full bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack"
            placeholder="Search..."
            value={contextValue?.customerSearch || ""}
            onChange={(e) =>
              contextValue?.setCustomerSearch &&
              contextValue.setCustomerSearch(e.target.value)
            }
          />
        </div>
      </div>

      {/* icon */}
      <div className="w-full flex items-center justify-end">
        <img
          src={DownloadIcon}
          alt="download-icon"
          className="cursor-pointer"
        />
      </div>
    </div>
  );
};

export default CustomersSearchbox;
