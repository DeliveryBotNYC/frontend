const RouteBar = ({ data }) => {
  // defining styles
  const processingStyle = "bg-processingBtn text-themeDarkOrange";
  const assignedStyle = "bg-assignBtn text-themeBlue";
  const pickedStyle = "bg-pickedBtn text-black";
  const deliveredStyle = "bg-deliveredBtn text-themeDarkGreen";
  const cancelledStyle = "bg-cancelledBtn text-themeLightRed";
  console.log(data?.value);
  return (
    <div
      className={`w-full h-full text-xs rounded-[5px] flex items-center justify-center text-black`}
    >
      <p className="absolute">{data?.text}</p>

      <div
        className={`w-[${data?.value}%] h-full bg-[#${data?.color}] bg-opacity-30 rounded-[5px]`}
      ></div>
      <div
        className={`w-[${
          100 - data?.value
        }%] h-full bg-[#ACACAC] bg-opacity-30 rounded-[5px]`}
      ></div>
    </div>
  );
};

export default RouteBar;
