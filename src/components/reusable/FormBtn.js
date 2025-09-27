import { jsx as _jsx } from "react/jsx-runtime";
const FormBtn = ({ title, hasBg, onClickFunc, }) => {
    return (_jsx("button", { onClick: onClickFunc, type: "submit", className: `w-full ${hasBg === true
            ? "bg-themeGreen border-themeGreenbg-themeGreen text-white mt-20 sm:mt-[110px]"
            : "bg-transparent border-secondaryBtnBorder text-themeDarkGray"} border outline-none text-sm md:text-base py-2.5 rounded-lg shadow-btnShadow hover:scale-95 duration-200`, children: title }));
};
export default FormBtn;
