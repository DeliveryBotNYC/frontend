const StatusBtn = ({ type }: { type: string }) => {
  // defining styles
  const processingStyle = "bg-processingBtn text-themeDarkOrange";
  const assignedStyle = "bg-assignBtn text-themeBlue";
  const pickedStyle = "bg-pickedBtn text-black";
  const deliveredStyle = "bg-deliveredBtn text-themeDarkGreen";
  const cancelledStyle = "bg-cancelledBtn text-themeLightRed";

  return (
    <div
      className={`w-24 h-7 text-xs rounded-[5px] flex items-center justify-center ${
        type === "processing"
          ? processingStyle
          : type === "assigned"
          ? assignedStyle
          : type === "arrived_at_pickup"
          ? assignedStyle
          : type === "picked_up"
          ? pickedStyle
          : type === "arrived_at_delivery"
          ? pickedStyle
          : type === "delivered"
          ? deliveredStyle
          : type === "returned"
          ? cancelledStyle
          : type === "canceled"
          ? cancelledStyle
          : type === "undeliverable"
          ? cancelledStyle
          : type === "ongoing"
          ? processingStyle
          : type === "received"
          ? deliveredStyle
          : type === "failed"
          ? cancelledStyle
          : ""
      }`}
    >
      {type === "processing"
        ? "Processing"
        : type === "assigned"
        ? "Assigned"
        : type === "arrived_at_pickup"
        ? "Assigned"
        : type === "picked_up"
        ? "Picked-up"
        : type === "arrived_at_delivery"
        ? "Picked-up"
        : type === "delivered"
        ? "Delivered"
        : type === "returned"
        ? "Returned"
        : type === "canceled"
        ? "Canceled"
        : type === "undeliverable"
        ? "Undeliverable"
        : type === "ongoing"
        ? "Ongoing"
        : type === "received"
        ? "Received"
        : type === "failed"
        ? "Failed"
        : null}
    </div>
  );
};

export default StatusBtn;
