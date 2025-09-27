import { jsx as _jsx } from "react/jsx-runtime";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
const AutofillSwitch = () => {
    const contextValue = useContext(ThemeContext);
    return (_jsx("div", { onClick: () => contextValue?.setAutofill((prev) => !prev), className: `cursor-pointer relative bg-themeGreen w-11 h-5 block rounded-full`, children: _jsx("span", { className: `w-4 h-4 bg-white absolute rounded-full ${contextValue?.Autofill === true ? "left-[25px]" : "left-[2px]"} top-1/2 -translate-y-1/2 transition-all duration-200`, style: {
                filter: "drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.06)) drop-shadow(0px 1px 3px rgba(16, 24, 40, 0.10))",
            } }) }));
};
export default AutofillSwitch;
