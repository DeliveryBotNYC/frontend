import { useState, useEffect } from "react";
import StatisticsCard from "./StatisticsCard";
import DashboardAreaChart from "../charts/DashboardAreaChart";

import TruckIcon from "../../assets/truck-icon.svg";

import { useConfig, url } from "../../hooks/useConfig";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const Overview = () => {
  const config = useConfig();

  // Filter Btn
  //const filterBtns = ["Day", "Month", "Year"];
  const filterBtns = [
    { id: "day", title: "Day" },
    { id: "month", title: "Month" },
    { id: "year", title: "Year" },
  ];

  const [activeFilterBtn, setActiveFilterBtn] = useState({
    id: "day",
    title: "Day",
  });
  // Get orders data
  const { isLoading, data, error, refetch, isSuccess } = useQuery({
    queryKey: ["statistics"],
    queryFn: () => {
      return axios
        .get(url + "/orders/statistics", {
          ...config,
          params: { range: activeFilterBtn.id },
        })
        .then((res) => res.data);
    },
  });
  useEffect(() => {
    refetch();
  }, [activeFilterBtn]);
  var statisticsData = [
    {
      id: "processing",
      title: "Processing",
      value: "0",
      progressBg: "#FBC98E",
      progressValue: "0%",
      progressValueBg: "#E68A00",
    },
    {
      id: "assigned",
      title: "Assigned",
      value: "0",
      progressBg: "#B7BBEF",
      progressValue: "0%",
      progressValueBg: "#176FAD",
    },
    {
      id: "picked_up",
      title: "Picked-up",
      value: "0",
      progressBg: "#808080",
      progressValue: "0%",
      progressValueBg: "#000000",
    },
    {
      id: "delivered",
      title: "Delivered",
      value: "0",
      progressBg: "#BCE4A1",
      progressValue: "0%",
      progressValueBg: "#B2D235",
    },
    {
      id: "canceled",
      title: "Canceled",
      value: "0",
      progressBg: "#F0A69A",
      progressValue: "0%",
      progressValueBg: "#F03F3F",
    },
  ];
  return (
    <div className="w-full flex justify-between gap-2.5 h-1/6 max-h-[130px]">
      {/* Left Side */}
      <div className="w-9/12 bg-white rounded-primaryRadius px-10 pt-[15px] pb-6 flex items-center justify-between gap-14">
        {/* Cards */}
        {statisticsData?.map((item) =>
          isSuccess ? (
            <StatisticsCard
              key={item.id}
              item={{
                ...item,
                value: data?.breakdown[item.id] ? data.breakdown[item.id] : 0,
                progressValue:
                  ((data?.breakdown[item.id] ? data.breakdown[item.id] : 0) /
                    data?.total) *
                    100 +
                  "%",
              }}
            />
          ) : (
            <StatisticsCard key={item.id} item={item} />
          )
        )}
      </div>

      {/* Right Side */}
      <div className="w-3/12 bg-white rounded-primaryRadius px-10 pt-[15px] flex justify-between gap-2.5">
        {/* left side */}
        <div className="w-4/12">
          <img src={TruckIcon} alt="truck-icon" />

          {/* title */}
          <p className="text-3xl font-extrabold mt-2.5 heading">
            {data?.total ? data.total : 0}
          </p>

          {/* desc */}
          <p className="text-xs text-secondaryBtnBorder mt-2 pl-4">
            Total orders
          </p>
        </div>

        {/* Right Side */}
        <div className="w-8/12">
          {/* Filter selector */}
          <div className="flex items-center justify-between gap-2.5">
            {filterBtns?.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setActiveFilterBtn(item)}
                className={`w-full text-sm text-secondaryBtnBorder py-1.5 ${
                  activeFilterBtn.id === item.id
                    ? "bg-contentBg"
                    : "bg-transparent"
                } rounded-[5px]`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Graph */}
          {isSuccess ? (
            <DashboardAreaChart
              item={{ total: data?.total, chart: data?.chart }}
            />
          ) : (
            <DashboardAreaChart item={{ total: 0, chart: [] }} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
