import moment from "moment";
interface LogItem {
  log_id: number;
  order_id: number;
  log: string;
  datetime: string;
}

interface LogItems extends Array<LogItem> {}

const ProcessingInfo = ({ items }: { items: LogItems }) => {
  return (
    <div className="w-full">
      <div className="relative w-full">
        {items?.map((item) => (
          <div
            key={item.log_id}
            className="flex items-end justify-between gap-2 pt-2.5"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-themeOrange"></div>
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
                  ? "Order created"
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingInfo;
