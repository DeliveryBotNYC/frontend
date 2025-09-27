import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import PickupIconToDo from "../../assets/pickupToDo.svg";
import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import TimeIcon from "../../assets/time.svg";
const LoadingFormSkeleton = () => {
    const skeletonSections = [
        { title: "Pickup", icon: PickupIconToDo },
        { title: "Delivery", icon: DeliveredBwIcon },
        { title: "Time-frame", icon: TimeIcon },
    ];
    return (_jsxs(_Fragment, { children: [skeletonSections.map((section, index) => (_jsx("div", { className: "w-full bg-white rounded-2xl my-5 min-h-[25%]", children: _jsxs("div", { role: "status", className: "max-w-sm animate-pulse py-5 px-2.5 items-center justify-between gap-2.5 h-full", children: [_jsxs("div", { className: "flex items-center gap-2.5 pb-3", children: [_jsx("img", { src: section.icon, alt: `${section.title} icon` }), _jsx("p", { className: "text-2xl text-black font-bold heading", children: section.title })] }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full w-48 mb-4" }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full max-w-[360px] mb-2.5" }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full mb-2.5" }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full max-w-[330px] mb-2.5" }), _jsx("div", { className: "h-2.5 bg-themeDarkGray rounded-full max-w-[300px] mb-2.5" })] }) }, index))), _jsx("span", { className: "sr-only", children: "Loading..." })] }));
};
export default LoadingFormSkeleton;
