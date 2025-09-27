import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import SearchIcon from "../../assets/search.svg";
import DownloadIcon from "../../assets/download-icon.svg";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
const InvoicesSearchbox = () => {
    // Importing the context
    const contextValue = useContext(ThemeContext);
    return (_jsxs("div", { className: "flex items-center justify-between gap-2.5 px-7 py-5 bg-white rounded-tr-2xl rounded-tl-2xl", children: [_jsx("div", { className: "w-full", children: _jsxs("div", { className: "w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2", children: [_jsx("img", { src: SearchIcon, alt: "searchbox" }), _jsx("input", { type: "text", className: "w-full bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack", placeholder: "Search...", value: contextValue?.invoiceSearch || "", onChange: (e) => contextValue?.setInvoiceSearch &&
                                contextValue.setInvoiceSearch(e.target.value) })] }) }), _jsx("div", { className: "w-full flex items-center justify-end", children: _jsx("img", { src: DownloadIcon, alt: "download-icon", className: "cursor-pointer" }) })] }));
};
export default InvoicesSearchbox;
