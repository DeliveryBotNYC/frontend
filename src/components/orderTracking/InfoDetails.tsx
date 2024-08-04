import moment from "moment";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

interface LogItems extends Array<LogItem> {}

const ProcessingInfo = ({ items }) => {
  const contextValue = useContext(ThemeContext);
  return (
    <div className="w-full">
      {items?.logs?.map((item, index) =>
        contextValue?.activeSwitch ||
        item.log === "processing" ||
        item.log === "assigned" ||
        item.log === "picked_up" ||
        item.log === "delivered" ||
        item.log === "returned" ||
        item.log === "undeliverable" ||
        item.log === "canceled" ? (
          <div className="relative w-full" key={index}>
            <div
              key={item.log_id}
              className="flex items-end justify-between gap-2 pt-2.5"
            >
              {/* Left Side */}
              <div className="flex items-start gap-2.5">
                {/* Dot */}
                <div
                  className={`w-3.5 h-3.5 rounded-full border-2 ${
                    item.is_completed === true
                      ? "bg-themeOrange border-transparent"
                      : "bg-white border-themeOrange"
                  }`}
                ></div>
                <div>
                  <p
                    className={`text-xs text-${
                      item.log === "processing" && item.is_completed === true
                        ? "themeOrange font-bold"
                        : item.log == "assigned" && item.is_completed === true
                        ? "themeBlue font-bold"
                        : item.log == "picked_up" && item.is_completed === true
                        ? "black font-bold"
                        : item.log == "delivered" && item.is_completed === true
                        ? "themeDarkGreen font-bold"
                        : "black"
                    }`}
                  >
                    {item.log === "processing"
                      ? "Order created (" + item.by + ")"
                      : item.log == "assigned"
                      ? "Driver assigned"
                      : item.log == "arrived_at_pickup"
                      ? "Arrived at pickup"
                      : item.log == "picked_up"
                      ? "Order picked-up"
                      : item.log == "arrived_at_delivery"
                      ? "Arrived at delivery"
                      : item.log == "undeliverable"
                      ? "Driver unable to deliver"
                      : item.log == "delivered"
                      ? "Order Delivered"
                      : item.log == "texted_pickup"
                      ? "Driver texted pickup"
                      : item.log == "called_pickup"
                      ? "Driver called pickup"
                      : item.log == "texted_delivery"
                      ? "Driver texted delivery"
                      : item.log == "called_delivery"
                      ? "Driver called delivery"
                      : item.log == "automation_texted_pickup"
                      ? "Automated text to pickup"
                      : item.log == "automation_texted_delivery"
                      ? "Automated text to delivery"
                      : item.log == "automation_emailed_delivery"
                      ? "Automated email to delivery"
                      : item.log == "automation_emailed_pickup"
                      ? "Automated email to pickup"
                      : item.log}
                  </p>
                  {item.log == "automation_texted_pickup" ||
                  item.log == "automation_texted_delivery" ||
                  item.log == "automation_emailed_pickup" ||
                  item.log == "automation_emailed_delivery" ? (
                    <p className="text-[10px] text-secondaryBtnBorder">
                      {item.value}
                    </p>
                  ) : null}
                </div>
              </div>
              <div>
                <p className="text-[11px] text-themeDarkGray text-right">
                  {moment(item.datetime).format("MMM Do")}
                </p>

                <p className="text-xs">
                  {item.is_completed
                    ? moment(item.datetime).format("h:mm a")
                    : moment(item.datetime.start).format("h:mm a") +
                      " - " +
                      moment(item.datetime.end).format("h:mm a")}
                </p>
              </div>
            </div>
            {/* Left Side */}
            {index != 0 ? (
              <div
                className={`w-full h-[calc(100%-0.8rem)] border-l-2 border-l-themeOrange ${
                  items.logs[index - 1]?.is_completed === true
                    ? "border-solid"
                    : "border-dashed"
                } absolute left-1.5 bottom-3.5 z-10`}
              ></div>
            ) : null}
          </div>
        ) : null
      )}
    </div>
  );
};

export default ProcessingInfo;
