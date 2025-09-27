import { useContext, useState, useMemo } from "react";
import ContentBox2 from "../reusable/ContentBox2";
import TableContainer from "../reusable/table/TableContainer";
import InvoiceSingleRow from "./InvoiceSingleRow";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { exportToCSV } from "../reusable/exportUtils";
import { FaUser, FaCircle, FaCreditCard } from "react-icons/fa";
import { FilterState } from "../reusable/table/TableToolbar";
import useAuth from "../../hooks/useAuth";

const InvoiceContent = () => {
  const contextValue = useContext(ThemeContext);
  const { auth } = useAuth();
  const [currentActivePage, setCurrentActivePage] = useState<number>(1);
  const [totalValuesPerPage, setTotalValuesPerPage] = useState<number>(50);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState({
    header: "date",
    order: "desc" as "asc" | "desc",
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({});

  // State to track if a refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Check if user is admin
  const isAdmin = useMemo(() => {
    return auth?.roles?.includes(5150);
  }, [auth?.roles]);

  const config = useConfig();

  // Fetch invoices data
  const { isLoading, data, error, refetch } = useQuery({
    queryKey: [
      "invoices",
      currentActivePage,
      totalValuesPerPage,
      sortBy.header,
      sortBy.order,
      contextValue?.invoiceSearch || "",
      filters,
    ],
    queryFn: () => {
      // Build filter parameters
      const filterParams: any = {};

      // Handle array filters (dropdowns)
      Object.keys(filters).forEach((key) => {
        const filterValue = filters[key];
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          filterParams[key] = filterValue.join(",");
        } else if (
          filterValue &&
          !Array.isArray(filterValue) &&
          filterValue !== "all"
        ) {
          filterParams[key] = filterValue;
        }
      });

      return axios
        .get(url + "/invoices", {
          ...config,
          params: {
            search: contextValue?.invoiceSearch || "",
            page: currentActivePage,
            limit: totalValuesPerPage,
            sortBy: sortBy.header,
            sortOrder: sortBy.order,
            ...filterParams,
          },
        })
        .then((res) => {
          // Update pagination info
          if (setTotalPages && res.data.data?.pagination) {
            setTotalPages(res.data.data.pagination.totalPages);
          }
          // Return the invoices array from the API structure
          return res.data.data?.invoices || [];
        });
    },
  });

  // Extract unique users from invoice data for filter options
  const userOptions = useMemo(() => {
    if (!isAdmin || !data) return [];

    const uniqueUsers = new Map();
    data.forEach((invoice: any) => {
      if (invoice.user && invoice.user.user_id && invoice.user.name) {
        uniqueUsers.set(invoice.user.user_id, {
          value: invoice.user.user_id.toString(),
          label: invoice.user.name,
        });
      }
    });

    return Array.from(uniqueUsers.values());
  }, [data, isAdmin]);

  // Define filter configurations
  const filterConfigs = [
    // Only include user filter for admin
    ...(isAdmin
      ? [
          {
            key: "user_id",
            label: "User",
            icon: <FaUser className="w-3 h-3 text-gray-500" />,
            type: "dropdown" as const,
            options: userOptions,
            multiple: true,
          },
        ]
      : []),
    {
      key: "status",
      label: "Status",
      icon: <FaCircle className="w-3 h-3 text-gray-500" />,
      type: "dropdown" as const,
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "uncollectible", label: "Uncollectible" },
        { value: "void", label: "Void" },
      ],
      multiple: true,
    },
    {
      key: "payment_method",
      label: "Payment Method",
      icon: <FaCreditCard className="w-3 h-3 text-gray-500" />,
      type: "dropdown" as const,
      options: [
        { value: "card", label: "Card" },
        { value: "ach", label: "ACH" },
        { value: "check", label: "Check" },
      ],
      multiple: true,
    },
  ];

  // Define table headers - add User column after Payment Method for admin
  const headers = [
    { title: "Invoice", value: "invoice_id" },
    { title: "Status", value: "status" },
    { title: "Date", value: "date" },
    { title: "Date Range", value: "date_range" },
    { title: "Amount", value: "amount" },
    { title: "Payment Method", value: "payment_method" },
    // Add User column after Payment Method for admin
    ...(isAdmin ? [{ title: "User", value: "user_name" }] : []),
    { title: "Download", value: "download" },
  ];

  // Handle search
  const handleSearch = (value: string) => {
    if (contextValue?.setInvoiceSearch) {
      contextValue.setInvoiceSearch(value);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setCurrentActivePage(1);
  };

  // Transform data for CSV export - handle currency conversion
  const transformDataForExport = (invoiceData: any[]) => {
    return invoiceData.map((invoice) => ({
      ...invoice,
      user_name: invoice?.user?.name || "N/A", // Add user name for export
      amount: invoice.amount / 100, // Convert cents to dollars
      date_range:
        invoice.start_date && invoice.end_date
          ? `${new Date(invoice.start_date).toLocaleDateString()} - ${new Date(
              invoice.end_date
            ).toLocaleDateString()}`
          : "N/A",
      orders_count: invoice.orders ? invoice.orders.length : 0,
    }));
  };

  // Handle download current view
  const handleDownloadCurrent = () => {
    if (data && data.length > 0) {
      const transformedData = transformDataForExport(data);
      exportToCSV(
        transformedData,
        headers,
        `invoices_current_page_${currentActivePage}.csv`
      );
    }
  };

  // Handle download all data
  const handleDownloadAll = async () => {
    try {
      // Build filter parameters for all data request
      const filterParams: any = {};
      Object.keys(filters).forEach((key) => {
        const filterValue = filters[key];
        if (Array.isArray(filterValue) && filterValue.length > 0) {
          filterParams[key] = filterValue.join(",");
        } else if (
          filterValue &&
          !Array.isArray(filterValue) &&
          filterValue !== "all"
        ) {
          filterParams[key] = filterValue;
        }
      });

      // Make a separate API call to get all data without pagination
      const response = await axios.get(url + "/invoices", {
        ...config,
        params: {
          search: contextValue?.invoiceSearch || "",
          // Request all data by setting a very large limit
          limit: 10000,
          sortBy: sortBy.header,
          sortOrder: sortBy.order,
          ...filterParams,
        },
      });

      const allData = response.data.data?.invoices || [];
      if (allData && allData.length > 0) {
        const transformedData = transformDataForExport(allData);
        exportToCSV(transformedData, headers, "invoices_all.csv");
      }
    } catch (error) {
      console.error("Error downloading all data:", error);
      // Fallback to current data if there's an error
      if (data && data.length > 0) {
        const transformedData = transformDataForExport(data);
        exportToCSV(transformedData, headers, "invoices_partial.csv");
      }
    }
  };

  // Handle refresh - updated to use the callback pattern
  const handleRefresh = (onRefreshComplete: () => void) => {
    // Set local refreshing state
    setIsRefreshing(true);

    // Use the refetch function from React Query
    refetch()
      .then(() => {
        console.log("Invoice data refreshed successfully");
      })
      .catch((error) => {
        console.error("Error refreshing invoice data:", error);
      })
      .finally(() => {
        // Reset local refreshing state
        setIsRefreshing(false);

        // Call the callback to notify TableToolbar that refresh is complete
        onRefreshComplete();
      });
  };

  // Handle sort change
  const handleSortChange = (newSortBy: {
    header: string;
    order: "asc" | "desc";
  }) => {
    setSortBy(newSortBy);
  };

  // Create row component with isAdmin prop
  const RowComponent = ({ item }: { item: any }) => (
    <InvoiceSingleRow item={item} isAdmin={isAdmin} />
  );

  return (
    <ContentBox2>
      <TableContainer
        searchEnabled={true}
        downloadEnabled={true}
        refreshEnabled={true}
        filterConfigs={filterConfigs}
        onSearch={handleSearch}
        onDownloadCurrent={handleDownloadCurrent}
        onDownloadAll={handleDownloadAll}
        onRefresh={handleRefresh}
        onFilterChange={handleFilterChange}
        headers={headers}
        data={data || []}
        isLoading={isLoading || isRefreshing}
        error={error}
        rowComponent={RowComponent}
        totalPages={totalPages}
        initialSortBy={sortBy}
        initialRowsPerPage={totalValuesPerPage}
        initialPage={currentActivePage}
        onPageChange={setCurrentActivePage}
        onRowsPerPageChange={setTotalValuesPerPage}
        onSortChange={handleSortChange}
      />
    </ContentBox2>
  );
};

export default InvoiceContent;
