import moment from "moment";

interface LogItems extends Array<LogItem> {}

const ProcessingInfo = ({ items }) => {
  return (
    <div className="w-full">
      <div className="relative w-full">
        {items?.logs?.map((item, index) => (
          <div
            key={item.log_id}
            className="flex items-end justify-between gap-2 pt-2.5"
          >
            {/* Left Side */}
            <div className="flex items-center gap-2.5">
              {/* Dot */}
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 ${
                  item.isCompleted === true
                    ? "bg-themeOrange border-transparent"
                    : "bg-white border-themeOrange"
                }`}
              ></div>
              <p
                className={`text-xs text-${
                  item.log === "processing"
                    ? "themeOrange font-bold"
                    : item.log == "assigned"
                    ? "themeBlue font-bold"
                    : item.log == "picked_up"
                    ? "themeBlack font-bold"
                    : item.log == "delivered"
                    ? "themeGreen font-bold"
                    : "black"
                }`}
              >
                {item.log === "processing"
                  ? "Order created by " + items?.source
                  : item.log == "assigned"
                  ? "Driver assigned"
                  : item.log == "arrived_at_pickup"
                  ? "Arrived at pickup"
                  : item.log == "picked_up"
                  ? "Order pick-up"
                  : item.log == "arrived_at_delivery"
                  ? "Arrived at delivery"
                  : item.log == "undeliverable"
                  ? "Driver unable to deliver"
                  : item.log == "delivered"
                  ? "Order Delivered"
                  : null}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-themeDarkGray">
                {moment(item.datetime).format("MMM Do")}
              </p>

              <p className="text-xs">
                {moment(item.datetime).format("h:mm a")}
              </p>
            </div>
            <div
              className={
                "w-full h-full border-l-2 border-l-themeOrange border-solid absolute left-1.5 bottom-1 z-10"
              }
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingInfo;
