import { useMemo, useState, useRef, useEffect } from "react";
import moment from "moment";

interface RouteData {
  route_id: string;
  status:
    | "assigned"
    | "created"
    | "started"
    | "missed_arrived"
    | "completed"
    | "acknowledged";
  date?: string;
  created_at?: string;
  completed_at?: string;
  views?: {
    views: number;
    available_now: number;
    viewers?: {
      driver_id: number;
      first_name: string;
      last_name: string;
      views: string[]; // This contains the datetime strings
    }[];
  };
  stops?: {
    completed: number;
    total: number;
  };
}

interface RouteBarProps {
  data: RouteData;
}

interface TooltipPosition {
  top: number;
  left: number;
  width: number;
}

const RouteBar = ({ data }: RouteBarProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    width: 0,
  });

  // Update tooltip position when it becomes visible
  useEffect(() => {
    if (showTooltip && barRef.current) {
      const rect = barRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [showTooltip]);

  const routeInfo = useMemo(() => {
    const now = moment();

    switch (data.status) {
      case "assigned":
      case "acknowledged": {
        if (!data.date)
          return { text: "Assigned", progress: 0, color: "#74C2F8" };

        const routeDate = moment(data.date);
        const timeDiff = routeDate.diff(now);
        const isFuture = timeDiff > 0;
        const duration = moment.duration(Math.abs(timeDiff));
        const hours = Math.floor(duration.asHours());
        const minutes = Math.floor(duration.asMinutes()) % 60;

        const timeText = isFuture
          ? `in ${hours}h ${minutes}m`
          : `${hours}h ${minutes}m ago`;

        return {
          text: timeText,
          progress: 0,
          color: "#74C2F8",
        };
      }

      case "created": {
        // Handle new views format
        const viewsData = data.views || { views: 0, available_now: 0 };
        const viewsSeen = viewsData.views || 0;
        const totalAvailable = viewsData.available_now || 0;
        const progress =
          totalAvailable > 0 ? (viewsSeen / totalAvailable) * 100 : 0;

        let timeText = "";
        if (data.created_at) {
          const createdDate = moment(data.created_at);
          const minutes = now.diff(createdDate, "minutes");
          timeText = ` - ${minutes} min ago`;
        }

        return {
          text: `${viewsSeen} / ${totalAvailable} views${timeText}`,
          progress,
          color: "#74C2F8",
          hasViewerDetails: !!viewsData.viewers?.length,
        };
      }

      case "started": {
        const stops = data.stops || { completed: 0, total: 0 };
        const progress =
          stops.total > 0 ? (stops.completed / stops.total) * 100 : 0;

        return {
          text: `${stops.completed} / ${stops.total} stops`,
          progress,
          color: "#B2D235",
        };
      }

      case "missed_arrived": {
        return {
          text: "Missed",
          progress: 100,
          color: "#F03F3F",
        };
      }

      case "completed": {
        const stops = data.stops || { completed: 0, total: 0 };
        let timeText = "";

        if (data.completed_at && data.date) {
          const completedDate = moment(data.completed_at);
          const scheduledDate = moment(data.date);
          const minutes = completedDate.diff(scheduledDate, "minutes");

          if (minutes > 0) {
            timeText = ` - ${minutes} min late`;
          } else if (minutes < 0) {
            timeText = ` - ${Math.abs(minutes)} min early`;
          }
        }

        return {
          text: `${stops.completed} / ${stops.total} stops${timeText}`,
          progress: 100,
          color: "#B2D235",
        };
      }

      default:
        return {
          text: "Unknown",
          progress: 0,
          color: "#ACACAC",
        };
    }
  }, [data]);

  // Determine text color based on background for better contrast
  const getTextColor = (bgColor: string) => {
    // Simple contrast logic - in practice you might want more sophisticated color analysis
    const darkColors = ["#F03F3F"];
    return darkColors.includes(bgColor) ? "text-white" : "text-gray-800";
  };

  // Format view timestamp to readable format
  const formatViewTime = (dateTimeStr: string) => {
    return moment(dateTimeStr).format("MMM D, h:mm A");
  };

  return (
    <div
      className="relative w-full h-8 rounded-md overflow-hidden bg-gray-100"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      ref={barRef}
    >
      {/* Progress bar */}
      <div className="absolute inset-0 flex">
        <div
          className="h-full transition-all duration-300 ease-out"
          style={{
            width: `${routeInfo.progress}%`,
            backgroundColor: routeInfo.color,
            opacity: 0.3,
          }}
        />
        <div
          className="h-full bg-gray-300"
          style={{
            width: `${100 - routeInfo.progress}%`,
            opacity: 0.3,
          }}
        />
      </div>

      {/* Text overlay */}
      <div
        className={`absolute inset-0 flex items-center justify-center px-2 ${getTextColor(
          routeInfo.color
        )}`}
      >
        <span
          className={`text-xs font-medium text-center leading-tight text-${getTextColor(
            routeInfo.color
          )}`}
        >
          {routeInfo.text}
        </span>
      </div>

      {/* Tooltip for viewer details - fixed position approach */}
      {showTooltip &&
        data.status === "created" &&
        data.views?.viewers &&
        data.views.viewers.length > 0 && (
          <div
            className="fixed shadow-lg rounded-md p-3 bg-white z-50 text-xs"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              width: `${tooltipPosition.width}px`,
            }}
          >
            <ul className="space-y-2 max-h-48 overflow-y-auto">
              {data.views.viewers.map((viewer) => (
                <li
                  key={viewer.driver_id}
                  className="border-b border-gray-100 pb-1"
                >
                  <div className="font-medium">
                    {viewer.first_name} {viewer.last_name}
                  </div>
                  <div className="text-gray-500">
                    <span className="text-xs">
                      {viewer.views.length > 1
                        ? `${viewer.views.length} views`
                        : "1 view"}
                    </span>
                    <ul className="pl-3 mt-1 text-gray-400 text-xs">
                      {viewer.views.map((viewTime, index) => (
                        <li key={index}>{formatViewTime(viewTime)}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
};

export default RouteBar;
