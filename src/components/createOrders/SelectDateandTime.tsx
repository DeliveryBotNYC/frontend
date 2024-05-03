import { useState, useEffect } from "react";
import moment from "moment";
import TimeIcon from "../../assets/time.svg";
import RechareIcon from "../../assets/recharge.svg";

const SelectDateandTime = ({ stateChanger, ...rest }) => {
  // Data
  const timeFrameData = [
    {
      id: 1,
      title: "same-day",
      slots: [
        {
          start_time: "2024-05-03T18:00:00.000Z",
          end_time: "2024-05-03T24:00:00.000Z",
        },
        {
          start_time: "2024-05-03T19:00:00.000Z",
          end_time: "2024-05-03T22:00:00.000Z",
        },
        {
          start_time: "2024-05-03T20:00:00.000Z",
          end_time: "2024-05-03T23:00:00.000Z",
        },
      ],
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
  const [timeframFormValues, setTimeframeFormValues] = useState({
    service: "same-day",
    start_time: "",
    end_time: "",
  });
  useEffect(() => {
    stateChanger({
      ...rest.state,
      timeframe: timeframFormValues,
    });
  }, [timeframFormValues]);
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
                onClick={() =>
                  setTimeframeFormValues({
                    ...timeframFormValues,
                    service: item.title,
                  })
                }
                key={item.id}
                className={`text-sm text-themeLightPurple cursor-pointer ${
                  timeframFormValues.service === item.title
                    ? "font-bold"
                    : "font-normal"
                }`}
              >
                {item.title}
              </p>
            ))}
          </div>
        </div>
        {/* date Two */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Date <span className="text-themeRed">*</span>
          </label>

          {/* left box */}
          <div className="border-b border-b-contentBg pb-[2px]">
            <input
              type="date"
              className="w-full"
              value={moment(timeframFormValues.start_time).format("yyyy-MM-DD")}
            />
          </div>
        </div>
        {/* TimeFrame Two */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Time-frame <span className="text-themeRed">*</span>
          </label>

          <div className="flex items-center gap-1 border-b border-b-contentBg pb-1">
            {/* One */}
            {/* Select Field */}
            <select
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              onChange={(e) =>
                setTimeframeFormValues({
                  ...timeframFormValues,
                  start_time: e.target.value.split(";")[0],
                  end_time: e.target.value.split(";")[1],
                })
              }
            >
              {timeFrameData[0].slots?.map((item) => (
                <option value={item.start_time + ";" + item.end_time}>
                  {moment(item.start_time).format("hh:mm A") +
                    " - " +
                    moment(item.end_time).format("hh:mm A")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectDateandTime;
