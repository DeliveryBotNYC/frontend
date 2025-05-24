import { useState } from "react";
import TableHeader from "./TableHeader";
import TableContent from "./TableContent";
import TablePagination from "./TablePagination";
import TableToolbar from "./TableToolbar";
import { FilterOptions } from "./TableToolbar"; // Import the FilterOptions interface

interface TableContainerProps {
  searchEnabled?: boolean;
  downloadEnabled?: boolean;
  refreshEnabled?: boolean;
  uploadEnabled?: boolean; // New prop for upload button
  dateRangeFilterEnabled?: boolean; // New prop for date range filter
  statusFilterEnabled?: boolean; // New prop for status filter
  platformFilterEnabled?: boolean; // New prop for platform filter
  storeFilterEnabled?: boolean; // New prop for store filter
  platformOptions?: Array<{ value: string; label: string }>; // New prop for platform options
  onSearch?: (value: string) => void;
  onDownloadAll?: () => void;
  onDownloadCurrent?: () => void;
  onRefresh?: (callback: () => void) => void;
  onUpload?: () => void; // New handler for upload
  onFilterChange?: (filters: FilterOptions) => void; // New handler for filter changes
  headers: Array<{ title: string; value: string }>;
  data: any[];
  isLoading: boolean;
  error: any;
  rowComponent: React.ComponentType<{ item: any }>;
  totalPages?: number;
  initialSortBy?: { header: string; order: "asc" | "desc" };
  initialRowsPerPage?: number;
  initialPage?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (value: number) => void;
  onSortChange?: (sortBy: { header: string; order: "asc" | "desc" }) => void;
}

const TableContainer = ({
  searchEnabled = false,
  downloadEnabled = false,
  refreshEnabled = false,
  uploadEnabled = false,
  dateRangeFilterEnabled = false,
  statusFilterEnabled = false,
  platformFilterEnabled = false,
  storeFilterEnabled = false,
  platformOptions = [{ value: "portal", label: "Portal" }], // Default platform options
  onSearch,
  onDownloadAll,
  onDownloadCurrent,
  onRefresh,
  onUpload,
  onFilterChange,
  headers,
  data,
  isLoading,
  error,
  rowComponent: RowComponent,
  totalPages = 1,
  initialSortBy = { header: "last_updated", order: "desc" },
  initialRowsPerPage = 50,
  initialPage = 1,
  onPageChange,
  onRowsPerPageChange,
  onSortChange,
}: TableContainerProps) => {
  const [currentActivePage, setCurrentActivePage] = useState(initialPage);
  const [totalValuesPerPage, setTotalValuesPerPage] =
    useState(initialRowsPerPage);
  const [sortBy, setSortBy] = useState(initialSortBy);

  // Handle sorting
  const handleSortChange = (newSortBy: {
    header: string;
    order: "asc" | "desc";
  }) => {
    setSortBy(newSortBy);
    if (onSortChange) {
      onSortChange(newSortBy);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentActivePage(page);
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (value: number) => {
    setTotalValuesPerPage(value);
    setCurrentActivePage(1);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(value);
    }
  };

  // Check if any toolbar features are enabled
  const isToolbarVisible =
    searchEnabled ||
    downloadEnabled ||
    refreshEnabled ||
    uploadEnabled ||
    dateRangeFilterEnabled ||
    statusFilterEnabled ||
    platformFilterEnabled ||
    storeFilterEnabled;

  return (
    <div className="flex flex-col h-full bg-white rounded-tr-2xl rounded-tl-2xl">
      {/* Show toolbar only if any of its features are enabled */}
      {isToolbarVisible && (
        <TableToolbar
          searchEnabled={searchEnabled}
          downloadEnabled={downloadEnabled}
          refreshEnabled={refreshEnabled}
          uploadEnabled={uploadEnabled}
          dateRangeFilterEnabled={dateRangeFilterEnabled}
          statusFilterEnabled={statusFilterEnabled}
          platformFilterEnabled={platformFilterEnabled}
          storeFilterEnabled={storeFilterEnabled}
          platformOptions={platformOptions}
          onSearch={onSearch}
          onDownloadAll={onDownloadAll}
          onDownloadCurrent={onDownloadCurrent}
          onRefresh={onRefresh}
          onUpload={onUpload}
          onFilterChange={onFilterChange}
        />
      )}

      {/* Scrollable content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TableContent
          headers={headers}
          data={data}
          isLoading={isLoading}
          error={error}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          RowComponent={RowComponent}
        />
      </div>

      {/* Pagination - outside the scrollable area */}
      <TablePagination
        currentActivePage={currentActivePage}
        setCurrentActivePage={handlePageChange}
        totalValuesPerPage={totalValuesPerPage}
        setTotalValuesPerPage={handleRowsPerPageChange}
        totalPages={totalPages}
      />
    </div>
  );
};

export default TableContainer;
