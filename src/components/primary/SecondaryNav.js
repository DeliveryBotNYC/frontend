import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Logo from "../../assets/logo.svg";
const SecondaryNav = () => {
    return (_jsx("div", { className: "w-full h-[75px] bg-themeOrange px-4 flex items-center", children: _jsxs("div", { className: "flex items-center gap-10 select-none", children: [_jsx("img", { src: Logo, alt: "site_logo" }), _jsx("p", { className: "text-white text-xl lg:text-2xl font-bold heading", children: "Portal" })] }) }));
};
export default SecondaryNav;
