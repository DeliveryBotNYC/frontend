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
      onSortChange({
        header: headerValue,
        order: "asc",
      });
    }
  };

  return (
    <div className="bg-contentBg border-b border-gray-100 z-10">
      <div className="flex w-full">
        {headers.map((header, index) => (
          <div
            key={index}
            className="py-3 flex-1 font-semibold cursor-pointer hover:bg-gray-200 px-themePadding"
            onClick={() => handleSort(header.value)}
          >
            <div className="flex items-center gap-2">
              <span className="text-themeDarkGray font-normal">
                {header.title}
              </span>
              <span>
                {sortBy.header === header.value ? (
                  sortBy.order === "asc" ? (
                    <FaSortUp className="text-gray-400" />
                  ) : (
                    <FaSortDown className="text-gray-400" />
                  )
                ) : (
                  <FaSort className="text-gray-400" />
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
