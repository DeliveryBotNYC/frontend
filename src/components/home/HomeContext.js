import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import HomeMap from "./HomeMap";
import OpenOrdersContainer from "./OpenOrdersContainer";
import Overview from "./Overview";
import ContentBox from "../reusable/ContentBox";
const HomeContext = () => {
    return (_jsx(ContentBox, { children: _jsxs("div", { className: "flex flex-col h-full gap-2.5", children: [_jsx(Overview, {}), _jsx(OpenOrdersContainer, {}), _jsx(HomeMap, {})] }) }));
};
export default HomeContext;
