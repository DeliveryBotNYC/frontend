import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import TrackingOrderCard from "./TrackingOrderCard";
import OrdersData from "../../data/OrdersData.json";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useConfig, url } from "../../hooks/useConfig";
import SearchIcon from "../../assets/search.svg";

const AllOrders = () => {
  const config = useConfig();
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  // Get orders data
  const { isLoading, data, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => {
      return axios.get(url + "/orders", config).then((res) => res.data);
    },
  });

  return (
    <div className="min-w-[400px] h-full bg-white rounded-2xl hidden md:block">
      {/* SearchBox */}
      <div className="w-full h-[110px]  py-5 bg-white rounded-tr-2xl rounded-tl-2xl">
        <div className="w-full border-b border-b-primaryBorder flex items-center gap-2 pb-2 px-2.5">
          <img src={SearchIcon} alt="searchbox" />

          {/* Search Input */}
          <input
            type="text"
            className="w-full bg-transparent outline-none border-none placeholder:text-textLightBlack text-themeLightBlack"
            placeholder="Search..."
            value={contextValue?.searchInput || ""}
            onChange={(e) =>
              contextValue?.setSearchInput &&
              contextValue.setSearchInput(e.target.value)
            }
          />
        </div>

        {/* Heading */}
        <div className="bg-contentBg px-7 py-2.5 text-center">
          <p className="text-lg font-semibold text-black">Order</p>
        </div>
      </div>

      {/* Orders Card Container */}
      <div
        style={{
          height: "calc(100% - 110px)",
        }}
        className="overflow-auto"
      >
        {data?.map((item) =>
          contextValue?.searchInput == "" ||
          (item?.order_id &&
            item?.order_id
              .toLowerCase()
              .includes(contextValue?.searchInput.toLowerCase())) ||
          (item?.pickup?.name &&
            item?.pickup?.name
              .toLowerCase()
              .includes(contextValue?.searchInput.toLowerCase())) ||
          (item?.pickup?.location?.street_address_1 &&
            item?.pickup?.location?.street_address_1
              .toLowerCase()
              .includes(contextValue?.searchInput.toLowerCase())) ||
          (item?.delivery?.name &&
            item?.delivery?.name
              .toLowerCase()
              .includes(contextValue?.searchInput.toLowerCase())) ||
          (item?.delivery?.location?.street_address_1 &&
            item?.delivery?.location?.street_address_1
              .toLowerCase()
              .includes(contextValue?.searchInput.toLowerCase())) ? (
            <TrackingOrderCard key={item.order_id} item={item} />
          ) : null
        )}
      </div>
    </div>
  );
};

export default AllOrders;
