import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// SingleUser.jsx (User edit page)
import Sidebar from "../components/primary/Sidebar";
import PrimaryNav from "../components/primary/PrimaryNav";
import SingleUserContent from "../components/users/SingleUserContent";
const SingleUser = () => {
    return (_jsxs("div", { className: "w-full", children: [_jsx(PrimaryNav, { title: "Edit User" }), _jsxs("div", { className: "bg-themeOrange relative z-40", children: [_jsx(Sidebar, {}), _jsx(SingleUserContent, {})] })] }));
};
export default SingleUser;
