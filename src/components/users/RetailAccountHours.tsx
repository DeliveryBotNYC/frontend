import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { url, useConfig } from "../../hooks/useConfig";

interface AccountsData {
  user_id?: number | null;
  [key: string]: any;
}

interface RetailAccountHoursProps {
  accountsData: AccountsData;
  setAccountsData: (data: AccountsData) => void;
  refetchAccountData: () => void;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

interface StoreHour {
  id: number;
  user_id: number;
  day_of_week: number;
  open_time: string;
  close_time: string;
}

interface UpdatedHour {
  day_of_week: number;
  open_time: string;
  close_time: string;
}

interface SubmitStatus {
  type: "success" | "error" | "";
  message: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const RetailAccountHours: React.FC<RetailAccountHoursProps> = ({
  accountsData,
}) => {
  const config = useConfig();
  const [updatedHours, setUpdatedHours] = useState<Record<number, UpdatedHour>>(
    {},
  );
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: "",
    message: "",
  });

  const {
    data: hours,
    isLoading,
    refetch,
  } = useQuery<StoreHour[]>({
    queryKey: ["store-hours", accountsData.user_id],
    queryFn: async () => {
      const res = await axios.get(
        `${url}/users/hours/${accountsData.user_id}`,
        config,
      );
      return res.data.data;
    },
    enabled: !!accountsData.user_id,
  });

  const currentFormValues = useMemo(() => {
    if (!hours) return [];
    return hours.map((h) => ({
      ...h,
      open_time: updatedHours[h.day_of_week]?.open_time ?? h.open_time,
      close_time: updatedHours[h.day_of_week]?.close_time ?? h.close_time,
    }));
  }, [hours, updatedHours]);

  function handleTimeChange(
    day_of_week: number,
    field: "open_time" | "close_time",
    value: string,
  ) {
    if (submitStatus.message) setSubmitStatus({ type: "", message: "" });

    const original = hours?.find((h) => h.day_of_week === day_of_week);
    const currentUpdated = updatedHours[day_of_week] ?? {
      day_of_week,
      open_time: original?.open_time ?? "00:00",
      close_time: original?.close_time ?? "23:59",
    };

    const newUpdated = { ...currentUpdated, [field]: value };

    // If both values match original, remove from updatedHours (no change)
    if (
      newUpdated.open_time === original?.open_time &&
      newUpdated.close_time === original?.close_time
    ) {
      const copy = { ...updatedHours };
      delete copy[day_of_week];
      setUpdatedHours(copy);
    } else {
      setUpdatedHours((prev) => ({ ...prev, [day_of_week]: newUpdated }));
    }
  }

  const saveMutation = useMutation({
    mutationFn: (hours: UpdatedHour[]) =>
      axios.put(
        `${url}/users/hours/${accountsData.user_id}`,
        { hours },
        config,
      ),
    onSuccess: () => {
      setUpdatedHours({});
      refetch();
      setSubmitStatus({
        type: "success",
        message: "Store hours saved successfully!",
      });
      setTimeout(() => setSubmitStatus({ type: "", message: "" }), 5000);
    },
    onError: (error: any) => {
      setSubmitStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to save store hours",
      });
    },
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(updatedHours).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [updatedHours]);

  const hasChanges = Object.keys(updatedHours).length > 0;

  if (isLoading) {
    return (
      <div className="w-full h-full bg-white p-6 rounded-2xl flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-themeGreen border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex flex-col justify-between items-center">
        <div className="w-full h-full">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">
                Store Hours
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Set your store’s opening hours to ensure orders are picked up
                and returned within your business hours.
              </p>

              <div className="grid grid-cols-3 gap-4 px-1 mb-2">
                <span className="text-xs text-themeDarkGray">Day</span>
                <span className="text-xs text-themeDarkGray">Open</span>
                <span className="text-xs text-themeDarkGray">Close</span>
              </div>
              <div className="divide-y divide-gray-100">
                {currentFormValues.map((hour) => (
                  <div
                    key={hour.day_of_week}
                    className={`grid grid-cols-3 gap-4 items-center py-2.5 px-1 rounded-md transition-colors ${
                      updatedHours[hour.day_of_week]
                        ? "bg-green-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`text-sm ${updatedHours[hour.day_of_week] ? "text-themeGreen font-medium" : "text-gray-700"}`}
                    >
                      {DAY_NAMES[hour.day_of_week]}
                    </div>

                    <input
                      type="time"
                      value={hour.open_time?.slice(0, 5) ?? "00:00"}
                      onChange={(e) =>
                        handleTimeChange(
                          hour.day_of_week,
                          "open_time",
                          e.target.value,
                        )
                      }
                      className="bg-transparent text-sm text-gray-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-themeGreen rounded px-1 py-1 w-full"
                    />

                    <input
                      type="time"
                      value={hour.close_time?.slice(0, 5) ?? "23:59"}
                      onChange={(e) =>
                        handleTimeChange(
                          hour.day_of_week,
                          "close_time",
                          e.target.value,
                        )
                      }
                      className="bg-transparent text-sm text-gray-700 focus:outline-none focus:bg-white focus:ring-1 focus:ring-themeGreen rounded px-1 py-1 w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex flex-col items-center mt-8">
          <button
            disabled={!hasChanges || saveMutation.isPending}
            onClick={() => saveMutation.mutate(Object.values(updatedHours))}
            className={`w-full max-w-sm py-3 text-white shadow-btnShadow rounded-lg transition-all duration-200 font-medium ${
              hasChanges && !saveMutation.isPending
                ? "bg-themeGreen hover:bg-green-600 hover:scale-[0.98] active:scale-95"
                : "bg-themeLightGray cursor-not-allowed"
            }`}
          >
            {saveMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving Hours...
              </div>
            ) : (
              "Save Store Hours"
            )}
          </button>

          {submitStatus.message && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm font-medium w-full max-w-sm ${
                submitStatus.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {submitStatus.type === "success" ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                )}
                {submitStatus.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetailAccountHours;
