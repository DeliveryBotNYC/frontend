import { jsx as _jsx } from "react/jsx-runtime";
const Progressbar = ({ status, value }) => {
    // Main Bg
    const processingBg = "bg-processingBtn";
    const assignedBg = "bg-assignBtn";
    const pickedBg = "bg-pickedBtn";
    const deliveredBg = "bg-deliveredBtn";
    const cancelledBg = "bg-cancelledBtn";
    //Value Bg
    const processingValueBg = "bg-themeLightOrange";
    const assignedValueBg = "bg-themeBlue";
    const pickedValueBg = "bg-black";
    const deliveredValueBg = "bg-themeDarkGreen";
    const cancelledValueBg = "bg-themeLightRed";
    {
        status === "processing"
            ? (value = "0%")
            : status === "assigned"
                ? (value = "25%")
                : status === "arrived_at_pickup"
                    ? (value = "30%")
                    : status === "picked_up"
                        ? (value = "50%")
                        : status === "arrived_at_delivery"
                            ? (value = "75%")
                            : status === "delivered"
                                ? (value = "100%")
                                : status === "returned"
                                    ? (value = "100%")
                                    : status === "canceled"
                                        ? (value = "100%")
                                        : status === "undeliverable"
                                            ? (value = "75%")
                                            : null;
    }
    return (_jsx("div", { className: `w-full h-2 ${status === "processing"
            ? processingBg
            : status === "assigned"
                ? assignedBg
                : status === "arrived_at_pickup"
                    ? assignedBg
                    : status === "picked_up"
                        ? pickedBg
                        : status === "arrived_at_delivery"
                            ? pickedBg
                            : status === "delivered"
                                ? deliveredBg
                                : status === "returned"
                                    ? cancelledBg
                                    : status === "canceled"
                                        ? cancelledBg
                                        : status === "undeliverable"
                                            ? cancelledBg
                                            : null} rounded-full relative mb-2.5`, children: _jsx("div", { style: {
                width: value,
            }, className: `h-full absolute left-0 top-0 ${status === "processing"
                ? processingValueBg
                : status === "assigned"
                    ? assignedValueBg
                    : status === "arrived_at_pickup"
                        ? assignedValueBg
                        : status === "picked_up"
                            ? pickedValueBg
                            : status === "arrived_at_delivery"
                                ? pickedValueBg
                                : status === "delivered"
                                    ? deliveredValueBg
                                    : status === "returned"
                                        ? cancelledValueBg
                                        : status === "canceled"
                                            ? cancelledValueBg
                                            : status === "undeliverable"
                                                ? cancelledValueBg
                                                : null} rounded-full` }) }));
};
export default Progressbar;
