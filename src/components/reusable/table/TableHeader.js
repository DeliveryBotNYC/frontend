import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
const TableHeader = ({ headers, sortBy, onSortChange }) => {
    const handleSort = (headerValue) => {
        if (sortBy.header === headerValue) {
            onSortChange({
                header: headerValue,
                order: sortBy.order === "asc" ? "desc" : "asc",
            });
        }
        else {
            onSortChange({
                header: headerValue,
                order: "asc",
            });
        }
    };
    return (_jsx("div", { className: "bg-contentBg border-b border-gray-100 z-10", children: _jsx("div", { className: "flex w-full", children: headers.map((header, index) => (_jsx("div", { className: "py-3 flex-1 font-semibold cursor-pointer hover:bg-gray-200 px-themePadding", onClick: () => handleSort(header.value), children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-themeDarkGray font-normal", children: header.title }), _jsx("span", { children: sortBy.header === header.value ? (sortBy.order === "asc" ? (_jsx(FaSortUp, { className: "text-gray-400" })) : (_jsx(FaSortDown, { className: "text-gray-400" }))) : (_jsx(FaSort, { className: "text-gray-400" })) })] }) }, index))) }) }));
};
export default TableHeader;
