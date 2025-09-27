import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Sidebar from "../components/primary/Sidebar";
import PrimaryNav from "../components/primary/PrimaryNav";
import CustomersContent from "../components/customers/CustomersContent";
const Customers = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Customers" }), _jsxs("div", { className: "bg-themeOrange relative z-40", children: [_jsx(Sidebar, {}), _jsx(CustomersContent, {})] })] }));
};
export default Customers;
