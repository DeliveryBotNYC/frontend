import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Invoice from "../components/customers/Customers";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
const SingleCustomer = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Customers" }), _jsxs("div", { className: "bg-themeOrange relative z-40", children: [_jsx(Sidebar, {}), _jsx(Invoice, {})] })] }));
};
export default SingleCustomer;
