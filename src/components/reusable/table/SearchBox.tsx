import { useState } from "react";
import SearchIcon from "../../../assets/search.svg";

interface SearchBoxProps {
  onSearch?: (value: string) => void;
  initialValue?: string;
}

const SearchBox = ({ onSearch, initialValue = "" }: SearchBoxProps) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1">
        <img src={SearchIcon} width={16} alt="searchbox" className="shrink-0" />
        <input
          type="text"
          className={`bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-xs sm:text-sm transition-all duration-300 ease-in-out ${
            // Narrower base + focus widths on mobile
            isFocused ? "w-28 sm:w-44" : "w-16 sm:w-24"
          }`}
          placeholder="Search..."
          value={searchValue}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </div>
    </div>
  );
};

export default SearchBox;
