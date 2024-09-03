import ContentBox2 from "../reusable/ContentBox2";
import RoutesControl from "./RoutesControl";
import { Outlet } from "react-router-dom";
import RoutesMap from "./RoutesMap";
import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useContext, useState, useEffect } from "react";

const OrderTrackingContent = () => {
  const config = useConfig();
  const [routesValues, setRoutesValues] = useState({
    routes: [],
    orders: [],
    drivers: [],
  });
  // Get orders data
  const { data, isSuccess } = useQuery({
    queryKey: ["statistics"],
    queryFn: () => {
      return axios.get(url + "/routes/statistics", config).then((res) => {
        return res?.data;
      });
    },
  });

  //update state when default data
  useEffect(() => {
    if (data?.routes) setRoutesValues(data);
  }, [isSuccess]);

  return (
    <ContentBox2>
      {/* Settings / stats (Top) */}
      <RoutesControl state={routesValues} />
      <div className="flex h-[calc(100%-150px)]">
        {/* Content Box */}
        <div className="w-full h-full flex">
          {/* Sidebar */}
          <div className="w-2/5 min-w-96 h-full bg-white">
            {/* outlet here */}
            <Outlet />
          </div>
          {/* Map */}
          <RoutesMap />
        </div>
      </div>
    </ContentBox2>
  );
};

export default OrderTrackingContent;
