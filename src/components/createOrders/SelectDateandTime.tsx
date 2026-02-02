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

const TIMEFRAME_EDITABLE_STATUSES = ["new_order", "processing"];

const SelectDateandTime = ({
  data,
  stateChanger,
  addressesChanged,
  ...rest
}) => {
  const [fastest, setFastest] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const config = useConfig();
  const [timeframes, setTimeframes] = useState([]);

  // Check if timeframe can be edited
  const canEditTimeframe = TIMEFRAME_EDITABLE_STATUSES.includes(
    rest?.state?.status
  );

  // Helper function to format service names for display
  const formatServiceName = (serviceName) => {
    if (!serviceName) return serviceName;

    return serviceName
      .replace(/one_hour/gi, "1-hour")
      .replace(/three_hour/gi, "3-hour")
      .replace(/same_day/gi, "same-day")
      .replace(/_/g, "-"); // Replace any remaining underscores with hyphens
  };

  // Helper function to find preferred service (3-hour if available, otherwise fastest)
  const findPreferredService = (timeframesData) => {
    if (!Array.isArray(timeframesData) || timeframesData.length === 0) {
      return null;
    }

    // First, try to find a 3-hour service with available slots
    for (let i = 0; i < timeframesData.length; i++) {
      const service = timeframesData[i];
      if (
        service.slots &&
        service.slots.length > 0 &&
        service.service &&
        service.service.toLowerCase().includes("3") &&
        service.service.toLowerCase().includes("hour")
      ) {
        return {
          service: service.service,
          start_time: service.slots[0].start_time,
          end_time: service.slots[0].end_time,
        };
      }
    }

    // If no 3-hour service found, fall back to the first available service (fastest)
    for (let i = 0; i < timeframesData.length; i++) {
      const service = timeframesData[i];
      if (service.slots && service.slots.length > 0) {
        return {
          service: service.service,
          start_time: service.slots[0].start_time,
          end_time: service.slots[0].end_time,
        };
      }
    }

    return null;
  };

  const addTodoMutation = useMutation({
    mutationFn: (getTimeframes) => {
      // Don't pass order_id when addresses changed (backend will return fresh slots)
      const orderId = addressesChanged ? "" : rest?.state?.order_id;
      const orderParam = orderId ? `&order_id=${orderId}` : "";

      return axios.post(
        url +
          "/slots?date=" +
          (moment(selectedDate).format("MM-DD-YYYY") ||
            moment().format("YYYY-MM-DD")) +
          orderParam,
        rest?.state,
        config
      );
    },
    onSuccess: (response) => {
      const timeframesData = response?.data?.data || [];

      if (Array.isArray(timeframesData) && timeframesData.length > 0) {
        setTimeframes(timeframesData);

        // Only auto-select for new orders or when addresses changed
        if (rest?.state?.status == "new_order" || addressesChanged) {
          const preferredService = findPreferredService(timeframesData);
          if (preferredService) {
            setFastest(preferredService);
            stateChanger({
              ...rest?.state,
              timeframe: preferredService,
            });
          }
        } else {
          // For other cases, just set fastest for the recharge button
          const preferredService = findPreferredService(timeframesData);
          if (preferredService) {
            setFastest(preferredService);
          }
        }
      } else {
        setTimeframes([]);
      }
    },
    onError: (error) => {
      setTimeframes([]);
    },
  });

  // Set initial date for timeframe
  useEffect(() => {
    if (rest?.state?.timeframe?.start_time) {
      // For existing orders with timeframe, use the timeframe's date in UTC to preserve calendar date
      const timeframeDate = moment(rest.state.timeframe.start_time).format(
        "YYYY-MM-DD"
      );
      setSelectedDate(timeframeDate);
    } else if (rest?.state?.status === "new_order" && !selectedDate) {
      // For new orders without timeframe, use today or tomorrow if after 6pm
      const defaultDate =
        moment().hours() > 18
          ? moment().add(1, "days").format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD");
      setSelectedDate(defaultDate);
    }
  }, [rest?.state?.timeframe?.start_time, rest?.state?.status]);

  // Reloading timeframe
  useEffect(() => {
    if (isCompleted(rest?.state).pickup && isCompleted(rest?.state).delivery) {
      // Only fetch slots when timeframe can be edited
      if (canEditTimeframe && selectedDate) {
        setTimeframes([]);
        addTodoMutation.mutate(rest?.state);
      } else {
        // Timeframe can't be edited - just display current timeframe without API call
        const currentTimeframe = rest?.state?.timeframe;
        if (currentTimeframe?.start_time && currentTimeframe?.end_time) {
          setTimeframes([
            {
              service: currentTimeframe.service,
              slots: [
                {
                  start_time: currentTimeframe.start_time,
                  end_time: currentTimeframe.end_time,
                },
              ],
            },
          ]);
          setFastest({
            service: currentTimeframe.service,
            start_time: currentTimeframe.start_time,
            end_time: currentTimeframe.end_time,
          });
        }
      }
    } else if (
      rest?.state?.status != "new_order" &&
      rest?.state?.timeframe?.start_time
    ) {
      // If pickup/delivery incomplete but we have a timeframe (editing existing order)
      setTimeframes([
        {
          service: rest?.state?.timeframe?.service,
          slots: [
            {
              start_time: rest?.state?.timeframe?.start_time,
              end_time: rest?.state?.timeframe?.end_time,
            },
          ],
        },
      ]);
      setFastest({
        service: rest?.state?.timeframe?.service,
        start_time: rest?.state?.timeframe?.start_time,
        end_time: rest?.state?.timeframe?.end_time,
      });
    } else {
      setTimeframes([]);
    }
  }, [
    rest?.state?.pickup,
    rest?.state?.delivery,
    rest?.state?.status,
    addressesChanged,
    canEditTimeframe,
    selectedDate,
  ]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    if (isCompleted(rest?.state).pickup && isCompleted(rest?.state).delivery) {
      addTodoMutation.mutate(rest?.state);
    }
  };

  const handleServiceSelection = (item, index) => {
    if (!item.slots || item.slots.length < 1) return;

    stateChanger({
      ...rest?.state,
      timeframe: {
        ...rest?.state?.timeframe,
        service: item?.service,
        start_time: item?.slots[0].start_time,
        end_time: item?.slots[0].end_time,
      },
    });
  };

  const handleTimeSlotChange = (e) => {
    const [start_time, end_time] = e.target.value.split(";");
    stateChanger({
      ...rest?.state,
      timeframe: {
        ...rest?.state?.timeframe,
        start_time,
        end_time,
      },
    });
  };

  // Get current service slots based on service name (not service_id)
  const getCurrentServiceSlots = () => {
    const currentService = rest?.state?.timeframe?.service;
    if (!currentService || !Array.isArray(timeframes)) {
      return [];
    }

    // Find the service by name
    const serviceData = timeframes.find((tf) => tf.service === currentService);
    return serviceData?.slots || [];
  };

  // Check if pickup and delivery are completed
  const isPickupDeliveryCompleted =
    isCompleted(rest?.state).pickup && isCompleted(rest?.state).delivery;

  // Check if current timeframe matches the fastest option
  const isCurrentTimeframeFastest = () => {
    if (
      !fastest?.start_time ||
      !fastest?.end_time ||
      !rest?.state?.timeframe?.start_time ||
      !rest?.state?.timeframe?.end_time
    ) {
      return true; // Don't show recharge if we don't have complete data
    }

    return (
      rest?.state?.timeframe?.start_time === fastest?.start_time &&
      rest?.state?.timeframe?.end_time === fastest?.end_time
    );
  };

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

        {/* Right Side - Recharge button */}
        {!isCurrentTimeframeFastest() &&
        isPickupDeliveryCompleted &&
        canEditTimeframe &&
        Object.keys(fastest).length > 0 ? (
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
              className="cursor-pointer"
            />
          </div>
        ) : null}
      </div>

      {/* Show clipart if pickup and delivery are not completed */}
      {!isPickupDeliveryCompleted ? (
        <div className="w-full grid grid-cols-1 gap-2.5 px-5 pb-3">
          <img src={clipart} alt="timeframe clipart" />
        </div>
      ) : (
        /* Forms Data */
        <div className="w-full grid grid-cols-3 gap-2.5 px-5 pb-6 mt-4">
          {/* Service Selection */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Service <span className="text-themeRed">*</span>
            </label>
            <div className="flex items-center gap-3 mt-1">
              {Array.isArray(timeframes) &&
                timeframes?.map((item, index) => (
                  <p
                    onClick={() =>
                      canEditTimeframe &&
                      item.slots &&
                      item.slots.length > 0 &&
                      handleServiceSelection(item, index)
                    }
                    key={index}
                    className={`text-sm transition-colors ${
                      !canEditTimeframe
                        ? "cursor-not-allowed opacity-50"
                        : !item.slots || item.slots.length < 1
                        ? "text-gray-400 line-through cursor-not-allowed"
                        : rest?.state?.timeframe?.service === item?.service
                        ? "font-bold cursor-pointer"
                        : "cursor-pointer font-normal hover:text-themeOrange transition-color"
                    }`}
                  >
                    {formatServiceName(item?.service)}
                  </p>
                ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Date <span className="text-themeRed">*</span>
            </label>
            <div className="border-b border-b-contentBg pb-[2px] mt-1">
              <input
                type="date"
                className="w-full text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                value={selectedDate}
                onChange={handleDateChange}
                min={moment().format("YYYY-MM-DD")}
                disabled={!canEditTimeframe}
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Time Slot <span className="text-themeRed">*</span>
            </label>
            <div className="flex items-center gap-1 border-b border-b-contentBg pb-1 mt-1">
              <select
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                id="timeframe"
                value={
                  rest?.state?.timeframe?.start_time &&
                  rest?.state?.timeframe?.end_time
                    ? rest?.state?.timeframe?.start_time +
                      ";" +
                      rest?.state?.timeframe?.end_time
                    : ""
                }
                onChange={handleTimeSlotChange}
                disabled={!canEditTimeframe}
              >
                <option value="">Select time slot</option>
                {getCurrentServiceSlots().map((slot) => (
                  <option
                    key={slot.start_time + ";" + slot.end_time}
                    value={slot.start_time + ";" + slot.end_time}
                  >
                    {moment(slot.start_time).format("hh:mm A") +
                      " - " +
                      moment(slot.end_time).format("hh:mm A")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectDateandTime;
