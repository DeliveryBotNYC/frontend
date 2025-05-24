import { useContext, useState, useEffect } from "react";
import ContentBox2 from "../reusable/ContentBox2";
import TableContainer from "../reusable/table/TableContainer";
import CustomerSingleRow from "./CustomerSingleRow";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { exportToCSV } from "../reusable/exportUtils";

const CustomersContent = () => {
  const contextValue = useContext(ThemeContext);
  const [currentActivePage, setCurrentActivePage] = useState<number>(1);
  const [totalValuesPerPage, setTotalValuesPerPage] = useState<number>(50);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState({
    header: "last_updated",
    order: "desc" as "asc" | "desc",
  });

  // State to track if a refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

  const config = useConfig();

  // Define table headers
  const headers = [
    { title: "Customer ID", value: "customer_id" },
    { title: "Name", value: "name" },
    { title: "Address", value: "address.formatted" },
    { title: "Phone", value: "formatted_phone" },
    { title: "Created At", value: "last_updated" },
  ];

  // Fetch customers data
  const { isLoading, data, error, refetch } = useQuery({
    queryKey: [
      "customers",
      currentActivePage,
      totalValuesPerPage,
      sortBy.header,
      sortBy.order,
      contextValue?.customerSearch || "",
    ],
    queryFn: () => {
      return axios
        .get(url + "/customer/all", {
          ...config,
          params: {
            search: contextValue?.customerSearch || "",
            page: currentActivePage,
            limit: totalValuesPerPage,
            sortBy: sortBy.header,
            sortOrder: sortBy.order,
          },
        })
        .then((res) => {
          if (setTotalPages && res.data.data.pagination) {
            setTotalPages(res.data.data.pagination.totalPages);
          }
          return res.data.data.customers;
        });
    },
  });

  // Handle search
  const handleSearch = (value: string) => {
    if (contextValue?.setCustomerSearch) {
      contextValue.setCustomerSearch(value);
    }
  };

  // Handle download current view
  const handleDownloadCurrent = () => {
    if (data && data.length > 0) {
      exportToCSV(
        data,
        headers,
        `customers_current_page_${currentActivePage}.csv`
      );
    }
  };

  // Handle download all data
  const handleDownloadAll = async () => {
    try {
      // Make a separate API call to get all data without pagination
      const response = await axios.get(url + "/customer/all", {
        ...config,
        params: {
          search: contextValue?.customerSearch || "",
          // Request all data by setting a very large limit
          limit: 10000,
          sortBy: sortBy.header,
          sortOrder: sortBy.order,
        },
      });

      const allData = response.data.data.customers;
      if (allData && allData.length > 0) {
        exportToCSV(allData, headers, "customers_all.csv");
      }
    } catch (error) {
      console.error("Error downloading all data:", error);
      // Fallback to current data if there's an error
      if (data && data.length > 0) {
        exportToCSV(data, headers, "customers_partial.csv");
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
        console.log("Customer data refreshed successfully");
      })
      .catch((error) => {
        console.error("Error refreshing customer data:", error);
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

  return (
    <ContentBox2>
      <TableContainer
        searchEnabled={true}
        downloadEnabled={true}
        refreshEnabled={true}
        onSearch={handleSearch}
        onDownloadCurrent={handleDownloadCurrent}
        onDownloadAll={handleDownloadAll}
        onRefresh={handleRefresh}
        headers={headers}
        data={data || []}
        isLoading={isLoading || isRefreshing} // Consider both initial loading and refresh state
        error={error}
        rowComponent={CustomerSingleRow}
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

export default CustomersContent;
