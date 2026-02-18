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
    <div className="mt-1.5 mb-1">
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

      {textEntries.map(([type, value]) => (
        <p key={type} className="text-[10px] text-themeDarkGray mt-1">
          <span className="capitalize">{type}:</span>{" "}
          <span className="text-black">{value}</span>
        </p>
      ))}

      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center"
          onClick={() => setExpandedImage(null)}
        >
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

const LOG_LABELS: Record<string, string> = {
  route_assigned: "Order added to route",
  assigned: "Driver assigned",
  arrived_at_pickup: "Arrived at pickup",
  picked_up: "Order picked-up",
  arrived_at_delivery: "Arrived at delivery",
  undeliverable: "Driver unable to deliver",
  delivered: "Order Delivered",
  texted_pickup: "Driver texted pickup",
  called_pickup: "Driver called pickup",
  texted_delivery: "Driver texted delivery",
  called_delivery: "Driver called delivery",
  automation_texted_pickup: "Automated text to pickup",
  automation_texted_delivery: "Automated text to delivery",
  automation_emailed_delivery: "Automated email to delivery",
  automation_emailed_pickup: "Automated email to pickup",
  canceled: "Order Canceled",
};

const LOG_COLORS: Record<string, string> = {
  processing: "text-themeOrange font-bold",
  assigned: "text-themeBlue font-bold",
  picked_up: "text-black font-bold",
  delivered: "text-themeDarkGreen font-bold",
  canceled: "text-themeLightRed font-bold",
};

const ALWAYS_VISIBLE = [
  "processing",
  "assigned",
  "picked_up",
  "delivered",
  "returned",
  "undeliverable",
  "canceled",
];

const AUTOMATION_LOGS = [
  "automation_texted_pickup",
  "automation_texted_delivery",
  "automation_emailed_pickup",
  "automation_emailed_delivery",
];

const ProcessingInfo = ({ items }: { items: any }) => {
  const contextValue = useContext(ThemeContext);

  const reversedLogs = items?.logs ? [...items.logs].reverse() : [];

  const visibleLogs = reversedLogs.filter(
    (item: any) =>
      contextValue?.activeSwitch || ALWAYS_VISIBLE.includes(item.log),
  );

  return (
    <div className="w-full">
      {visibleLogs.map((item: any, index: number) => {
        const label =
          item.log === "processing"
            ? `Order created (${item.by})`
            : LOG_LABELS[item.log] || item.log;

        const colorClass = LOG_COLORS[item.log] || "text-black";
        const isFirst = index === 0;
        const isLast = index === visibleLogs.length - 1;

        return (
          <div className="flex gap-2.5 w-full" key={item.log_id || index}>
            {/* Timeline column - no padding, line segments fill gaps */}
            <div className="flex flex-col items-center w-3.5 shrink-0">
              {/* Above dot: line connector or spacer */}
              {isFirst ? (
                <div className="h-2.5" />
              ) : (
                <div className="w-0.5 bg-themeOrange h-2.5 z-10" />
              )}

              {/* Dot */}
              <div className="w-3.5 h-3.5 rounded-full border-2 bg-themeOrange border-white shrink-0 z-20" />

              {/* Below dot: line stretches to fill remaining height */}
              {!isLast && <div className="w-0.5 bg-themeOrange flex-1 z-10" />}
            </div>

            {/* Content column */}
            <div className="flex-1 min-w-0 pt-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-xs ${colorClass}`}>{label}</p>
                  {AUTOMATION_LOGS.includes(item.log) && (
                    <p className="text-[10px] text-secondaryBtnBorder">
                      {item.value}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <p className="text-[11px] text-themeDarkGray text-right">
                    {moment(item.datetime).format("MMM Do")}
                  </p>
                  <p className="text-xs text-right">
                    {moment(item.datetime).format("h:mm a")}
                  </p>
                </div>
              </div>

              {item.log === "picked_up" &&
                items?.pickup?.uploaded_verification && (
                  <ProofImages proofs={items.pickup.uploaded_verification} />
                )}

              {item.log === "delivered" &&
                items?.delivery?.uploaded_verification && (
                  <ProofImages proofs={items.delivery.uploaded_verification} />
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProcessingInfo;
