const StatusBtn = ({ type }: { type: string }) => {
  // defining styles
  const processingStyle = "bg-processingBtn text-themeDarkOrange";
  const assignedStyle = "bg-assignBtn text-themeBlue";
  const pickedStyle = "bg-pickedBtn text-black";
  const deliveredStyle = "bg-deliveredBtn text-themeDarkGreen";
  const cancelledStyle = "bg-cancelledBtn text-themeLightRed";
  // New statuses use existing styles
  const paidStyle = "bg-green-100 text-green-800"; // New style for paid

  return (
    <div
      className={`w-24 h-7 text-xs rounded-[5px] flex items-center justify-center ${
        type === "processing"
          ? processingStyle
          : type === "assigned"
          ? assignedStyle
          : type === "arrived_at_pickup"
          ? assignedStyle
          : type === "arrived"
          ? assignedStyle
          : type === "picked_up"
          ? pickedStyle
          : type === "arrived_at_delivery"
          ? pickedStyle
          : type === "delivered"
          ? deliveredStyle
          : type === "completed"
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
          : type === "pending"
          ? processingStyle
          : type === "open"
          ? assignedStyle
          : type === "paid"
          ? paidStyle
          : type === "uncollectible"
          ? cancelledStyle
          : type === "void"
          ? pickedStyle
          : ""
      }`}
    >
      {type === "processing"
        ? "Processing"
        : type === "assigned"
        ? "Assigned"
        : type === "arrived"
        ? "Arrived"
        : type === "arrived_at_pickup"
        ? "Arrived"
        : type === "picked_up"
        ? "Picked-up"
        : type === "arrived_at_delivery"
        ? "Arrived"
        : type === "completed"
        ? "Completed"
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
        : type === "pending"
        ? "Pending"
        : type === "open"
        ? "Open"
        : type === "paid"
        ? "Paid"
        : type === "uncollectible"
        ? "Uncollectible"
        : type === "void"
        ? "Void"
        : null}
    </div>
  );
};

export default StatusBtn;
