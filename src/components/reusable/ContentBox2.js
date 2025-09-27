import { jsx as _jsx } from "react/jsx-runtime";
const ContentBox2 = ({ children, isHomePage, }) => {
    return (_jsx("div", { className: `w-full pl-20 pr-[42px] pt-[65px] 3xl:h-screen ${isHomePage === true ? "h-[120vh]" : "h-screen"}`, children: children }));
};
export default ContentBox2;
