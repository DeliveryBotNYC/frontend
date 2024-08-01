import { useState, useEffect } from "react";
import moment from "moment";
import TimeIconFilled from "../../assets/timeFilled.svg";
import TimeIcon from "../../assets/time.svg";
import RechareIcon from "../../assets/recharge.svg";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { isCompleted, initialState } from "../reusable/functions";
import clipart from "../../assets/timeframeClipArt.svg";
import { useConfig, url } from "../../hooks/useConfig";

const SelectDateandTime = ({ data, stateChanger, ...rest }) => {
  const [fastest, setFastest] = useState({});
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  console.log(rest.state.timeframe);
  //set to fastest service
  const config = useConfig();
  const [timeframes, setTimeframes] = useState([]);
  const addTodoMutation = useMutation({
    mutationFn: (getTimeframes: string) =>
      axios.post(url + "/timeframe?date=" + selectedDate, rest?.state, config),
    onSuccess: (data) => {
      setFastest({
        service: data?.data[0]?.service,
        service_id: 0,
        start_time: data?.data[0]?.slots[0]?.start_time,
        end_time: data?.data[0]?.slots[0]?.end_time,
      }),
        rest?.state?.status == "new_order"
          ? stateChanger({
              ...rest?.state,
              timeframe: {
                service: data?.data[0]?.service,
                service_id: 0,
                start_time: data?.data[0]?.slots[0]?.start_time,
                end_time: data?.data[0]?.slots[0]?.end_time,
              },
            })
          : moment().isBefore(moment(rest?.state?.timeframe?.start_time))
          ? setTimeframes(data?.data)
          : setTimeframes([
              {
                service: rest?.state?.timeframe?.service,
                service_id: 0,
                slots: [
                  {
                    start_time: rest?.state?.timeframe?.start_time,
                    end_time: rest?.state?.timeframe?.end_time,
                  },
                ],
              },
            ]);
    },
    onError: (error) => {},
  });

  //initial date for timeframe in edit
  useEffect(() => {
    setSelectedDate(
      moment(rest?.state?.timeframe?.start_time).format("YYYY-MM-DD")
    );
  }, [rest?.state.timeframe]);

  //reloading timeframe
  useEffect(() => {
    //when all other fields are completed
    if (isCompleted(rest?.state).pickup && isCompleted(rest?.state).delivery) {
      //if its a new order or edited order changed address
      if (
        rest?.state?.status == "new_order" ||
        !timeframes[0] ||
        (rest?.state?.status == "processing" &&
          rest?.state?.pickup?.location?.address_id !=
            data?.pickup?.location?.address_id)
      ) {
        addTodoMutation.mutate(rest?.state);
      }
    }
    //setTimeframes([]);
  }, [rest?.state.pickup && rest?.state.delivery]);

  return (
    <div className="w-full bg-white rounded-2xl my-5">
      {/* Header */}
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
        {/* Left side */}
        <div className="flex items-center gap-2.5">
          <img
            src={
              isCompleted(rest?.state).timeframe &&
              isCompleted(rest?.state).pickup &&
              isCompleted(rest?.state).delivery
                ? TimeIconFilled
                : TimeIcon
            }
            alt="icon"
          />

          <p className="text-2xl text-black font-bold heading">Time</p>
        </div>

        {/* Right Side */}
        {rest?.state.timeframe.start_time != fastest?.start_time &&
        isCompleted(rest?.state).pickup &&
        isCompleted(rest?.state).delivery ? (
          <div>
            <img
              onClick={() => {
                stateChanger({
                  ...rest?.state,
                  timeframe: fastest,
                });
              }}
              src={RechareIcon}
              alt="refresh-icon"
            />
          </div>
        ) : null}
      </div>

      {/* Pickup Forms Data */}
      <div className="w-full grid grid-cols-3 gap-2.5 px-5 pb-6 mt-4">
        {/* TimeFrame One */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Time-frame <span className="text-themeRed">*</span>
          </label>

          <div className="flex items-center justify-between">
            {timeframes?.map((item, index) => (
              <p
                onClick={() =>
                  stateChanger({
                    ...rest?.state,
                    timeframe: {
                      ...rest?.state?.timeframe,
                      service: item?.service,
                      service_id: index,
                      start_time: item?.slots[0].start_time,
                      end_time: item?.slots[0].end_time,
                    },
                  })
                }
                key={index}
                className={`text-sm text-themeLightPurple cursor-pointer ${
                  rest?.state?.timeframe?.service === item?.service
                    ? "font-bold"
                    : "font-normal"
                }`}
              >
                {item?.service}
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
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                addTodoMutation.mutate(rest?.state);
              }}
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
              id="timeframe"
              value={
                rest?.state?.timeframe.start_time +
                ";" +
                rest?.state?.timeframe.end_time
              }
              onChange={(e) =>
                stateChanger({
                  ...rest?.state,
                  timeframe: {
                    ...rest?.state?.timeframe,
                    start_time: e.target.value.split(";")[0],
                    end_time: e.target.value.split(";")[1],
                  },
                })
              }
            >
              {timeframes[rest?.state?.timeframe?.service_id]?.slots?.map(
                (item) => (
                  <option
                    key={item.start_time + ";" + item.end_time}
                    value={item.start_time + ";" + item.end_time}
                  >
                    {moment(item.start_time).format("hh:mm A") +
                      " - " +
                      moment(item.end_time).format("hh:mm A")}
                  </option>
                )
              )}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectDateandTime;
