import moment from "moment";
import { useContext, useState } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const ProofImages = ({ proofs }: { proofs: Record<string, any> }) => {
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const entries = Object.entries(proofs || {}).filter(
    ([_, value]) => value !== null && value !== undefined,
  );

  if (entries.length === 0) return null;

  const isImageUrl = (value: string) =>
    typeof value === "string" &&
    value.startsWith("http") &&
    /\.(jpg|jpeg|png|webp|gif)/i.test(value);

  const imageEntries = entries.filter(([_, value]) => isImageUrl(value));
  const textEntries = entries.filter(
    ([type, value]) => !isImageUrl(value) && type !== "picture",
  );
  return (
    <div className="ml-6 mt-1.5 mb-1">
      {/* Image proofs */}
      {imageEntries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imageEntries.map(([type, value]) => (
            <div key={type} className="flex flex-col items-center">
              <img
                src={value}
                alt={type}
                className="w-14 h-14 object-cover rounded-md border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setExpandedImage(value)}
              />
              <p className="text-[9px] text-themeDarkGray mt-0.5 capitalize">
                {type}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Text proofs on their own lines */}
      {textEntries.map(([type, value]) => (
        <p key={type} className="text-[10px] text-themeDarkGray mt-1">
          <span className="capitalize">{type}:</span>{" "}
          <span className="text-black">{value}</span>
        </p>
      ))}

      {/* Expanded image overlay */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center"
          onClick={() => setExpandedImage(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
            onClick={() => setExpandedImage(null)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <img
            src={expandedImage}
            alt="proof"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

const ProcessingInfo = ({ items }: { items: any }) => {
  const contextValue = useContext(ThemeContext);

  const reversedLogs = items?.logs ? [...items.logs].reverse() : [];

  return (
    <div className="w-full">
      {reversedLogs?.map((item: any, index: number) =>
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
                {/* Dot - z-20 so it renders above the timeline line */}
                <div className="w-3.5 h-3.5 rounded-full border-2 bg-themeOrange border-white relative z-20"></div>
                <div>
                  <p
                    className={`text-xs text-${
                      item.log === "processing"
                        ? "themeOrange font-bold"
                        : item.log == "assigned"
                          ? "themeBlue font-bold"
                          : item.log == "picked_up"
                            ? "black font-bold"
                            : item.log == "delivered"
                              ? "themeDarkGreen font-bold"
                              : "black"
                    }`}
                  >
                    {item.log === "processing"
                      ? "Order created (" + item.by + ")"
                      : item.log == "route_assigned"
                        ? "Order added to route"
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
                                            : item.log ==
                                                "automation_texted_pickup"
                                              ? "Automated text to pickup"
                                              : item.log ==
                                                  "automation_texted_delivery"
                                                ? "Automated text to delivery"
                                                : item.log ==
                                                    "automation_emailed_delivery"
                                                  ? "Automated email to delivery"
                                                  : item.log ==
                                                      "automation_emailed_pickup"
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
                  {moment(item.datetime).format("h:mm a")}
                </p>
              </div>
            </div>

            {/* Pickup proof under picked_up log */}
            {item.log === "picked_up" && items?.pickup?.uploaded_proof && (
              <ProofImages proofs={items.pickup.uploaded_proof} />
            )}

            {/* Delivery proof under delivered log */}
            {item.log === "delivered" && items?.delivery?.uploaded_proof && (
              <ProofImages proofs={items.delivery.uploaded_proof} />
            )}

            {/* Timeline connector - stretches from top to just above the dot */}
            {index != 0 && (
              <div className="border-l-2 border-l-themeOrange border-solid absolute left-1.5 top-0 bottom-[0.85rem] z-10"></div>
            )}
          </div>
        ) : null,
      )}
    </div>
  );
};

export default ProcessingInfo;
