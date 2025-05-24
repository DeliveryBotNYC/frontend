import { useState } from "react";
import NextIcon from "../../../assets/arrow-next.svg";

interface TablePaginationProps {
  setCurrentActivePage: (page: number) => void;
  currentActivePage: number;
  totalValuesPerPage: number;
  setTotalValuesPerPage: (value: number) => void;
  totalPages?: number;
}

const TablePagination = ({
  setCurrentActivePage,
  currentActivePage,
  totalValuesPerPage,
  setTotalValuesPerPage,
  totalPages = 1,
}: TablePaginationProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const rowOptions = [10, 25, 50, 100, 200];

  const handleSetActivePage = (page: number) => {
    setCurrentActivePage(Math.max(1, Math.min(totalPages, page)));
  };

  const handleRowsPerPageChange = (value: number) => {
    setTotalValuesPerPage(value);
    setShowDropdown(false);
    setCurrentActivePage(1);
  };

  return (
    <div className="w-full z-10 sticky left-0 bottom-0 bg-white shadow-dropdownShadow py-2.5 px-4 flex items-center justify-between">
      {/* Rows per page selector */}
      <div className="relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span className="text-sm text-themeDarkGray">Show</span>
          <div className="px-2 py-1 bg-contentBg rounded-[5px] min-w-[50px] h-[25px] flex items-center justify-center">
            <span className="text-sm">{totalValuesPerPage}</span>
          </div>
          <span className="text-sm text-themeDarkGray">rows</span>
        </div>

        {/* Dropdown for row selection */}
        {showDropdown && (
          <div className="absolute top-[-130px] left-0 bg-white shadow-dropdownShadow rounded-md z-20">
            {rowOptions.map((option) => (
              <div
                key={option}
                className="px-4 py-2 hover:bg-contentBg cursor-pointer"
                onClick={() => handleRowsPerPageChange(option)}
              >
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination controls - with fixed positioning */}
      <div className="flex items-center">
        {/* Fixed-width container for previous button */}
        <div className="w-8 flex justify-center">
          {currentActivePage > 1 ? (
            <img
              src={NextIcon}
              alt="prev-icon"
              className="cursor-pointer transform rotate-180"
              onClick={() => handleSetActivePage(currentActivePage - 1)}
            />
          ) : (
            <span className="w-4" />
          )}
        </div>

        {/* Page numbers section - stable width */}
        <div className="flex items-center gap-2.5">
          {/* Show page numbers with dynamic rendering based on total pages */}
          {totalPages > 0 && (
            <>
              {/* First page always visible */}
              <div
                onClick={() => handleSetActivePage(1)}
                className={`w-6 h-6 rounded-[5px] ${
                  currentActivePage === 1 ? "bg-themeOrange" : "bg-transparent"
                } flex items-center justify-center cursor-pointer`}
              >
                <p
                  className={`text-sm ${
                    currentActivePage === 1 ? "text-white" : "text-black"
                  }`}
                >
                  1
                </p>
              </div>

              {/* Show ellipsis if needed before middle pages */}
              {currentActivePage > 3 && totalPages > 5 && (
                <div className="w-6 h-6 flex items-center justify-center">
                  <p className="text-sm">...</p>
                </div>
              )}

              {/* Middle pages dynamically rendered */}
              {Array.from({ length: totalPages })
                .slice(1, -1)
                .map((_, idx) => {
                  const pageNum = idx + 2;
                  // Only show current page and 1 page before/after
                  if (
                    pageNum === currentActivePage ||
                    pageNum === currentActivePage - 1 ||
                    pageNum === currentActivePage + 1 ||
                    (pageNum === 2 && currentActivePage <= 3) ||
                    (pageNum === totalPages - 1 &&
                      currentActivePage >= totalPages - 2)
                  ) {
                    return (
                      <div
                        key={pageNum}
                        onClick={() => handleSetActivePage(pageNum)}
                        className={`w-6 h-6 rounded-[5px] ${
                          currentActivePage === pageNum
                            ? "bg-themeOrange"
                            : "bg-transparent"
                        } flex items-center justify-center cursor-pointer`}
                      >
                        <p
                          className={`text-sm ${
                            currentActivePage === pageNum
                              ? "text-white"
                              : "text-black"
                          }`}
                        >
                          {pageNum}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })
                .filter(Boolean)}

              {/* Show ellipsis if needed before last page */}
              {currentActivePage < totalPages - 2 && totalPages > 5 && (
                <div className="w-6 h-6 flex items-center justify-center">
                  <p className="text-sm">...</p>
                </div>
              )}

              {/* Last page always visible if more than 1 page */}
              {totalPages > 1 && (
                <div
                  onClick={() => handleSetActivePage(totalPages)}
                  className={`w-6 h-6 rounded-[5px] ${
                    currentActivePage === totalPages
                      ? "bg-themeOrange"
                      : "bg-transparent"
                  } flex items-center justify-center cursor-pointer`}
                >
                  <p
                    className={`text-sm ${
                      currentActivePage === totalPages
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {totalPages}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fixed-width container for next button */}
        <div className="w-8 flex justify-center">
          {currentActivePage < totalPages ? (
            <img
              src={NextIcon}
              alt="next-icon"
              className="cursor-pointer"
              onClick={() => handleSetActivePage(currentActivePage + 1)}
            />
          ) : (
            <span className="w-4" />
          )}
        </div>
      </div>
    </div>
  );
};

export default TablePagination;
