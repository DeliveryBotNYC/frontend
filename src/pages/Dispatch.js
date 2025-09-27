import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import DispatchContent from "../components/dispatch/DispatchContent";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
const Dispatch = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Orders" }), _jsxs("div", { className: "bg-themeOrange relative z-40", children: [_jsx(Sidebar, {}), _jsx(DispatchContent, {})] })] }));
};
export default Dispatch;
