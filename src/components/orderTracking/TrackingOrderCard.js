import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import StatusBtn from "../reusable/StatusBtn";
const TrackingOrderCard = ({ item }) => {
    // Getting the pathname from URL bar
    const { pathname } = useLocation();
    const pathSegments = pathname.split("/");
    const orderId = pathSegments[pathSegments.length - 1];
    return (_jsx(Link, { to: `/orders/tracking/${item.order_id}`, children: _jsxs("div", { className: `${orderId === item.order_id ? "bg-contentBg" : "bg-white"} py-1.5 px-themePadding border-b-2 border-b-themeLightGray cursor-pointer`, children: [_jsxs("div", { className: "flex items-center justify-between gap-2.5", children: [_jsx("div", { children: _jsxs("p", { children: [_jsx("span", { className: "text-themeOrange", children: "DBX" }), item.order_id] }) }), _jsx("div", { children: _jsx(StatusBtn, { type: item.status }) })] }), _jsxs("div", { className: "flex items-center justify-between gap-2.5 mt-2.5", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-themeDarkGray", children: item?.pickup?.address.street }), _jsx("p", { className: "text-xs text-themeDarkGray", children: item?.pickup?.name })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-themeDarkGray", children: item?.delivery.address.street }), _jsx("p", { className: "text-xs text-themeDarkGray", children: item?.delivery?.name })] })] })] }) }));
};
export default TrackingOrderCard;
