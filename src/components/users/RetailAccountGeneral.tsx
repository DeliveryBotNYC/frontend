import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { url, useConfig } from "../../hooks/useConfig";
import {
  FormInput,
  FormSelect,
  AddressAutocomplete,
} from "../reusable/FormComponents";

// Type definitions
interface AccountsData {
  user_id?: number | null;
  customer_id?: number | null;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  phone_formatted?: string;
  store_type?: string;
  account_id?: string;
  status?: string;
  discount?: number;
  estimated_monthly_volume?: number;
  note?: string;
  apt?: string;
  access_code?: string | null;
  external_customer_id?: string | null;
  default_pickup_note?: string;
  default_delivery_note?: string;
  address?: {
    formatted?: string;
    street_address_1?: string;
    street_address_2?: string;
    city?: string;
    state?: string;
    zip?: string;
    lat?: number | string;
    lon?: number | string;
  };
  [key: string]: any;
}

interface RetailAccountGeneralProps {
  accountsData: AccountsData;
  setAccountsData: (data: AccountsData) => void;
  refetchAccountData: () => void;
  isLoading: boolean;
  isError: boolean;
  error: any;
}

interface UpdatedGeneralData {
  [key: string]: string | number;
}

interface SubmitStatus {
  type: "success" | "error" | "";
  message: string;
}

interface ErrorState {
  message: string;
  fieldErrors: Record<string, string>;
}

interface SelectOption {
  value: string;
  label: string;
}

interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
      data?: Array<{
        field: string;
        message: string;
      }>;
    };
  };
}

