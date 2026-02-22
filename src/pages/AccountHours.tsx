import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { url, useConfig } from "../hooks/useConfig";

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

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
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

const AccountHours: React.FC = () => {
  const config = useConfig();
  const { accountsData } = useOutletContext<{
    accountsData: { user_id?: number | null };
  }>();
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
    queryKey: ["store-hours"],
    queryFn: async () => {
      const res = await axios.get(`${url}/users/hours`, config);
      return res.data.data;
    },
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
    mutationFn: (hoursToSave: UpdatedHour[]) =>
      axios.put(`${url}/users/hours`, { hours: hoursToSave }, config),
    onSuccess: () => {
      setUpdatedHours({});
      refetch();
      setSubmitStatus({
        type: "success",
        message: "Store hours saved successfully!",
      });
      setTimeout(() => setSubmitStatus({ type: "", message: "" }), 5000);
    },
    onError: (error: ApiErrorResponse) => {
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

  if (isLoading || accountsData === undefined) {
    return (
      <div className="w-full h-full bg-white p-themePadding rounded-2xl flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-themeGreen border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-white p-themePadding rounded-2xl">
      <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-between items-center">
        <div className="w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5 mb-6">
            <div>
              <h2 className="text-xl text-black font-bold">Store Hours</h2>
              <p className="text-sm text-themeDarkGray mt-1">
                Set your store’s opening hours to ensure orders are picked up
                and returned during your business hours.
              </p>
            </div>
            {hasChanges && (
              <div className="flex items-center gap-2 text-sm text-themeDarkGray">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span>Unsaved changes</span>
              </div>
            )}
          </div>

          {/* Hours Grid */}
          <div>
            <div className="space-y-3">
              {currentFormValues.map((hour) => (
                <div
                  key={hour.day_of_week}
                  className={`grid grid-cols-3 gap-4 items-center p-4 rounded-lg border transition-colors ${
                    updatedHours[hour.day_of_week]
                      ? "border-themeGreen bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="font-medium text-gray-700 text-sm">
                    {DAY_NAMES[hour.day_of_week]}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-themeDarkGray">Open</label>
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
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-themeGreen focus:border-transparent"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-themeDarkGray">Close</label>
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
                      className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-themeGreen focus:border-transparent"
                    />
                  </div>
                </div>
              ))}
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

export default AccountHours;
