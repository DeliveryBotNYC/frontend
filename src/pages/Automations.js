import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import AutomationContent from "../components/automations/AutomationContent";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
const Automations = () => {
    return (_jsxs("div", { className: "w-full relative bg-themeOrange", children: [_jsx(PrimaryNav, { title: "Automations" }), _jsxs("div", { children: [_jsx(Sidebar, {}), _jsx(AutomationContent, {})] })] }));
};
export default Automations;
