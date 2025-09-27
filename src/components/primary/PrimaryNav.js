import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import Logo from "../../assets/logo.svg";
import DashedImage from "../../assets/nav-dashed.svg";
import PlusIcon from "../../assets/plus-icon.svg";
import { Link } from "react-router-dom";
const PrimaryNav = ({ title }) => {
    // Context
    const contextValue = useContext(ThemeContext);
    return (_jsxs("nav", { className: "w-full bg-themeOrange h-16 flex items-center justify-between gap-4 px-4 fixed top-0 left-0 z-[99]", children: [_jsxs("div", { className: "flex items-center gap-10", children: [_jsxs("div", { className: "flex items-end gap-3", children: [_jsx("div", { className: `${contextValue?.expandWidth === true ? "w-[108px]" : "w-0"} duration-300`, children: _jsx("img", { src: DashedImage, alt: "dashed_image" }) }), _jsx("img", { src: Logo, alt: "site_logo" })] }), _jsx("p", { className: "text-white text-xl lg:text-2xl font-bold heading", children: title || "Dashboard" })] }), _jsx("div", { className: "pr-7", children: _jsx(Link, { to: "/create-order", children: _jsxs("button", { className: "bg-newOrderBtnBg py-1.5 px-themePadding rounded-[30px] text-white flex items-center gap-2", children: [_jsx("img", { src: PlusIcon, alt: "plus-icon" }), "New order"] }) }) })] }));
};
export default PrimaryNav;
