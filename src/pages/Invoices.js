import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Sidebar from "../components/primary/Sidebar";
import PrimaryNav from "../components/primary/PrimaryNav";
import InvoiceContent from "../components/invoices/InvoiceContent";
const Invoices = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Invoices" }), _jsxs("div", { className: "bg-themeOrange relative z-40", children: [_jsx(Sidebar, {}), _jsx(InvoiceContent, {})] })] }));
};
export default Invoices;