const RetailAccountGeneral: React.FC<RetailAccountGeneralProps> = ({
  accountsData,
  setAccountsData,
}) => {
  const config = useConfig();
  const [updatedGeneralData, setUpdatedGeneralData] =
    useState<UpdatedGeneralData>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: "",
    message: "",
  });
  const [error, setError] = useState<ErrorState>({
    message: "",
    fieldErrors: {},
  });

  const currentFormValues = useMemo(() => {
    return { ...accountsData, ...updatedGeneralData };
  }, [accountsData, updatedGeneralData]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { id, value } = e.target;

    if (error.fieldErrors[id]) {
      setError((prev) => {
        const newFieldErrors = { ...prev.fieldErrors };
        delete newFieldErrors[id];
        return { ...prev, fieldErrors: newFieldErrors };
      });
    }
    if (error.message) setError((prev) => ({ ...prev, message: "" }));
    if (submitStatus.message) setSubmitStatus({ type: "", message: "" });

    let processedValue: string | number = value;
    if (id === "discount" || id === "estimated_monthly_volume") {
      processedValue = value === "" ? "" : parseFloat(value);
    }

    if (accountsData[id] !== processedValue) {
      setUpdatedGeneralData((prev) => ({ ...prev, [id]: processedValue }));
    } else {
      const newData = { ...updatedGeneralData };
      delete newData[id];
      setUpdatedGeneralData(newData);
    }
  }

  const saveGeneralMutation = useMutation({
    mutationFn: (newData: UpdatedGeneralData) =>
      axios.patch(url + "/retail/" + accountsData.user_id, newData, config),
    onSuccess: (data) => {
      setError({ message: "", fieldErrors: {} });
      setAccountsData({ ...accountsData, ...data.data.data });
      setUpdatedGeneralData({});
      setSubmitStatus({
        type: "success",
        message: "General information saved successfully!",
      });
      setTimeout(() => setSubmitStatus({ type: "", message: "" }), 5000);
    },
    onError: (error: ApiErrorResponse) => {
      const fieldErrors: Record<string, string> = {};
      if (
        error.response?.data?.data &&
        Array.isArray(error.response.data.data)
      ) {
        error.response.data.data.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
      }
      setError({
        message: error.response?.data?.message || "An error occurred",
        fieldErrors,
      });
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message || "Failed to save general information",
      });
    },
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(updatedGeneralData).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [updatedGeneralData]);

  const storeTypeOptions: SelectOption[] = [
    { value: "grocery", label: "Grocery" },
    { value: "clothing", label: "Clothing" },
    { value: "laundry", label: "Laundry" },
    { value: "flower", label: "Flower" },
    { value: "alcohol", label: "Alcohol" },
    { value: "other", label: "Other" },
  ];

  const statusOptions: SelectOption[] = [
    { value: "active", label: "Active" },
    { value: "pending_approval", label: "Pending Approval" },
    { value: "suspended", label: "Suspended" },
  ];

  if (accountsData === undefined) {
    return (
      <div className="w-full h-full bg-white p-themePadding rounded-2xl flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-themeGreen border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="w-full h-full flex flex-col justify-between items-center">
        <div className="w-full h-full">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="First Name"
                  id="firstname"
                  type="text"
                  value={currentFormValues?.firstname || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.firstname}
                />
                <FormInput
                  label="Last Name"
                  id="lastname"
                  type="text"
                  value={currentFormValues?.lastname || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.lastname}
                />
                <div className="md:col-span-2">
                  <FormInput
                    label="Email"
                    id="email"
                    type="email"
                    value={currentFormValues?.email || ""}
                    onChange={handleChange}
                    error={error.fieldErrors?.email}
                  />
                </div>
                <FormInput
                  label="Phone"
                  id="phone"
                  type="tel"
                  value={currentFormValues?.phone_formatted || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.phone}
                />
                <FormSelect
                  label="Status"
                  id="status"
                  value={currentFormValues?.status || ""}
                  onChange={handleChange}
                  options={statusOptions}
                  error={error.fieldErrors?.status}
                />
              </div>
            </div>

            {/* Store Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">
                Store Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormSelect
                  label="Store Type"
                  id="store_type"
                  value={currentFormValues?.store_type || ""}
                  onChange={handleChange}
                  options={storeTypeOptions}
                  error={error.fieldErrors?.store_type}
                />
                <FormInput
                  label="External Customer ID"
                  id="external_customer_id"
                  type="text"
                  value={currentFormValues?.external_customer_id || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.external_customer_id}
                />
                <FormInput
                  readOnly={true}
                  label="Account ID"
                  id="account_id"
                  type="text"
                  value={currentFormValues?.account_id || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.account_id}
                />
                <FormInput
                  label="Estimated Monthly Volume"
                  id="estimated_monthly_volume"
                  type="number"
                  value={
                    currentFormValues?.estimated_monthly_volume?.toString() ||
                    ""
                  }
                  onChange={handleChange}
                  error={error.fieldErrors?.estimated_monthly_volume}
                />
                <FormInput
                  label="Discount (%)"
                  id="discount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={currentFormValues?.discount?.toString() || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.discount}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AddressAutocomplete
                  label="Address"
                  id="address"
                  required
                  value={currentFormValues?.address?.street_address_1 || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.address}
                />
                <FormInput
                  label="Apartment/Unit"
                  id="apt"
                  type="text"
                  value={currentFormValues?.apt || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.apt}
                />
                <FormInput
                  label="Access Code"
                  id="access_code"
                  type="text"
                  value={currentFormValues?.access_code || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.access_code}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormInput
                  label="Default Pickup Note"
                  id="default_pickup_note"
                  type="text"
                  value={currentFormValues?.default_pickup_note || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.default_pickup_note}
                />
                <FormInput
                  label="Default Delivery Note"
                  id="default_delivery_note"
                  type="text"
                  value={currentFormValues?.default_delivery_note || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.default_delivery_note}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex flex-col items-center mt-8">
          <button
            disabled={
              Object.keys(updatedGeneralData).length < 1 ||
              saveGeneralMutation.isPending
            }
            onClick={() => saveGeneralMutation.mutate(updatedGeneralData)}
            className={`w-full max-w-sm py-3 text-white shadow-btnShadow rounded-lg transition-all duration-200 font-medium ${
              Object.keys(updatedGeneralData).length > 0 &&
              !saveGeneralMutation.isPending
                ? "bg-themeGreen hover:bg-green-600 hover:scale-[0.98] active:scale-95"
                : "bg-themeLightGray cursor-not-allowed"
            }`}
          >
            {saveGeneralMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Saving Changes...
              </div>
            ) : (
              "Save General Information"
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

          {error.message && !submitStatus.message && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg w-full max-w-sm">
              <div className="flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-red-500"
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
                <p className="text-sm text-red-700 font-medium">
                  {error.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetailAccountGeneral;
