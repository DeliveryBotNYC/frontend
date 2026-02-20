import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

interface TableHeaderProps {
  headers: Array<{ title: string; value: string }>;
  sortBy: { header: string; order: "asc" | "desc" };
  onSortChange: (sortBy: { header: string; order: "asc" | "desc" }) => void;
}

const TableHeader = ({ headers, sortBy, onSortChange }: TableHeaderProps) => {
  const handleSort = (headerValue: string) => {
    if (sortBy.header === headerValue) {
      onSortChange({
        header: headerValue,
        order: sortBy.order === "asc" ? "desc" : "asc",
      });
    } else {
      onSortChange({ header: headerValue, order: "asc" });
    }
  };

  return (
    <div className="bg-contentBg border-b border-gray-100 z-10">
      <div className="flex w-full">
        {headers.map((header, index) => (
          <div
            key={index}
            // Tighter padding on mobile, normal on sm+
            className="py-2 sm:py-3 flex-1 font-semibold cursor-pointer hover:bg-gray-200 px-2 sm:px-themePadding min-w-0"
            onClick={() => handleSort(header.value)}
          >
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-themeDarkGray font-normal text-xs sm:text-sm truncate">
                {header.title}
              </span>
              {/* Sort icon hidden on very small screens to save space, visible sm+ */}
              <span className="hidden xs:inline sm:inline shrink-0">
                {sortBy.header === header.value ? (
                  sortBy.order === "asc" ? (
                    <FaSortUp className="text-gray-400 text-xs" />
                  ) : (
                    <FaSortDown className="text-gray-400 text-xs" />
                  )
                ) : (
                  <FaSort className="text-gray-400 text-xs" />
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableHeader;
