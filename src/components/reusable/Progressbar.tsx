const Progressbar = ({ status, value }: { status: string; value: string }) => {
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
      : status === "picked_up"
      ? (value = "50%")
      : status === "delivered"
      ? (value = "100%")
      : status === "returned"
      ? (value = "100%")
      : status === "canceled"
      ? (value = "100%")
      : null;
  }

  return (
    <div
      className={`w-full h-2 ${
        status === "processing"
          ? processingBg
          : status === "assigned"
          ? assignedBg
          : status === "picked_up"
          ? pickedBg
          : status === "delivered"
          ? deliveredBg
          : status === "returned"
          ? cancelledBg
          : status === "canceled"
          ? cancelledBg
          : null
      } rounded-full relative mb-2.5`}
    >
      {/* Value of the progressbar */}

      <div
        style={{
          width: value,
        }}
        className={`h-full absolute left-0 top-0 ${
          status === "processing"
            ? processingValueBg
            : status === "assigned"
            ? assignedValueBg
            : status === "picked_up"
            ? pickedValueBg
            : status === "delivered"
            ? deliveredValueBg
            : status === "returned"
            ? cancelledValueBg
            : status === "canceled"
            ? cancelledValueBg
            : null
        } rounded-full`}
      ></div>
    </div>
  );
};

export default Progressbar;
