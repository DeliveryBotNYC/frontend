import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import TrackingOrderCard from "./TrackingOrderCard";
import OrdersData from "../../data/OrdersData.json";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

import SearchIcon from "../../assets/search.svg";

const AllOrders = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  //temp bearer
  let local = {
    url: "http://localhost:3000",
    config: {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
      },
    },
  };
  let production = {
    url: "https://api.dbx.delivery",
    config: {
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
      },
    },
  };

  // Get orders data
  const { isLoading, data, error } = useQuery({
    queryKey: ["orders"],
    queryFn: () => {
      return axios
        .get(local.url + "/orders", local.config)
        .then((res) => res.data);
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
        {data?.map((item) => (
          <TrackingOrderCard key={item.order_id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default AllOrders;
