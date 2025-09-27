import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import HomeContext from "../components/home/HomeContext";
import PrimaryNav from "../components/primary/PrimaryNav";
import Sidebar from "../components/primary/Sidebar";
const Home = () => {
    return (_jsxs("div", { className: "w-full relative", children: [_jsx(PrimaryNav, { title: "Dashboard" }), _jsxs("div", { className: "bg-themeOrange relative z-40", children: [_jsx(Sidebar, {}), _jsx(HomeContext, {})] })] }));
};
export default Home;
