import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import NextIcon from "../../../assets/arrow-next.svg";
const TablePagination = ({ setCurrentActivePage, currentActivePage, totalValuesPerPage, setTotalValuesPerPage, totalPages = 1, }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const rowOptions = [10, 25, 50, 100, 200];
    const handleSetActivePage = (page) => {
        setCurrentActivePage(Math.max(1, Math.min(totalPages, page)));
    };
    const handleRowsPerPageChange = (value) => {
        setTotalValuesPerPage(value);
        setShowDropdown(false);
        setCurrentActivePage(1);
    };
    return (_jsxs("div", { className: "w-full z-10 sticky left-0 bottom-0 bg-white shadow-dropdownShadow py-2.5 px-4 flex items-center justify-between", children: [_jsxs("div", { className: "relative", children: [_jsxs("div", { className: "flex items-center gap-2 cursor-pointer", onClick: () => setShowDropdown(!showDropdown), children: [_jsx("span", { className: "text-sm text-themeDarkGray", children: "Show" }), _jsx("div", { className: "px-2 py-1 bg-contentBg rounded-[5px] min-w-[50px] h-[25px] flex items-center justify-center", children: _jsx("span", { className: "text-sm", children: totalValuesPerPage }) }), _jsx("span", { className: "text-sm text-themeDarkGray", children: "rows" })] }), showDropdown && (_jsx("div", { className: "absolute top-[-130px] left-0 bg-white shadow-dropdownShadow rounded-md z-20", children: rowOptions.map((option) => (_jsx("div", { className: "px-4 py-2 hover:bg-contentBg cursor-pointer", onClick: () => handleRowsPerPageChange(option), children: _jsx("span", { className: "text-sm", children: option }) }, option))) }))] }), _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-8 flex justify-center", children: currentActivePage > 1 ? (_jsx("img", { src: NextIcon, alt: "prev-icon", className: "cursor-pointer transform rotate-180", onClick: () => handleSetActivePage(currentActivePage - 1) })) : (_jsx("span", { className: "w-4" })) }), _jsx("div", { className: "flex items-center gap-2.5", children: totalPages > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { onClick: () => handleSetActivePage(1), className: `w-6 h-6 rounded-[5px] ${currentActivePage === 1 ? "bg-themeOrange" : "bg-transparent"} flex items-center justify-center cursor-pointer`, children: _jsx("p", { className: `text-sm ${currentActivePage === 1 ? "text-white" : "text-black"}`, children: "1" }) }), currentActivePage > 3 && totalPages > 5 && (_jsx("div", { className: "w-6 h-6 flex items-center justify-center", children: _jsx("p", { className: "text-sm", children: "..." }) })), Array.from({ length: totalPages })
                                    .slice(1, -1)
                                    .map((_, idx) => {
                                    const pageNum = idx + 2;
                                    // Only show current page and 1 page before/after
                                    if (pageNum === currentActivePage ||
                                        pageNum === currentActivePage - 1 ||
                                        pageNum === currentActivePage + 1 ||
                                        (pageNum === 2 && currentActivePage <= 3) ||
                                        (pageNum === totalPages - 1 &&
                                            currentActivePage >= totalPages - 2)) {
                                        return (_jsx("div", { onClick: () => handleSetActivePage(pageNum), className: `w-6 h-6 rounded-[5px] ${currentActivePage === pageNum
                                                ? "bg-themeOrange"
                                                : "bg-transparent"} flex items-center justify-center cursor-pointer`, children: _jsx("p", { className: `text-sm ${currentActivePage === pageNum
                                                    ? "text-white"
                                                    : "text-black"}`, children: pageNum }) }, pageNum));
                                    }
                                    return null;
                                })
                                    .filter(Boolean), currentActivePage < totalPages - 2 && totalPages > 5 && (_jsx("div", { className: "w-6 h-6 flex items-center justify-center", children: _jsx("p", { className: "text-sm", children: "..." }) })), totalPages > 1 && (_jsx("div", { onClick: () => handleSetActivePage(totalPages), className: `w-6 h-6 rounded-[5px] ${currentActivePage === totalPages
                                        ? "bg-themeOrange"
                                        : "bg-transparent"} flex items-center justify-center cursor-pointer`, children: _jsx("p", { className: `text-sm ${currentActivePage === totalPages
                                            ? "text-white"
                                            : "text-black"}`, children: totalPages }) }))] })) }), _jsx("div", { className: "w-8 flex justify-center", children: currentActivePage < totalPages ? (_jsx("img", { src: NextIcon, alt: "next-icon", className: "cursor-pointer", onClick: () => handleSetActivePage(currentActivePage + 1) })) : (_jsx("span", { className: "w-4" })) })] })] }));
};
export default TablePagination;
