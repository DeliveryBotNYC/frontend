import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import TableContent from "./TableContent";
import TablePagination from "./TablePagination";
import TableToolbar from "./TableToolbar";
const TableContainer = ({ searchEnabled = false, downloadEnabled = false, refreshEnabled = false, uploadEnabled = false, dateRangeFilterEnabled = false, statusFilterEnabled = false, platformFilterEnabled = false, storeFilterEnabled = false, platformOptions = [{ value: "portal", label: "Portal" }], // Default platform options
onSearch, onDownloadAll, onDownloadCurrent, onRefresh, onUpload, onFilterChange, headers, data, isLoading, error, rowComponent: RowComponent, totalPages = 1, initialSortBy = { header: "last_updated", order: "desc" }, initialRowsPerPage = 50, initialPage = 1, onPageChange, onRowsPerPageChange, onSortChange, }) => {
    const [currentActivePage, setCurrentActivePage] = useState(initialPage);
    const [totalValuesPerPage, setTotalValuesPerPage] = useState(initialRowsPerPage);
    const [sortBy, setSortBy] = useState(initialSortBy);
    // Handle sorting
    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
        if (onSortChange) {
            onSortChange(newSortBy);
        }
    };
    // Handle page change
    const handlePageChange = (page) => {
        setCurrentActivePage(page);
        if (onPageChange) {
            onPageChange(page);
        }
    };
    // Handle rows per page change
    const handleRowsPerPageChange = (value) => {
        setTotalValuesPerPage(value);
        setCurrentActivePage(1);
        if (onRowsPerPageChange) {
            onRowsPerPageChange(value);
        }
    };
    // Check if any toolbar features are enabled
    const isToolbarVisible = searchEnabled ||
        downloadEnabled ||
        refreshEnabled ||
        uploadEnabled ||
        dateRangeFilterEnabled ||
        statusFilterEnabled ||
        platformFilterEnabled ||
        storeFilterEnabled;
    return (_jsxs("div", { className: "flex flex-col h-full bg-white rounded-tr-2xl rounded-tl-2xl", children: [isToolbarVisible && (_jsx(TableToolbar, { searchEnabled: searchEnabled, downloadEnabled: downloadEnabled, refreshEnabled: refreshEnabled, uploadEnabled: uploadEnabled, dateRangeFilterEnabled: dateRangeFilterEnabled, statusFilterEnabled: statusFilterEnabled, platformFilterEnabled: platformFilterEnabled, storeFilterEnabled: storeFilterEnabled, platformOptions: platformOptions, onSearch: onSearch, onDownloadAll: onDownloadAll, onDownloadCurrent: onDownloadCurrent, onRefresh: onRefresh, onUpload: onUpload, onFilterChange: onFilterChange })), _jsx("div", { className: "flex-1 flex flex-col overflow-hidden", children: _jsx(TableContent, { headers: headers, data: data, isLoading: isLoading, error: error, sortBy: sortBy, onSortChange: handleSortChange, RowComponent: RowComponent }) }), _jsx(TablePagination, { currentActivePage: currentActivePage, setCurrentActivePage: handlePageChange, totalValuesPerPage: totalValuesPerPage, setTotalValuesPerPage: handleRowsPerPageChange, totalPages: totalPages })] }));
};
export default TableContainer;
