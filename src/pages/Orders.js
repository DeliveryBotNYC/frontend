import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import OrdersContent from "../components/orders/OrdersContent";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
const Orders = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Orders" }), _jsxs("div", { className: "bg-themeOrange", children: [_jsx(Sidebar, {}), _jsx(OrdersContent, {})] })] }));
};
export default Orders;
