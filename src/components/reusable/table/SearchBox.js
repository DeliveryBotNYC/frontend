import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import SearchIcon from "../../../assets/search.svg";
const SearchBox = ({ onSearch, initialValue = "" }) => {
    const [searchValue, setSearchValue] = useState(initialValue);
    const [isFocused, setIsFocused] = useState(false);
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchValue(value);
        if (onSearch) {
            onSearch(value);
        }
    };
    return (_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { className: "border-b border-gray-300 hover:!border-gray-500 flex items-center gap-2 pb-1", children: [_jsx("img", { src: SearchIcon, width: 18, alt: "searchbox" }), _jsx("input", { type: "text", className: `bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack text-sm transition-all duration-300 ease-in-out ${isFocused ? "w-44" : "w-24"}`, placeholder: "Search...", value: searchValue, onChange: handleSearchChange, onFocus: () => setIsFocused(true), onBlur: () => setIsFocused(false) })] }) }));
};
export default SearchBox;
