import TableHeader from "./TableHeader";
import React from "react";

interface TableContentProps {
  headers: Array<{ title: string; value: string }>;
  data: any[];
  isLoading: boolean;
  error: any;
  sortBy: { header: string; order: "asc" | "desc" };
  onSortChange: (sortBy: { header: string; order: "asc" | "desc" }) => void;
  RowComponent: React.ComponentType<{ item: any }>;
}

const TableContent = ({
  headers,
  data,
  isLoading,
  error,
  sortBy,
  onSortChange,
  RowComponent,
}: TableContentProps) => {
  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <TableHeader
          headers={headers}
          sortBy={sortBy}
          onSortChange={onSortChange}
        />
      </div>

      {/* Scrollable content */}
      <div className="overflow-auto flex-1">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center p-4">
            Loading...
          </div>
        ) : error ? (
          <div className="h-full w-full flex items-center justify-center p-4 text-red-500">
            {error.response ? error.response.data.reason : error.message}
          </div>
        ) : data && data.length > 0 ? (
          data.map((item, index) => (
            <RowComponent key={item.id || index} item={item} />
          ))
        ) : (
          <div className="h-full w-full flex items-center justify-center p-4 text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default TableContent;
