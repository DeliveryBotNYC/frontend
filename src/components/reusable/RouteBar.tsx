const RouteBar = ({ type, text }: { type: string; text: string }) => {
  // defining styles
  const processingStyle = "bg-processingBtn text-themeDarkOrange";
  const assignedStyle = "bg-assignBtn text-themeBlue";
  const pickedStyle = "bg-pickedBtn text-black";
  const deliveredStyle = "bg-deliveredBtn text-themeDarkGreen";
  const cancelledStyle = "bg-cancelledBtn text-themeLightRed";

  return (
    <div
      className={`w-full h-full text-xs rounded-[5px] flex items-center justify-center ${
        type === "created"
          ? assignedStyle
          : type === "assigned"
          ? pickedStyle
          : type === "started" || type === "completed"
          ? deliveredStyle
          : type === "dropped" || type === "missed"
          ? cancelledStyle
          : ""
      }`}
    >
      {text}
    </div>
  );
};

export default RouteBar;
