import { jsx as _jsx } from "react/jsx-runtime";
const ContentBox = ({ children, isHomePage, }) => {
    return (_jsx("div", { className: `w-full pl-20 pr-[42px] pt-[65px] 3xl:h-screen ${isHomePage === true ? "h-[120vh]" : "h-screen"}`, children: _jsx("div", { className: "w-full lg:px-5 2xl:px-8 py-[20px] bg-contentBg rounded-tr-2xl rounded-tl-2xl h-full", children: children }) }));
};
export default ContentBox;
