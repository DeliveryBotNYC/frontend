const OrderAssigned = ({ isCompleted }: { isCompleted: boolean }) => {
  return (
    <div className="relative isolate">
      {/* Processing Box */}
      <div className="flex items-end justify-between gap-2.5 pt-5">
        {/* Left Side */}
        <div className="flex items-center gap-2.5">
          {/* Dot */}
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 ${
              isCompleted === true
                ? "bg-themeOrange border-transparent"
                : "bg-white border-themeOrange"
            }`}
          ></div>

          {/* Text */}
          <p className="text-xs text-themeDarkBlue font-bold">
            Driver Assigned
          </p>
        </div>

        {/* Right Side */}
        <div>
          {/* Date */}
          <p className="text-[11px] text-themeDarkGray">Jan 22</p>

          {/* Time */}
          <p className="text-xs">03:28 PM</p>
        </div>
      </div>

      {/* Router Assigned Box */}
      <div className="flex items-end justify-between gap-2.5 pt-5">
        {/* Left Side */}
        <div className="flex items-center gap-2.5">
          {/* Dot */}
          <div
            className={`w-3.5 h-3.5 rounded-full border-2 ${
              isCompleted === true
                ? "bg-themeOrange border-transparent"
                : "bg-white border-themeOrange"
            }`}
          ></div>

          {/* Text */}
          <p className="text-xs text-themeDarkGray">Added to route</p>
        </div>

        {/* Right Side */}
        <div>
          {/* Date */}
          <p className="text-[11px] text-themeDarkGray">Jan 22</p>

          {/* Time */}
          <p className="text-xs">03:28 PM</p>
        </div>
      </div>

      {/* Line */}
      <div
        className={`w-full h-full border-l-2 border-l-themeOrange ${
          isCompleted === true ? "border-solid" : "border-dashed"
        } absolute left-1.5 bottom-0 -z-10`}
      ></div>
    </div>
  );
};

export default OrderAssigned;
