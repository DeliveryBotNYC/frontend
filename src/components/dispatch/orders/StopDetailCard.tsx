// ========================================
// StopDetailCard.tsx - Fixed TypeScript errors
// ========================================

import React from "react";
import { StopIcon } from "../../reusable/StopIcon";
import StatusBtn from "../../reusable/StatusBtn";
import moment from "moment";

// Helper function to format time
const formatTime = (time: string | null): string => {
  return time ? moment(time).format("h:mm A") : "--";
};

interface StopAddress {
  address_id: number;
  street_address_1: string;
  house_number: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number | null;
  lon: number | null;
}

interface StopPickupOrder {
  pickup: {
    name: string;
  };
  order_id: number;
  status: string;
  items: never[];
  pickup_note?: string;
  start_time?: string;
  end_time?: string;
}

interface StopDeliveryOrder {
  order_id: number;
  status: string;
  items: never[];
  delivery_note?: string;
  start_time?: string;
  end_time?: string;
  delivery_picture?: string;
  delivery_signature?: string;
  delivery_recipient?: string;
}

interface StopOrderItem {
  name: string;
  phone: string;
  customer_id: number;
  suggested: string | null;
  eta: string | null;
  timeframe: {
    start_time: string;
    end_time: string;
  };
  status: string | null;
  o_order: number;
  pickup: {
    count?: number;
    orders?: StopPickupOrder[];
  };
  deliver: {
    count?: number;
    orders?: StopDeliveryOrder[];
  };
  address: StopAddress;
}

interface StopDetailCardProps {
  item: StopOrderItem;
  isExpanded: boolean;
  onToggle: (stopId: string) => void;
  isHovered?: boolean;
  onHover?: (stopId: string | null) => void;
}

const StopDetailCard: React.FC<StopDetailCardProps> = ({
  item,
  isExpanded,
  onToggle,
  isHovered = false,
  onHover,
}) => {
  //const totalOrders = (item.pickup?.count || 0) + (item.deliver?.count || 0);
  const hasPickup = (item.pickup?.count || 0) > 0;
  const hasDelivery = (item.deliver?.count || 0) > 0;

  // Create unique stop identifier
  const stopId = `${item.customer_id}-${item.o_order}`;

  const handleCardClick = (e: React.MouseEvent): void => {
    e.preventDefault();
    onToggle(stopId);
  };

  const handleMouseEnter = (): void => {
    onHover?.(stopId);
  };

  const handleMouseLeave = (): void => {
    onHover?.(null);
  };

  return (
    <div
      className={`px-4 py-2 cursor-pointer transition-all duration-200 ease-in-out ${
        isHovered
          ? "bg-gray-50"
          : isExpanded
          ? "bg-gray-50 border-l-2 border-gray-400"
          : "hover:bg-gray-50"
      }`}
      onClick={handleCardClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-2">
        {/* Left: Stop icon & Order info */}
        <div className="flex gap-3">
          <div
            style={{
              width: "48px",
              height: "38px",
              position: "relative",
            }}
            className={`transition-transform duration-200 ${
              isHovered
                ? "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                : ""
            }`}
          >
            <StopIcon
              stopNumber={item.o_order}
              hasPickup={hasPickup}
              hasDelivery={hasDelivery}
              bgColor={
                item.status === "completed"
                  ? "#B2D235"
                  : item.status === "cancelled"
                  ? "#f3f4f6"
                  : item.status === "processing"
                  ? "#E68A00"
                  : "#74C2F8"
              }
            />
          </div>

          {/* Customer & Address info */}
          <div className="flex flex-col justify-center">
            <div
              className={`text-sm font-medium mb-1 transition-colors duration-200 text-gray-900`}
            >
              {item.name}
            </div>
            <div
              className={`text-xs mb-2 transition-colors duration-200 text-gray-600`}
            >
              {item.address.street_address_1}, {item.address.city},{" "}
              {item.address.state} {item.address.zip}
            </div>
            <div
              className={`text-xs transition-colors duration-200 text-gray-500`}
            >
              {item.pickup?.count
                ? `${item.pickup.count} Pickup${
                    item.pickup.count > 1 ? "s" : ""
                  }`
                : ""}
              {item.pickup?.count && item.deliver?.count ? " • " : ""}
              {item.deliver?.count
                ? `${item.deliver.count} Deliver${
                    item.deliver.count > 1 ? "ies" : "y"
                  }`
                : ""}
            </div>
          </div>
        </div>

        {/* Right: Time Information & Status */}
        <div className="flex items-start gap-4">
          {/* Time Information - stacked vertically and right-aligned */}
          <div
            className={`flex flex-col items-end text-xs gap-1 transition-colors duration-200 text-gray-900`}
          >
            <div>
              {formatTime(item.timeframe.start_time)} -{" "}
              {formatTime(item.timeframe.end_time)}
            </div>
            <div>
              <span className={`transition-colors duration-200 text-gray-500`}>
                Suggested:
              </span>{" "}
              {formatTime(item.suggested)}
            </div>
            <div>
              <span className={`transition-colors duration-200 text-gray-500`}>
                ETA:
              </span>{" "}
              <span className="text-blue-600">{formatTime(item.eta)}</span>
            </div>
          </div>

          {/* Status Button */}
          <div className="flex-shrink-0">
            <StatusBtn type={item.status!} />
          </div>

          {/* Expansion indicator */}
          <span
            className={`text-gray-400 transform transition-all duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            ▶
          </span>
        </div>
      </div>
    </div>
  );
};

export default StopDetailCard;
