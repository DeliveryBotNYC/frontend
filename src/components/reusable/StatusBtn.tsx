import { useMemo } from "react";

const STATUS_OPTIONS = [
  {
    value: "processing",
    label: "Processing",
    style: "bg-processingBtn text-themeDarkOrange",
  },
  {
    value: "assigned",
    label: "Assigned",
    style: "bg-assignBtn text-themeBlue",
  },
  {
    value: "arrived_at_pickup",
    label: "Arrived at Pickup",
    style: "bg-assignBtn text-themeBlue",
  },
  {
    value: "picked_up",
    label: "Picked Up",
    style: "bg-pickedBtn text-black",
  },
  {
    value: "arrived_at_delivery",
    label: "Arrived at Delivery",
    style: "bg-pickedBtn text-black",
  },
  {
    value: "delivered",
    label: "Delivered",
    style: "bg-deliveredBtn text-themeDarkGreen",
  },
  {
    value: "completed",
    label: "Completed",
    style: "bg-deliveredBtn text-themeDarkGreen",
  },
  {
    value: "canceled",
    label: "Canceled",
    style: "bg-cancelledBtn text-themeLightRed",
  },
  {
    value: "returned",
    label: "Returned",
    style: "bg-cancelledBtn text-themeLightRed",
  },
  {
    value: "undeliverable",
    label: "Undeliverable",
    style: "bg-cancelledBtn text-themeLightRed",
  },
  {
    value: "paid",
    label: "Paid",
    style: "bg-green-100 text-green-800",
  },
  {
    value: "uncollectible",
    label: "Uncollectible",
    style: "bg-cancelledBtn text-themeLightRed",
  },
  {
    value: "void",
    label: "Void",
    style: "bg-pickedBtn text-black",
  },
  {
    value: "ongoing",
    label: "Ongoing",
    style: "bg-processingBtn text-themeDarkOrange",
  },
  {
    value: "received",
    label: "Received",
    style: "bg-deliveredBtn text-themeDarkGreen",
  },
  {
    value: "failed",
    label: "Failed",
    style: "bg-cancelledBtn text-themeLightRed",
  },
  {
    value: "pending",
    label: "Pending",
    style: "bg-processingBtn text-themeDarkOrange",
  },
  {
    value: "open",
    label: "Open",
    style: "bg-assignBtn text-themeBlue",
  },
];

const StatusBtn = ({ type }: { type: string }) => {
  const { style, label } = useMemo(() => {
    const statusOption = STATUS_OPTIONS.find((opt) => opt.value === type);
    return {
      style: statusOption?.style || "bg-gray-100 text-gray-800",
      label: statusOption?.label || type,
    };
  }, [type]);

  return (
    <div
      className={`w-28 h-7 text-xs rounded-[5px] flex items-center justify-center ${style}`}
    >
      {label}
    </div>
  );
};

export default StatusBtn;
