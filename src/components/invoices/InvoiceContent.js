import { useContext, useState } from "react";
import ContentBox2 from "../reusable/ContentBox2";
import TableContainer from "../reusable/table/TableContainer";
import InvoiceSingleRow from "./InvoiceSingleRow";
import { ThemeContext } from "../../context/ThemeContext";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { exportToCSV } from "../reusable/exportUtils";

const InvoiceContent = () => {
  const contextValue = useContext(ThemeContext);
  const [currentActivePage, setCurrentActivePage] = useState<number>(1);
  const [totalValuesPerPage, setTotalValuesPerPage] = useState<number>(50);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState({
    header: "date",
    order: "desc" as "asc" | "desc",
  });

  // State to track if a refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

  const config = useConfig();

  // Updated table headers to include new columns
  const headers = [
    { title: "Invoice", value: "invoice_id" },
    { title: "Status", value: "status" },
    { title: "Date", value: "date" },
    { title: "Date Range", value: "date_range" },
    { title: "Amount Due", value: "amount_due" },
    { title: "Payment Method", value: "payment_method" },
    { title: "Actions", value: "actions" },
  ];

  // Fetch invoices data
  const { isLoading, data, error, refetch } = useQuery({
    queryKey: [
      "invoices",
      currentActivePage,
      totalValuesPerPage,
      sortBy.header,
      sortBy.order,
      contextValue?.invoiceSearch || "",
    ],
    queryFn: () => {
      return axios
        .get(url + "/invoices", {
          ...config,
          params: {
            search: contextValue?.invoiceSearch || "",
            page: currentActivePage,
            limit: totalValuesPerPage,
            sortBy: sortBy.header,
            sortOrder: sortBy.order,
          },
        })
        .then((res) => {
          if (setTotalPages && res.data.data?.pagination) {
            setTotalPages(res.data.data.pagination.totalPages);
          }
          // Adjust based on your API response structure
          return res.data.data?.invoices || res.data;
        });
    },
  });

  // Handle search
  const handleSearch = (value: string) => {
    if (contextValue?.setInvoiceSearch) {
      contextValue.setInvoiceSearch(value);
    }
  };

  // Handle download current view
  const handleDownloadCurrent = () => {
    if (data && data.length > 0) {
      // Format data for CSV export excluding actions column
      const exportData = data.map((item: any) => ({
        invoice_id: item.invoice_id,
        status: item.status,
        date: item.date,
        date_range: item.date_range 
          ? `${item.date_range.start_date} - ${item.date_range.end_date}` 
          : "N/A",
        amount_due: item.amount_due || item.amount,
        payment_method: item.payment_method || "N/A",
      }));
      
      exportToCSV(
        exportData,
        headers.filter(h => h.value !== "actions"),
        `invoices_current_page_${currentActivePage}.csv`
      );
    }
  };

  // Handle download all data
  const handleDownloadAll = async () => {
    try {
      // Make a separate API call to get all data without pagination
      const response = await axios.get(url + "/invoices", {
        ...config,
        params: {
          search: contextValue?.invoiceSearch || "",
          // Request all data by setting a very large limit
          limit: 10000,
          sortBy: sortBy.header,
          sortOrder: sortBy.order,
        },
      });

      const allData = response.data.data?.invoices || response.data;
      if (allData && allData.length > 0) {
        // Format data for CSV export excluding actions column
        const exportData = allData.map((item: any) => ({
          invoice_id: item.invoice_id,
          status: item.status,
          date: item.date,
          date_range: item.date_range 
            ? `${item.date_range.start_date} - ${item.date_range.end_date}` 
            : "N/A",
          amount_due: item.amount_due || item.amount,
          payment_method: item.payment_method || "N/A",
        }));
        
        exportToCSV(exportData, headers.filter(h => h.value !== "actions"), "invoices_all.csv");
      }
    } catch (error) {
      console.error("Error downloading all data:", error);
      // Fallback to current data if there's an error
      if (data && data.length > 0) {
        const exportData = data.map((item: any) => ({
          invoice_id: item.invoice_id,
          status: item.status,
          date: item.date,
          date_range: item.date_range 
            ? `${item.date_range.start_date} - ${item.date_range.end_date}` 
            : "N/A",
          amount_due: item.amount_due || item.amount,
          payment_method: item.payment_method || "N/A",
        }));
        
        exportToCSV(exportData, headers.filter(h => h.value !== "actions"), "invoices_partial.csv");
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
        rowComponent={InvoiceSingleRow}
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