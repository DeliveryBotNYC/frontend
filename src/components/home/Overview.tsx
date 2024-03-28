import { useState } from "react";
import StatisticsCard from "./StatisticsCard";
import DashboardAreaChart from "../charts/DashboardAreaChart";

import TruckIcon from "../../assets/truck-icon.svg";

const Overview = () => {
  // Static Data Array
  const statisticsData = [
    {
      id: 1,
      title: "Processing",
      value: "8",
      progressBg: "#FBC98E",
      progressValue: "50%",
      progressValueBg: "#E68A00",
    },
    {
      id: 2,
      title: "Assigned",
      value: "4",
      progressBg: "#B7BBEF",
      progressValue: "30%",
      progressValueBg: "#176FAD",
    },
    {
      id: 3,
      title: "Picked-up",
      value: "6",
      progressBg: "#808080",
      progressValue: "30%",
      progressValueBg: "#000000",
    },
    {
      id: 4,
      title: "Delivered",
      value: "11",
      progressBg: "#BCE4A1",
      progressValue: "60%",
      progressValueBg: "#B2D235",
    },
    {
      id: 5,
      title: "Canceled",
      value: "1",
      progressBg: "#F0A69A",
      progressValue: "10%",
      progressValueBg: "#F03F3F",
    },
  ];

  // Filter Btn
  const filterBtns = ["Day", "Month", "Year"];

  const [activeFilterBtn, setActiveFilterBtn] = useState<number>(1);

  return (
    <div className="w-full flex justify-between gap-2.5">
      {/* Left Side */}
      <div className="w-9/12 bg-white rounded-primaryRadius px-10 pt-[15px] pb-6 flex items-center justify-between gap-14">
        {/* Cards */}
        {statisticsData?.map((item) => (
          <StatisticsCard key={item.id} item={item} />
        ))}
      </div>

      {/* Right Side */}
      <div className="w-3/12 bg-white rounded-primaryRadius px-10 pt-[15px] flex justify-between gap-2.5">
        {/* left side */}
        <div className="w-4/12">
          <img src={TruckIcon} alt="truck-icon" />

          {/* title */}
          <p className="text-3xl font-extrabold mt-2.5 heading">3484</p>

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
                key={idx}
                onClick={() => setActiveFilterBtn(idx + 1)}
                className={`w-full text-sm text-secondaryBtnBorder py-1.5 ${
                  activeFilterBtn === idx + 1
                    ? "bg-contentBg"
                    : "bg-transparent"
                } rounded-[5px]`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Graph */}
          <DashboardAreaChart />
        </div>
      </div>
    </div>
  );
};

export default Overview;
