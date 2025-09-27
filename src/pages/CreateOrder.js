import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
import CreateOrderContent from "../components/createOrders/CreateOrderContent";
const CreateOrder = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Orders" }), _jsxs("div", { className: "bg-themeOrange", children: [_jsx(Sidebar, {}), _jsx(CreateOrderContent, {})] })] }));
};
export default CreateOrder;
