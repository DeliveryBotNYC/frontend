import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
import AccountsMainContent from "../components/accounts/AccountsMainContent";
const Accounts = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Accounts" }), _jsxs("div", { className: "bg-themeOrange relative z-40", children: [_jsx(Sidebar, {}), _jsx(AccountsMainContent, {})] })] }));
};
export default Accounts;
