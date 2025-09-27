import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import TableHeader from "./TableHeader";
const TableContent = ({ headers, data, isLoading, error, sortBy, onSortChange, RowComponent, }) => {
    return (_jsxs("div", { className: "flex flex-col h-full", children: [_jsx("div", { className: "sticky top-0 z-10 bg-white shadow-sm", children: _jsx(TableHeader, { headers: headers, sortBy: sortBy, onSortChange: onSortChange }) }), _jsx("div", { className: "overflow-auto flex-1", children: isLoading ? (_jsx("div", { className: "h-full w-full flex items-center justify-center p-4", children: "Loading..." })) : error ? (_jsx("div", { className: "h-full w-full flex items-center justify-center p-4 text-red-500", children: error.response ? error.response.data.reason : error.message })) : data && data.length > 0 ? (data.map((item, index) => (_jsx(RowComponent, { item: item }, item.id || index)))) : (_jsx("div", { className: "h-full w-full flex items-center justify-center p-4 text-gray-500", children: "No data available" })) })] }));
};
export default TableContent;
