// OrdersContent.jsx - Using Universal Toolbar
import { useContext, useState } from "react";
import ContentBox2 from "../reusable/ContentBox2";
import TableToolbar from "../reusable/table/TableToolbar";
import TableContent from "../reusable/table/TableContent";
import TablePagination from "../reusable/table/TablePagination";
import OrderSingleRow from "./OrderSingleRow";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { exportToCSV } from "../reusable/exportUtils";
import ImageUploader from "../popups/ImageUploader";
import BlackOverlay from "../popups/BlackOverlay";
import { FaCalendarAlt, FaTruck, FaDesktop, FaStore } from "react-icons/fa";

const OrdersContent = () => {
  const contextValue = useContext(ThemeContext);
  const [currentActivePage, setCurrentActivePage] = useState(1);
  const [totalValuesPerPage, setTotalValuesPerPage] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState({
    header: "last_updated",
    order: "desc" as "asc" | "desc",
  });

  // Add state for image uploader popup
  const { setShowImageUploaderPopup, showImageUploaderPopup } =
    useContext(ThemeContext) || {};

  // State to track if a refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filters, setFilters] = useState<any>({});

  const config = useConfig();

  // Define filter configurations for orders
  const orderFilterConfigs = [
    {
      key: "dateRange",
      label: "Range",
      icon: <FaCalendarAlt className="text-gray-500" size={14} />,
      type: "date-range" as const,
    },
    {
      key: "storeType",
      label: "Store",
      icon: <FaStore className="text-gray-500" size={14} />,
      type: "single-select" as const,
      options: [
        { value: "all", label: "All Location" },
        { value: "pickup", label: "Pickup Location" },
        { value: "delivery", label: "Delivery Location" },
        { value: "neither", label: "Neither Location" },
      ],
    },
    {
      key: "platforms",
      label: "Platform",
      icon: <FaDesktop className="text-gray-500" size={14} />,
      type: "dropdown" as const,
      options: [
        { value: "portal", label: "Portal" },
        { value: "api", label: "API" },
        { value: "mobile", label: "Mobile App" },
        { value: "web", label: "Web App" },
        { value: "pos", label: "POS System" },
      ],
    },
    {
      key: "statuses",
      label: "Status",
      icon: <FaTruck className="text-gray-500" size={14} />,
      type: "dropdown" as const,
      options: [
        {
          value: "processing",
          label: "Processing",
          description:
            "The order has been placed but is not yet assigned with a driver.",
        },
        {
          value: "assigned",
          label: "Assigned",
          description: "The order has been assigned to a driver.",
        },
        {
          value: "arrived_at_pickup",
          label: "Arrived At Pickup",
          description: "The driver has arrived at the order pick-up location.",
        },
        {
          value: "picked_up",
          label: "Picked Up",
          description: "The order has been picked-up by the driver.",
        },
        {
          value: "arrived_at_delivery",
          label: "Arrived At Delivery",
          description: "The driver has arrived at the order delivery location.",
        },
        {
          value: "undeliverable",
          label: "Undeliverable",
          description:
            "The driver was unable to complete the delivery and the order will be returned to the pick-up location.",
        },
        {
          value: "delivered",
          label: "Delivered",
          description:
            "The order has been successfully delivered by the driver.",
        },
        {
          value: "returned",
          label: "Returned",
          description:
            "The order has been returned to the pick-up location by the driver after a failed delivery attempt.",
        },
        {
          value: "canceled",
          label: "Canceled",
          description: "The order was canceled prior to pick-up.",
        },
      ],
    },
  ];

  // Define table headers
  const headers = [
    { title: "Order", value: "order_id" },
    { title: "Status", value: "status" },
    { title: "Pickup", value: "pickup" },
    { title: "Delivery", value: "name" },
    { title: "Time-frame", value: "start_time" },
    { title: "Last updated", value: "last_updated" },
  ];

  // Handle filter changes from the universal toolbar
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentActivePage(1);
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
      filters,
    ],
    queryFn: () => {
      const params: any = {
        search: contextValue?.searchInput || "",
        page: currentActivePage,
        limit: totalValuesPerPage,
        sortBy: sortBy.header,
        sortOrder: sortBy.order,
      };

      // Add date range filters if set
      if (filters.dateRange?.startDate) {
        params.startDate = filters.dateRange.startDate.toISOString();
      }
      if (filters.dateRange?.endDate) {
        params.endDate = filters.dateRange.endDate.toISOString();
      }

      // Add status filters if set
      if (filters.statuses && filters.statuses.length > 0) {
        params.statuses = filters.statuses.join(",");
      }

      // Add store type filter if not "all"
      if (filters.storeType && filters.storeType !== "all") {
        params.storeType = filters.storeType;
      }

      // Add platform filters if set
      if (filters.platforms && filters.platforms.length > 0) {
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
  const handleSearch = (value: string) => {
    if (contextValue?.setSearchInput) {
      contextValue.setSearchInput(value);
    }
    setCurrentActivePage(1);
  };

  // Handle download current view
  const handleDownloadCurrent = () => {
    if (data && data.length > 0) {
      exportToCSV(
        data,
        headers,
        `orders_current_page_${currentActivePage}.csv`
      );
    }
  };

  // Handle download all data
  const handleDownloadAll = async () => {
    try {
      const params: any = {
        limit: 10000,
        sortBy: sortBy.header,
        sortOrder: sortBy.order,
      };

      // Add same filters as the current view
      if (filters.dateRange?.startDate) {
        params.startDate = filters.dateRange.startDate.toISOString();
      }
      if (filters.dateRange?.endDate) {
        params.endDate = filters.dateRange.endDate.toISOString();
      }
      if (filters.statuses && filters.statuses.length > 0) {
        params.statuses = filters.statuses.join(",");
      }
      if (filters.storeType && filters.storeType !== "all") {
        params.storeType = filters.storeType;
      }
      if (filters.platforms && filters.platforms.length > 0) {
        params.platforms = filters.platforms.join(",");
      }

      const response = await axios.get(url + "/order/all", {
        ...config,
        params,
      });

      const allData = response.data.data.orders;
      if (allData && allData.length > 0) {
        exportToCSV(allData, headers, "orders_all.csv");
      }
    } catch (error) {
      console.error("Error downloading all data:", error);
      if (data && data.length > 0) {
        exportToCSV(data, headers, "orders_partial.csv");
      }
    }
  };

  // Handle refresh
  const handleRefresh = (onRefreshComplete: () => void) => {
    setIsRefreshing(true);

    refetch()
      .then(() => {
        console.log("Data refreshed successfully");
      })
      .catch((error) => {
        console.error("Error refreshing data:", error);
      })
      .finally(() => {
        setIsRefreshing(false);
        onRefreshComplete();
      });
  };

  // Handle image uploader popup
  const handleOpenImageUploader = () => setShowImageUploaderPopup?.(true);
  const handleClosePopup = () => setShowImageUploaderPopup?.(false);

  // Handle upload
  const handleUpload = () => {
    handleOpenImageUploader();
  };

  // Handle sort change
  const handleSortChange = (newSortBy: {
    header: string;
    order: "asc" | "desc";
  }) => {
    setSortBy(newSortBy);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentActivePage(page);
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: number) => {
    setTotalValuesPerPage(value);
    setCurrentActivePage(1);
  };

  return (
    <>
      <ContentBox2>
        <div className="flex flex-col h-full bg-white rounded-tr-2xl rounded-tl-2xl">
          {/* Universal Toolbar with Orders-specific Configuration */}
          <TableToolbar
            searchEnabled={true}
            downloadEnabled={true}
            refreshEnabled={true}
            uploadEnabled={true}
            filterConfigs={orderFilterConfigs}
            onSearch={handleSearch}
            onDownloadCurrent={handleDownloadCurrent}
            onDownloadAll={handleDownloadAll}
            onRefresh={handleRefresh}
            onUpload={handleUpload}
            onFilterChange={handleFilterChange}
          />

          {/* Scrollable content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <TableContent
              headers={headers}
              data={data || []}
              isLoading={isLoading || isRefreshing}
              error={error}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              RowComponent={OrderSingleRow}
            />
          </div>

          {/* Pagination */}
          <TablePagination
            currentActivePage={currentActivePage}
            setCurrentActivePage={handlePageChange}
            totalValuesPerPage={totalValuesPerPage}
            setTotalValuesPerPage={handleRowsPerPageChange}
            totalPages={totalPages}
          />
        </div>
      </ContentBox2>

      {/* Image Uploader with Overlay */}
      {showImageUploaderPopup && (
        <>
          <BlackOverlay closeFunc={handleClosePopup} />
          <ImageUploader />
        </>
      )}
    </>
  );
};

export default OrdersContent;
