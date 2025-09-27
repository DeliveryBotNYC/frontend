import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import moment from "moment";
import TimeIconFilled from "../../assets/timeFilled.svg";
import TimeIcon from "../../assets/time.svg";
import RechareIcon from "../../assets/recharge.svg";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { isCompleted } from "../reusable/functions";
import clipart from "../../assets/timeframeClipArt.svg";
import { useConfig, url } from "../../hooks/useConfig";
const SelectDateandTime = ({ data, stateChanger, ...rest }) => {
    const [fastest, setFastest] = useState({});
    const [selectedDate, setSelectedDate] = useState(moment().hours() > 18
        ? moment().add(1, "days").format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD"));
    const config = useConfig();
    const [timeframes, setTimeframes] = useState([]);
    // Helper function to find preferred service (3-hour if available, otherwise fastest)
    const findPreferredService = (timeframesData) => {
        if (!Array.isArray(timeframesData) || timeframesData.length === 0) {
            return null;
        }
        // First, try to find a 3-hour service with available slots
        for (let i = 0; i < timeframesData.length; i++) {
            const service = timeframesData[i];
            if (service.slots &&
                service.slots.length > 0 &&
                service.service &&
                service.service.toLowerCase().includes("3") &&
                service.service.toLowerCase().includes("hour")) {
                return {
                    service: service.service,
                    service_id: i,
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
                    service_id: i,
                    start_time: service.slots[0].start_time,
                    end_time: service.slots[0].end_time,
                };
            }
        }
        return null;
    };
    // Alternative helper function if service names are more structured
    const findPreferredServiceAlternative = (timeframesData) => {
        if (!Array.isArray(timeframesData) || timeframesData.length === 0) {
            return null;
        }
        // Define preferred service patterns (adjust based on your actual service names)
        const preferredPatterns = [
            /3\s*hour/i, // "3 hour", "3-hour", "3hour"
            /same\s*day/i, // "same day"
            /standard/i, // "standard"
        ];
        // Try to find services matching preferred patterns
        for (const pattern of preferredPatterns) {
            for (let i = 0; i < timeframesData.length; i++) {
                const service = timeframesData[i];
                if (service.slots &&
                    service.slots.length > 0 &&
                    service.service &&
                    pattern.test(service.service)) {
                    return {
                        service: service.service,
                        service_id: i,
                        start_time: service.slots[0].start_time,
                        end_time: service.slots[0].end_time,
                    };
                }
            }
        }
        // Fall back to first available service
        for (let i = 0; i < timeframesData.length; i++) {
            const service = timeframesData[i];
            if (service.slots && service.slots.length > 0) {
                return {
                    service: service.service,
                    service_id: i,
                    start_time: service.slots[0].start_time,
                    end_time: service.slots[0].end_time,
                };
            }
        }
        return null;
    };
    const addTodoMutation = useMutation({
        mutationFn: (getTimeframes) => axios.post(url + "/slots?date=" + moment(selectedDate).format("MM-DD-YYYY"), rest?.state, config),
        onSuccess: (response) => {
            // The API response structure is: response.data.data (nested data)
            const timeframesData = response?.data?.data || [];
            if (Array.isArray(timeframesData) && timeframesData.length > 0) {
                // Find preferred service (3-hour if available, otherwise fastest)
                const preferredService = findPreferredService(timeframesData);
                if (preferredService) {
                    setFastest(preferredService);
                    if (rest?.state?.status == "new_order") {
                        stateChanger({
                            ...rest?.state,
                            timeframe: preferredService,
                        });
                        setTimeframes(timeframesData);
                    }
                    else if (moment().isBefore(moment(rest?.state?.timeframe?.start_time))) {
                        setTimeframes(timeframesData);
                    }
                    else {
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
                    }
                }
                else {
                    setTimeframes(timeframesData);
                }
            }
            else {
                setTimeframes([]);
            }
        },
        onError: (error) => {
            setTimeframes([]);
        },
    });
    // Initial date for timeframe in edit
    useEffect(() => {
        if (rest?.state?.status != "new_order" &&
            rest?.state?.timeframe?.start_time) {
            setSelectedDate(moment(rest?.state?.timeframe?.start_time).format("YYYY-MM-DD"));
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
        }
    }, [rest?.state?.timeframe]);
    // Reloading timeframe
    useEffect(() => {
        if (isCompleted(rest?.state).pickup && isCompleted(rest?.state).delivery) {
            if (rest?.state?.status == "new_order" ||
                !timeframes[0] ||
                (rest?.state?.status == "processing" &&
                    rest?.state?.pickup?.location?.address_id !=
                        data?.pickup?.location?.address_id)) {
                setTimeframes([]);
                addTodoMutation.mutate(rest?.state);
            }
        }
        else if (rest?.state?.status != "new_order" && rest?.state?.timeframe) {
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
        }
        else {
            setTimeframes([]);
        }
    }, [rest?.state?.pickup, rest?.state?.delivery]);
    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
        if (isCompleted(rest?.state).pickup && isCompleted(rest?.state).delivery) {
            addTodoMutation.mutate(rest?.state);
        }
    };
    const handleServiceSelection = (item, index) => {
        if (!item.slots || item.slots.length < 1)
            return;
        stateChanger({
            ...rest?.state,
            timeframe: {
                ...rest?.state?.timeframe,
                service: item?.service,
                service_id: index,
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
    // Get current service slots based on service_id
    const getCurrentServiceSlots = () => {
        const serviceId = rest?.state?.timeframe?.service_id || 0;
        // Ensure timeframes is an array and has the service at the given index
        if (Array.isArray(timeframes) && timeframes[serviceId]) {
            return timeframes[serviceId]?.slots || [];
        }
        return [];
    };
    // Check if pickup and delivery are completed
    const isPickupDeliveryCompleted = isCompleted(rest?.state).pickup && isCompleted(rest?.state).delivery;
    // Check if current timeframe matches the fastest option
    const isCurrentTimeframeFastest = () => {
        if (!fastest?.start_time ||
            !fastest?.end_time ||
            !rest?.state?.timeframe?.start_time ||
            !rest?.state?.timeframe?.end_time) {
            return true; // Don't show recharge if we don't have complete data
        }
        return (rest?.state?.timeframe?.start_time === fastest?.start_time &&
            rest?.state?.timeframe?.end_time === fastest?.end_time);
    };
    return (_jsxs("div", { className: "w-full bg-white rounded-2xl my-5", children: [_jsxs("div", { className: "py-5 px-2.5 flex items-center justify-between gap-2.5", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("img", { src: isCompleted(rest?.state).timeframe &&
                                    isCompleted(rest?.state).pickup &&
                                    isCompleted(rest?.state).delivery
                                    ? TimeIconFilled
                                    : TimeIcon, alt: "icon" }), _jsx("p", { className: "text-2xl text-black font-bold heading", children: "Time" })] }), !isCurrentTimeframeFastest() &&
                        isPickupDeliveryCompleted &&
                        rest?.state?.status === "new_order" &&
                        Object.keys(fastest).length > 0 ? (_jsx("div", { children: _jsx("img", { onClick: () => {
                                stateChanger({
                                    ...rest?.state,
                                    timeframe: fastest,
                                });
                            }, src: RechareIcon, alt: "refresh-icon", className: "cursor-pointer" }) })) : null] }), !isPickupDeliveryCompleted ? (_jsx("div", { className: "w-full grid grid-cols-1 gap-2.5 px-5 pb-3", children: _jsx("img", { src: clipart, alt: "timeframe clipart" }) })) : (
            /* Forms Data */
            _jsxs("div", { className: "w-full grid grid-cols-3 gap-2.5 px-5 pb-6 mt-4", children: [_jsxs("div", { className: "w-full", children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: ["Service ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("div", { className: "flex items-center gap-3 mt-1", children: Array.isArray(timeframes) &&
                                    timeframes?.map((item, index) => (_jsx("p", { onClick: () => handleServiceSelection(item, index), className: `text-sm cursor-pointer transition-colors ${!item.slots || item.slots.length < 1
                                            ? "text-gray-400 line-through cursor-not-allowed"
                                            : rest?.state?.timeframe?.service === item?.service
                                                ? "font-bold"
                                                : "text font-normal hover:text-themeOrange transition-color;"}`, children: item?.service }, index))) })] }), _jsxs("div", { className: "w-full", children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: ["Date ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("div", { className: "border-b border-b-contentBg pb-[2px] mt-1", children: _jsx("input", { type: "date", className: "w-full text-sm outline-none", value: selectedDate, onChange: handleDateChange, min: moment().format("YYYY-MM-DD") }) })] }), _jsxs("div", { className: "w-full", children: [_jsxs("label", { className: "text-themeDarkGray text-xs", children: ["Time Slot ", _jsx("span", { className: "text-themeRed", children: "*" })] }), _jsx("div", { className: "flex items-center gap-1 border-b border-b-contentBg pb-1 mt-1", children: _jsxs("select", { className: "w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 outline-none", id: "timeframe", value: rest?.state?.timeframe?.start_time &&
                                        rest?.state?.timeframe?.end_time
                                        ? rest?.state?.timeframe?.start_time +
                                            ";" +
                                            rest?.state?.timeframe?.end_time
                                        : "", onChange: handleTimeSlotChange, children: [_jsx("option", { value: "", children: "Select time slot" }), getCurrentServiceSlots().map((slot) => (_jsx("option", { value: slot.start_time + ";" + slot.end_time, children: moment(slot.start_time).format("hh:mm A") +
                                                " - " +
                                                moment(slot.end_time).format("hh:mm A") }, slot.start_time + ";" + slot.end_time)))] }) })] })] }))] }));
};
export default SelectDateandTime;
