import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ApiStats = ({ label, value }) => {
    return (_jsxs("div", { className: "w-full mb-4", children: [_jsx("p", { className: "text-xs text-themeDarkGray", children: label }), _jsx("p", { className: "text-lg font-semibold text-black mt-1", children: value })] }));
};
export default ApiStats;
