const OrderProcessing = () => {
  return (
    <div className="relative w-full">
      {/* Processing Box */}
      <div className="flex items-end justify-between gap-2 pt-2.5">
        {/* Left Side */}
        <div className="flex items-center gap-2.5">
          {/* Dot */}
          <div className="w-3.5 h-3.5 rounded-full bg-themeOrange"></div>

          {/* Text */}
          <p className="text-xs text-themeOrange font-bold">Order Processing</p>
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
      <div className="flex items-end justify-between gap-2 pt-2.5">
        {/* Left Side */}
        <div className="flex items-center gap-2.5">
          {/* Dot */}
          <div className="w-3.5 h-3.5 rounded-full bg-themeOrange"></div>

          {/* Text */}
          <p className="text-xs text-themeDarkGray">Route Assigned</p>
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
      <div className="w-[2px] h-full bg-themeOrange absolute left-1.5 bottom-[2px]"></div>
    </div>
  );
};

export default OrderProcessing;
