import moment from "moment";
import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import axios from "axios";
import { url, useConfig } from "../../hooks/useConfig";

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
  texted_pickup: "Driver texted customer",
  called_pickup: "Driver called customer",
  texted_delivery: "Driver texted customer",
  called_delivery: "Driver called customer",
  automation_texted_pickup: "Automated text to customer",
  automation_texted_delivery: "Automated text to customer",
  automation_emailed_delivery: "Automated email to customer",
  automation_emailed_pickup: "Automated email to customer",
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

const LOG_OPTIONS = [
  { value: "processing", label: "Processing" },
  { value: "assigned", label: "Assigned" },
  { value: "arrived_at_pickup", label: "Arrived at Pickup" },
  { value: "picked_up", label: "Picked Up" },
  { value: "arrived_at_delivery", label: "Arrived at Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "undeliverable", label: "Undeliverable" },
  { value: "returned", label: "Returned" },
  { value: "canceled", label: "Canceled" },
  { value: "not_ready", label: "Not Ready" },
  { value: "incorrect_size", label: "Incorrect Size" },
  { value: "texted_pickup", label: "Texted Pickup" },
  { value: "called_pickup", label: "Called Pickup" },
  { value: "texted_delivery", label: "Texted Delivery" },
  { value: "called_delivery", label: "Called Delivery" },
];

// ─── Admin Log Edit Row ────────────────────────────────────────────────────

const AdminLogEditRow = ({
  log,
  onSave,
  onCancel,
}: {
  log: any;
  onSave: (updated: { log: string; by: string; datetime: string }) => void;
  onCancel: () => void;
}) => {
  const [editData, setEditData] = useState({
    log: log.log,
    by: log.by || "System",
    datetime: moment(log.datetime).format("YYYY-MM-DDTHH:mm"),
  });

  return (
    <div className="mt-1 mb-2 ml-6 bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-themeDarkGray font-medium block mb-1">
            Log Type
          </label>
          <select
            value={editData.log}
            onChange={(e) => setEditData({ ...editData, log: e.target.value })}
            className="text-xs w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:border-themeOrange bg-white"
          >
            {LOG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-themeDarkGray font-medium block mb-1">
            By
          </label>
          <input
            type="text"
            value={editData.by}
            onChange={(e) => setEditData({ ...editData, by: e.target.value })}
            className="text-xs w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-themeDarkGray font-medium block mb-1">
          Date & Time
        </label>
        <input
          type="datetime-local"
          value={editData.datetime}
          onChange={(e) =>
            setEditData({ ...editData, datetime: e.target.value })
          }
          className="text-xs w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() =>
            onSave({
              ...editData,
              datetime: moment(editData.datetime).toISOString(),
            })
          }
          className="text-xs px-2.5 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// ─── Admin New Log Form ────────────────────────────────────────────────────

const AdminNewLogForm = ({
  onSave,
  onCancel,
}: {
  onSave: (data: { log: string; by: string; datetime: string }) => void;
  onCancel: () => void;
}) => {
  const [newLog, setNewLog] = useState({
    log: "",
    by: "Admin",
    datetime: moment().format("YYYY-MM-DDTHH:mm"),
  });

  return (
    <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
      <p className="text-xs font-semibold text-blue-700">New Log Entry</p>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-themeDarkGray font-medium block mb-1">
            Log Type
          </label>
          <select
            value={newLog.log}
            onChange={(e) => setNewLog({ ...newLog, log: e.target.value })}
            className="text-xs w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:border-themeOrange bg-white"
          >
            <option value="">Select type...</option>
            {LOG_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-themeDarkGray font-medium block mb-1">
            By
          </label>
          <input
            type="text"
            value={newLog.by}
            onChange={(e) => setNewLog({ ...newLog, by: e.target.value })}
            className="text-xs w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] text-themeDarkGray font-medium block mb-1">
          Date & Time
        </label>
        <input
          type="datetime-local"
          value={newLog.datetime}
          onChange={(e) => setNewLog({ ...newLog, datetime: e.target.value })}
          className="text-xs w-full p-1.5 border border-gray-300 rounded focus:outline-none focus:border-themeOrange"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="text-xs px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            if (!newLog.log) return alert("Please select a log type");
            onSave({
              ...newLog,
              datetime: moment(newLog.datetime).toISOString(),
            });
          }}
          className="text-xs px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
        >
          Add Log
        </button>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════════════

const ProcessingInfo = ({
  items,
  isAdmin = false,
  onLogsChange,
}: {
  items: any;
  isAdmin?: boolean;
  onLogsChange?: (logs: any[]) => void;
}) => {
  const contextValue = useContext(ThemeContext);
  const config = useConfig();

  const [logs, setLogs] = useState<any[]>(items?.logs || []);
  const [editingLogId, setEditingLogId] = useState<number | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Sync if parent updates items
  useEffect(() => {
    setLogs(items?.logs || []);
  }, [items?.logs]);

  const updateLogs = (newLogs: any[]) => {
    setLogs(newLogs);
    onLogsChange?.(newLogs);
  };

  const handleCreate = async (data: {
    log: string;
    by: string;
    datetime: string;
  }) => {
    try {
      const res = await axios.post(
        `${url}/order/logs`,
        {
          order_id: items.order_id,
          ...data,
        },
        config,
      );
      const created = res.data.data;
      updateLogs([...logs, created]);
      setIsCreatingNew(false);
    } catch (err) {
      console.error("Failed to create log", err);
      alert("Failed to create log");
    }
  };

  const handleUpdate = async (
    logId: number,
    data: { log: string; by: string; datetime: string },
  ) => {
    try {
      const res = await axios.patch(`${url}/order/logs/${logId}`, data, config);
      const updated = res.data.data;
      updateLogs(logs.map((l) => (l.log_id === logId ? updated : l)));
      setEditingLogId(null);
    } catch (err) {
      console.error("Failed to update log", err);
      alert("Failed to update log");
    }
  };

  const handleDelete = async (logId: number) => {
    if (!window.confirm("Delete this log entry?")) return;
    try {
      await axios.delete(`${url}/order/logs/${logId}`, config);
      updateLogs(logs.filter((l) => l.log_id !== logId));
    } catch (err) {
      console.error("Failed to delete log", err);
      alert("Failed to delete log");
    }
  };

  const reversedLogs = [...logs]
    .sort(
      (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
    )
    .reverse();

  const visibleLogs = reversedLogs.filter(
    (item: any) =>
      contextValue?.activeSwitch || ALWAYS_VISIBLE.includes(item.log),
  );

  return (
    <div className="w-full">
      {/* Admin: Add Log button */}
      {isAdmin && (
        <div className="flex justify-end mb-2">
          {!isCreatingNew && (
            <button
              onClick={() => setIsCreatingNew(true)}
              className="text-[11px] px-2.5 py-1 bg-themeOrange hover:bg-orange-600 text-white rounded transition-colors"
            >
              + Add Log
            </button>
          )}
        </div>
      )}

      {/* New log form */}
      {isAdmin && isCreatingNew && (
        <AdminNewLogForm
          onSave={handleCreate}
          onCancel={() => setIsCreatingNew(false)}
        />
      )}

      {visibleLogs.map((item: any, index: number) => {
        const label =
          item.log === "processing"
            ? `Order created`
            : LOG_LABELS[item.log] || item.log;

        const colorClass = LOG_COLORS[item.log] || "text-black";
        const isFirst = index === 0;
        const isLast = index === visibleLogs.length - 1;
        const isEditing = editingLogId === item.log_id;

        return (
          <div key={item.log_id || index}>
            <div className="flex gap-2.5 w-full">
              {/* Timeline column */}
              <div className="flex flex-col items-center w-3.5 shrink-0">
                {isFirst ? (
                  <div className="h-2.5" />
                ) : (
                  <div className="w-0.5 bg-themeOrange h-2.5 z-10" />
                )}
                <div className="w-3.5 h-3.5 rounded-full border-2 bg-themeOrange border-white shrink-0 z-20" />
                {!isLast && (
                  <div className="w-0.5 bg-themeOrange flex-1 z-10" />
                )}
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
                    {(isAdmin ||
                      item.log === "processing" ||
                      item.log === "assigned") && (
                      <p className="text-[10px] text-themeDarkGray">
                        by {item.by}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div>
                      <p className="text-[11px] text-themeDarkGray text-right">
                        {moment(item.datetime).format("MMM Do")}
                      </p>
                      <p className="text-xs text-right">
                        {moment(item.datetime).format("h:mm a")}
                      </p>
                    </div>

                    {/* Admin action buttons */}
                    {isAdmin && !isEditing && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingLogId(item.log_id)}
                          className="text-[10px] px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.log_id)}
                          className="text-[10px] px-1.5 py-0.5 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-colors"
                        >
                          Del
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {item.log === "picked_up" &&
                  items?.pickup?.uploaded_verification && (
                    <ProofImages proofs={items.pickup.uploaded_verification} />
                  )}
                {item.log === "delivered" &&
                  items?.delivery?.uploaded_verification && (
                    <ProofImages
                      proofs={items.delivery.uploaded_verification}
                    />
                  )}
              </div>
            </div>

            {/* Edit form renders below the log row, outside the flex */}
            {isAdmin && isEditing && (
              <AdminLogEditRow
                log={item}
                onSave={(updated) => handleUpdate(item.log_id, updated)}
                onCancel={() => setEditingLogId(null)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProcessingInfo;
