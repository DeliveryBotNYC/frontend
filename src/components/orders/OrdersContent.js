import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useState } from "react";
import ContentBox2 from "../reusable/ContentBox2";
import TableContainer from "../reusable/table/TableContainer";
import OrderSingleRow from "./OrderSingleRow";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { exportToCSV } from "../reusable/exportUtils";
import ImageUploader from "../popups/ImageUploader";
import BlackOverlay from "../popups/BlackOverlay";
// Define platform options - static for now, to be replaced with DB call later
const PLATFORM_OPTIONS = [
    { value: "portal", label: "Portal" },
    { value: "api", label: "API" },
    { value: "mobile", label: "Mobile App" },
    { value: "web", label: "Web App" },
    { value: "pos", label: "POS System" },
];
const OrdersContent = () => {
    const contextValue = useContext(ThemeContext);
    const [currentActivePage, setCurrentActivePage] = useState(1);
    const [totalValuesPerPage, setTotalValuesPerPage] = useState(50);
    const [totalPages, setTotalPages] = useState(1);
    const [sortBy, setSortBy] = useState({
        header: "last_updated",
        order: "desc",
    });
    // Add state for image uploader popup
    const { setShowImageUploaderPopup, showImageUploaderPopup } = useContext(ThemeContext) || {};
    // State to track filters
    const [filters, setFilters] = useState({
        dateRange: {
            startDate: null,
            endDate: null,
        },
        statuses: [],
        storeType: "all",
        platforms: [],
    });
    // State to track if a refresh is in progress
    const [isRefreshing, setIsRefreshing] = useState(false);
    const config = useConfig();
    // Define table headers - matching your OrdersTableHeader structure
    const headers = [
        { title: "Order", value: "order_id" },
        { title: "Status", value: "status" },
        { title: "Pickup", value: "pickup" },
        { title: "Delivery", value: "name" },
        { title: "Time-frame", value: "start_time" },
        { title: "Last updated", value: "last_updated" },
    ];
    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        // Reset to first page when filters change
        setCurrentActivePage(1);
        // No need to call refetch - the queryKey will change, triggering a refetch automatically
    };
    // Fetch orders data
    const { isLoading, data, error, refetch } = useQuery({
        queryKey: [
            "orders",
            currentActivePage,
            totalValuesPerPage,
            sortBy.header,
            sortBy.order,
            contextValue?.searchInput || "",
            filters, // Add filters to queryKey to trigger refetch when filters change
        ],
        queryFn: () => {
            // Build filter params
            const params = {
                search: contextValue?.searchInput || "",
                page: currentActivePage,
                limit: totalValuesPerPage,
                sortBy: sortBy.header,
                sortOrder: sortBy.order,
            };
            // Add date range filters if set
            if (filters.dateRange.startDate) {
                params.startDate = filters.dateRange.startDate.toISOString();
            }
            if (filters.dateRange.endDate) {
                params.endDate = filters.dateRange.endDate.toISOString();
            }
            // Add status filters if set
            if (filters.statuses.length > 0) {
                params.statuses = filters.statuses.join(",");
            }
            // Add store type filter if not "all"
            if (filters.storeType !== "all") {
                params.storeType = filters.storeType;
            }
            // Add platform filters if set
            if (filters.platforms.length > 0) {
                params.platforms = filters.platforms.join(",");
            }
            return axios
                .get(url + "/order/all", {
                ...config,
                params,
            })
                .then((res) => {
                if (res.data.data.pagination) {
                    setTotalPages(res.data.data.pagination.totalPages);
                }
                return res.data.data.orders;
            });
        },
    });
    // Handle search
    const handleSearch = (value) => {
        if (contextValue?.setSearchInput) {
            contextValue.setSearchInput(value);
        }
    };
    // Handle download current view
    const handleDownloadCurrent = () => {
        if (data && data.length > 0) {
            exportToCSV(data, headers, `customers_current_page_${currentActivePage}.csv`);
        }
    };
    // Handle download all data
    const handleDownloadAll = async () => {
        try {
            // Build filter params for downloading all
            const params = {
                limit: 10000,
                sortBy: sortBy.header,
                sortOrder: sortBy.order,
            };
            // Add same filters as the current view
            if (filters.dateRange.startDate) {
                params.startDate = filters.dateRange.startDate.toISOString();
            }
            if (filters.dateRange.endDate) {
                params.endDate = filters.dateRange.endDate.toISOString();
            }
            if (filters.statuses.length > 0) {
                params.statuses = filters.statuses.join(",");
            }
            if (filters.storeType !== "all") {
                params.storeType = filters.storeType;
            }
            if (filters.platforms.length > 0) {
                params.platforms = filters.platforms.join(",");
            }
            // Make a separate API call to get all data without pagination
            const response = await axios.get(url + "/order/all", {
                ...config,
                params,
            });
            const allData = response.data.data.orders;
            if (allData && allData.length > 0) {
                exportToCSV(allData, headers, "orders_all.csv");
            }
        }
        catch (error) {
            console.error("Error downloading all data:", error);
            // Fallback to current data if there's an error
            if (data && data.length > 0) {
                exportToCSV(data, headers, "customers_partial.csv");
            }
        }
    };
    // Handle refresh - updated to use the callback pattern
    const handleRefresh = (onRefreshComplete) => {
        // Set local refreshing state if you need it elsewhere in the component
        setIsRefreshing(true);
        // Use the refetch function from React Query
        refetch()
            .then(() => {
            console.log("Data refreshed successfully");
        })
            .catch((error) => {
            console.error("Error refreshing data:", error);
        })
            .finally(() => {
            // Always reset local refreshing state
            setIsRefreshing(false);
            // Call the callback to notify TableToolbar that refresh is complete
            onRefreshComplete();
        });
    };
    // Handle image uploader popup
    const handleOpenImageUploader = () => setShowImageUploaderPopup(true);
    const handleClosePopup = () => setShowImageUploaderPopup(false);
    // Handle upload - now opens the image uploader popup
    const handleUpload = () => {
        handleOpenImageUploader();
    };
    return (_jsxs(_Fragment, { children: [_jsx(ContentBox2, { children: _jsx(TableContainer, { searchEnabled: true, downloadEnabled: true, refreshEnabled: true, dateRangeFilterEnabled: true, statusFilterEnabled: true, storeFilterEnabled: true, platformFilterEnabled: true, platformOptions: PLATFORM_OPTIONS, uploadEnabled: true, onSearch: handleSearch, onDownloadCurrent: handleDownloadCurrent, onDownloadAll: handleDownloadAll, onRefresh: handleRefresh, onUpload: handleUpload, onFilterChange: handleFilterChange, headers: headers, data: data || [], isLoading: isLoading || isRefreshing, error: error, rowComponent: OrderSingleRow, totalPages: totalPages, initialSortBy: sortBy, initialRowsPerPage: totalValuesPerPage, initialPage: currentActivePage, onPageChange: setCurrentActivePage, onRowsPerPageChange: setTotalValuesPerPage, onSortChange: setSortBy }) }), showImageUploaderPopup && (_jsxs(_Fragment, { children: [_jsx(BlackOverlay, { closeFunc: handleClosePopup }), _jsx(ImageUploader, {})] }))] }));
};
export default OrdersContent;
