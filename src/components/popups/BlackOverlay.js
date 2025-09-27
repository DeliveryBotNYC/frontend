import { jsx as _jsx } from "react/jsx-runtime";
const BlackOverlay = ({ closeFunc }) => {
    return (_jsx("div", { onClick: closeFunc, className: "w-full h-full fixed inset-0 bg-black bg-opacity-30 z-[999]" }));
};
export default BlackOverlay;
