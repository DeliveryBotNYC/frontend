import { useState } from "react";
import NextIcon from "../../assets/arrow-next.svg";

const OrdersTablePagination = () => {
  // Pagination Part
  const [currentActivePage, setCurrentActivePage] = useState<number>(1);

  const handleSetActivePage = (page: number) => {
    setCurrentActivePage(Math.max(1, Math.min(3, page)));
  };

  return (
    <div className="bg-white px-themePadding py-4 rounded-bl-2xl rounded-br-2xl flex items-center justify-end gap-2.5">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          onClick={() => handleSetActivePage(idx + 1)}
          className={`w-6 h-6 rounded-[5px] ${
            currentActivePage === idx + 1 ? "bg-themeOrange" : "bg-transparent"
          } flex items-center justify-center cursor-pointer`}
        >
          <p
            className={`text-sm ${
              currentActivePage === idx + 1 ? "text-white" : "text-black"
            }`}
          >
            {idx + 1}
          </p>
        </div>
      ))}

      <div className="pl-5">
        <img
          src={NextIcon}
          alt="next-icon"
          className="cursor-pointer"
          onClick={() => handleSetActivePage(currentActivePage + 1)}
        />
      </div>
    </div>
  );
};

export default OrdersTablePagination;
