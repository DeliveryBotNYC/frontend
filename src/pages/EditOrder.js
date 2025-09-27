import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
import EditOrderContent from "../components/editOrder/EditOrderContent";
const EditOrder = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Orders" }), _jsxs("div", { className: "bg-themeOrange", children: [_jsx(Sidebar, {}), _jsx(EditOrderContent, {})] })] }));
};
export default EditOrder;
