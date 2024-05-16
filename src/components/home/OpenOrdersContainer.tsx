import { Link } from "react-router-dom";
import OpenOrdersCard from "./OpenOrdersCard";

import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const OpenOrdersContainer = () => {
  // Get orders data
  const config = useConfig();

  const { isLoading, data, error, refetch, isSuccess } = useQuery({
    queryKey: ["open"],
    queryFn: () => {
      return axios
        .get(url + "/orders", {
          ...config,
          params: { status: "open" },
        })
        .then((res) => res.data);
    },
  });
  return (
    <div className="mt-3 pt-[15px] bg-white rounded-primaryRadius">
      {/* header */}
      <div className="px-12 pb-2.5">
        <p className="text-lg font-semibold">Open Orders</p>
      </div>

      {/* Data Title */}
      <div className="w-full bg-contentBg px-themePadding py-2.5 grid grid-cols-6 gap-2.5">
        <div>
          <p className="text-themeDarkGray">Order</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Pickup</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Delivery</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Driver</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Delivery ETA</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Status</p>
        </div>
      </div>

      {/*  Data Card Container */}
      <div className="w-full h-[150px] overflow-auto">
        {data?.length > 0 ? (
          data?.map((item) => (
            <OpenOrdersCard item={item} key={item.order_id} />
          ))
        ) : data ? (
          <div className="px-themePadding py-2 grid grid-cols-6 items-center gap-2.5 border-b-2 border-b-themeLightGray">
            no open orders
          </div>
        ) : (
          <div className="px-themePadding py-2 grid grid-cols-6 items-center gap-2.5 border-b-2 border-b-themeLightGray">
            loading...
          </div>
        )}
      </div>

      {/* Link to the page */}
      <div className="w-full px-themePadding py-2 text-end">
        <Link to={"/orders"}>
          <p className="text-xs text-themeDarkGray">View all</p>
        </Link>
      </div>
    </div>
  );
};

export default OpenOrdersContainer;
