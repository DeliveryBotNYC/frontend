import { useState } from "react";

import TimeIcon from "../../assets/time.svg";
import RechareIcon from "../../assets/recharge.svg";

const SelectDateandTime = () => {
  // Data
  const timeFrameData = [
    {
      id: 1,
      title: "1-hour",
    },
    {
      id: 2,
      title: "2-hour",
    },
    {
      id: 3,
      title: "Same-day",
    },
  ];

  // active timeframe
  const [activeTimeFrame, setActiveTimeFrame] = useState<string>("1-hour");

  return (
    <div className="w-full bg-white rounded-2xl my-5">
      {/* Header */}
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
        {/* Left side */}
        <div className="flex items-center gap-2.5">
          <img src={TimeIcon} alt="icon" />

          <p className="text-2xl text-black font-bold heading">Time</p>
        </div>

        {/* Right Side */}
        <div>
          <img src={RechareIcon} alt="refresh-icon" />
        </div>
      </div>

      {/* Pickup Forms Data */}
      <div className="w-full grid grid-cols-3 gap-2.5 px-5 pb-6 mt-4">
        {/* TimeFrame One */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Time-frame <span className="text-themeRed">*</span>
          </label>

          <div className="flex items-center gap-20">
            {timeFrameData?.map((item) => (
              <p
                onClick={() => setActiveTimeFrame(item.title)}
                key={item.id}
                className={`text-sm text-themeLightPurple cursor-pointer ${
                  activeTimeFrame === item.title ? "font-bold" : "font-normal"
                }`}
              >
                {item.title}
              </p>
            ))}
          </div>
        </div>

        {/* TimeFrame Two */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Time-frame <span className="text-themeRed">*</span>
          </label>

          <div className="flex items-center gap-1 border-b border-b-contentBg pb-1">
            {/* One */}
            <input
              type="time"
              className="outline-none border-none text-sm text-themeLightBlack"
            />

            <p>-</p>

            {/* One */}
            <input
              type="time"
              className="outline-none border-none text-sm text-themeLightBlack"
            />
          </div>
        </div>

        {/* date Two */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Date <span className="text-themeRed">*</span>
          </label>

          {/* left box */}
          <div className="border-b border-b-contentBg pb-[2px]">
            <input type="date" className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectDateandTime;
