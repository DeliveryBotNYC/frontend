import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
import OrderTrackingContent from "../components/orderTracking/OrderTrackingContent";
const OrderTracking = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Orders" }), _jsxs("div", { className: "bg-themeOrange relative z-40", children: [_jsx(Sidebar, {}), _jsx(OrderTrackingContent, {})] })] }));
};
export default OrderTracking;
