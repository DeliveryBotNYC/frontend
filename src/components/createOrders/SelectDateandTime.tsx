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
  const [showExtension, setShowExtension] = useState(false);

  const canEditTimeframe = TIMEFRAME_EDITABLE_STATUSES.includes(
    rest?.state?.status,
  );

  const formatServiceName = (serviceName) => {
    if (!serviceName) return serviceName;
    return serviceName
      .replace(/one_hour/gi, "1-hour")
      .replace(/three_hour/gi, "3-hour")
      .replace(/same_day/gi, "same-day")
      .replace(/_/g, "-");
  };

  const findPreferredService = (timeframesData) => {
    if (!Array.isArray(timeframesData) || timeframesData.length === 0)
      return null;

    for (let i = 0; i < timeframesData.length; i++) {
      const service = timeframesData[i];
      if (
        service.slots?.length > 0 &&
        service.service?.toLowerCase().includes("3") &&
        service.service?.toLowerCase().includes("hour")
      ) {
        return {
          service: service.service,
          start_time: service.slots[0].start_time,
          end_time: service.slots[0].end_time,
          pickup_ext: service.slots[0].pickup_ext ?? 0,
          delivery_ext: service.slots[0].delivery_ext ?? 0,
          pickup_ready_by: service.slots[0].pickup_ready_by ?? null,
          delivery_deadline: service.slots[0].delivery_deadline ?? null,
        };
      }
    }

    for (let i = 0; i < timeframesData.length; i++) {
      const service = timeframesData[i];
      if (service.slots?.length > 0) {
        return {
          service: service.service,
          start_time: service.slots[0].start_time,
          end_time: service.slots[0].end_time,
          pickup_ext: service.slots[0].pickup_ext ?? 0,
          delivery_ext: service.slots[0].delivery_ext ?? 0,
          pickup_ready_by: service.slots[0].pickup_ready_by ?? null,
          delivery_deadline: service.slots[0].delivery_deadline ?? null,
        };
      }
    }

    return null;
  };

  const addTodoMutation = useMutation({
    mutationFn: (getTimeframes) => {
      const orderId = addressesChanged ? "" : rest?.state?.order_id;
      const orderParam = orderId ? `&order_id=${orderId}` : "";
      return axios.post(
        url +
          "/slots?date=" +
          (moment(selectedDate).format("MM-DD-YYYY") ||
            moment().format("YYYY-MM-DD")) +
          orderParam,
        rest?.state,
        config,
      );
    },
    onSuccess: (response) => {
      const timeframesData = response?.data?.data || [];

      if (Array.isArray(timeframesData) && timeframesData.length > 0) {
        setTimeframes(timeframesData);

        if (rest?.state?.status == "new_order" || addressesChanged) {
          const preferredService = findPreferredService(timeframesData);
          if (preferredService) {
            setFastest(preferredService);
            stateChanger({
              ...rest?.state,
              timeframe: { ...preferredService },
            });
          }
        } else {
          const preferredService = findPreferredService(timeframesData);
          if (preferredService) setFastest(preferredService);
        }
      } else {
        setTimeframes([]);
      }
    },
    onError: () => setTimeframes([]),
  });

  useEffect(() => {
    if (rest?.state?.timeframe?.start_time) {
      const timeframeDate = moment(rest.state.timeframe.start_time).format(
        "YYYY-MM-DD",
      );
      setSelectedDate(timeframeDate);
    } else if (rest?.state?.status === "new_order" && !selectedDate) {
      const defaultDate =
        moment().hours() > 18
          ? moment().add(1, "days").format("YYYY-MM-DD")
          : moment().format("YYYY-MM-DD");
      setSelectedDate(defaultDate);
    }
  }, [rest?.state?.timeframe?.start_time, rest?.state?.status]);

  useEffect(() => {
    if (isCompleted(rest?.state).pickup && isCompleted(rest?.state).delivery) {
      if (canEditTimeframe && selectedDate) {
        setTimeframes([]);
        addTodoMutation.mutate(rest?.state);
      } else {
        const currentTimeframe = rest?.state?.timeframe;
        if (currentTimeframe?.start_time && currentTimeframe?.end_time) {
          setTimeframes([
            {
              service: currentTimeframe.service,
              slots: [
                {
                  start_time: currentTimeframe.start_time,
                  end_time: currentTimeframe.end_time,
                  pickup_ext: currentTimeframe.pickup_ext ?? 0,
                  delivery_ext: currentTimeframe.delivery_ext ?? 0,
                  pickup_ready_by: currentTimeframe.pickup_ready_by ?? null,
                  delivery_deadline: currentTimeframe.delivery_deadline ?? null,
                },
              ],
            },
          ]);
          setFastest({
            service: currentTimeframe.service,
            start_time: currentTimeframe.start_time,
            end_time: currentTimeframe.end_time,
            pickup_ext: currentTimeframe.pickup_ext ?? 0,
            delivery_ext: currentTimeframe.delivery_ext ?? 0,
            pickup_ready_by: currentTimeframe.pickup_ready_by ?? null,
            delivery_deadline: currentTimeframe.delivery_deadline ?? null,
          });
        }
      }
    } else if (
      rest?.state?.status != "new_order" &&
      rest?.state?.timeframe?.start_time
    ) {
      const tf = rest?.state?.timeframe;
      setTimeframes([
        {
          service: tf?.service,
          slots: [
            {
              start_time: tf?.start_time,
              end_time: tf?.end_time,
              pickup_ext: tf?.pickup_ext ?? 0,
              delivery_ext: tf?.delivery_ext ?? 0,
              pickup_ready_by: tf?.pickup_ready_by ?? null,
              delivery_deadline: tf?.delivery_deadline ?? null,
            },
          ],
        },
      ]);
      setFastest({
        service: tf?.service,
        start_time: tf?.start_time,
        end_time: tf?.end_time,
        pickup_ext: tf?.pickup_ext ?? 0,
        delivery_ext: tf?.delivery_ext ?? 0,
        pickup_ready_by: tf?.pickup_ready_by ?? null,
        delivery_deadline: tf?.delivery_deadline ?? null,
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

  const handleServiceSelection = (item) => {
    if (!item.slots || item.slots.length < 1) return;
    const slot = item.slots[0];
    stateChanger({
      ...rest?.state,
      timeframe: {
        ...rest?.state?.timeframe,
        service: item?.service,
        start_time: slot.start_time,
        end_time: slot.end_time,
        pickup_ext: slot.pickup_ext ?? 0,
        delivery_ext: slot.delivery_ext ?? 0,
        pickup_ready_by: slot.pickup_ready_by ?? null,
        delivery_deadline: slot.delivery_deadline ?? null,
      },
    });
  };

  const handleTimeSlotChange = (e) => {
    const [start_time, end_time] = e.target.value.split(";");
    const slots = getCurrentServiceSlots();
    const matchedSlot = slots.find(
      (s) => s.start_time === start_time && s.end_time === end_time,
    );

    stateChanger({
      ...rest?.state,
      timeframe: {
        ...rest?.state?.timeframe,
        start_time,
        end_time,
        pickup_ext: matchedSlot?.pickup_ext ?? 0,
        delivery_ext: matchedSlot?.delivery_ext ?? 0,
        pickup_ready_by: matchedSlot?.pickup_ready_by ?? null,
        delivery_deadline: matchedSlot?.delivery_deadline ?? null,
      },
    });
  };

  const handlePickupReadyByChange = (e) => {
    const timeValue = e.target.value;
    if (!timeValue || !selectedDate) return;

    const slotStart = toTimeInput(rest?.state?.timeframe?.start_time);

    // Clamp: cannot be after slot start
    const clamped = timeValue > slotStart ? slotStart : timeValue;

    const isoValue = moment(
      `${selectedDate} ${clamped}`,
      "YYYY-MM-DD HH:mm",
    ).toISOString();
    stateChanger({
      ...rest?.state,
      timeframe: { ...rest?.state?.timeframe, pickup_ready_by: isoValue },
    });
  };

  const handleDeliveryDeadlineChange = (e) => {
    const timeValue = e.target.value;
    if (!timeValue || !selectedDate) return;

    const slotEnd = toTimeInput(rest?.state?.timeframe?.end_time);

    // Clamp: cannot be before slot end
    const clamped = timeValue < slotEnd ? slotEnd : timeValue;

    const isoValue = moment(
      `${selectedDate} ${clamped}`,
      "YYYY-MM-DD HH:mm",
    ).toISOString();
    stateChanger({
      ...rest?.state,
      timeframe: { ...rest?.state?.timeframe, delivery_deadline: isoValue },
    });
  };

  // Format ISO to just HH:mm for time input
  const toTimeInput = (isoString) => {
    if (!isoString) return "";
    return moment(isoString).format("HH:mm");
  };

  const getCurrentServiceSlots = () => {
    const currentService = rest?.state?.timeframe?.service;
    if (!currentService || !Array.isArray(timeframes)) return [];
    const serviceData = timeframes.find((tf) => tf.service === currentService);
    return serviceData?.slots || [];
  };

  const isPickupDeliveryCompleted =
    isCompleted(rest?.state).pickup && isCompleted(rest?.state).delivery;

  const isCurrentTimeframeFastest = () => {
    if (
      !fastest?.start_time ||
      !fastest?.end_time ||
      !rest?.state?.timeframe?.start_time ||
      !rest?.state?.timeframe?.end_time
    )
      return true;
    return (
      rest?.state?.timeframe?.start_time === fastest?.start_time &&
      rest?.state?.timeframe?.end_time === fastest?.end_time
    );
  };

  const toDatetimeLocal = (isoString) => {
    if (!isoString) return "";
    return moment(isoString).format("YYYY-MM-DDTHH:mm");
  };

  // Build slot option value including ready_by and deadline
  const slotOptionValue = (slot) =>
    `${slot.start_time};${slot.end_time};${slot.pickup_ext ?? 0};${slot.delivery_ext ?? 0}`;

  const currentSlotValue =
    rest?.state?.timeframe?.start_time && rest?.state?.timeframe?.end_time
      ? `${rest.state.timeframe.start_time};${rest.state.timeframe.end_time};${rest.state.timeframe.pickup_ext ?? 0};${rest.state.timeframe.delivery_ext ?? 0}`
      : "";

  return (
    <div className="w-full bg-white rounded-2xl my-5">
      {/* Header */}
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
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

        {!isCurrentTimeframeFastest() &&
        isPickupDeliveryCompleted &&
        canEditTimeframe &&
        Object.keys(fastest).length > 0 ? (
          <div>
            <img
              onClick={() =>
                stateChanger({ ...rest?.state, timeframe: fastest })
              }
              src={RechareIcon}
              alt="refresh-icon"
              className="cursor-pointer"
            />
          </div>
        ) : null}
      </div>

      {!isPickupDeliveryCompleted ? (
        <div className="w-full grid grid-cols-1 gap-2.5 px-5 pb-3">
          <img src={clipart} alt="timeframe clipart" />
        </div>
      ) : (
        <div className="w-full px-5 pb-6 mt-4">
          <div className="grid grid-cols-3 gap-x-6 gap-y-4">
            {/* Service Selection */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Service <span className="text-themeRed">*</span>
              </label>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {Array.isArray(timeframes) &&
                  timeframes?.map((item, index) => (
                    <p
                      onClick={() =>
                        canEditTimeframe &&
                        item.slots?.length > 0 &&
                        handleServiceSelection(item)
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
                      ? `${rest.state.timeframe.start_time};${rest.state.timeframe.end_time}`
                      : ""
                  }
                  onChange={handleTimeSlotChange}
                  disabled={!canEditTimeframe}
                >
                  <option value="">Select time slot</option>
                  {getCurrentServiceSlots().map((slot) => (
                    <option
                      key={`${slot.start_time};${slot.end_time}`}
                      value={`${slot.start_time};${slot.end_time}`}
                    >
                      {moment(slot.start_time).format("hh:mm A") +
                        " - " +
                        moment(slot.end_time).format("hh:mm A")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowExtension((prev) => !prev)}
                  className="text-xs text-themeOrange hover:underline disabled:text-themeDarkGray disabled:hover:no-underline mt-1"
                >
                  {showExtension
                    ? "Hide slot extension"
                    : "View slot extension"}
                </button>
              </div>
            </div>
          </div>

          {/* Extension fields */}
          {showExtension && (
            <div className="grid grid-cols-2 gap-x-6 mt-4 pt-4 border-t border-contentBg">
              {/* Pickup Ready By */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">
                  Pickup Ready By
                </label>
                <div className="border-b border-b-contentBg pb-[2px] mt-1">
                  <input
                    type="time"
                    className="w-full text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    value={toTimeInput(rest?.state?.timeframe?.pickup_ready_by)}
                    onChange={handlePickupReadyByChange}
                    max={toTimeInput(rest?.state?.timeframe?.start_time)}
                    disabled={!canEditTimeframe}
                  />
                </div>
                {rest?.state?.timeframe?.pickup_ext > 0 && (
                  <p className="text-xs text-themeDarkGray mt-0.5">
                    {rest.state.timeframe.pickup_ext} min before slot
                  </p>
                )}
              </div>

              {/* Delivery Deadline */}
              <div className="w-full">
                <label className="text-themeDarkGray text-xs">
                  Delivery Deadline
                </label>
                <div className="border-b border-b-contentBg pb-[2px] mt-1">
                  <input
                    type="time"
                    className="w-full text-sm outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    value={toTimeInput(
                      rest?.state?.timeframe?.delivery_deadline,
                    )}
                    onChange={handleDeliveryDeadlineChange}
                    min={toTimeInput(rest?.state?.timeframe?.end_time)}
                    disabled={!canEditTimeframe}
                  />
                </div>
                {rest?.state?.timeframe?.delivery_ext > 0 && (
                  <p className="text-xs text-themeDarkGray mt-0.5">
                    {rest.state.timeframe.delivery_ext} min after slot
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectDateandTime;
