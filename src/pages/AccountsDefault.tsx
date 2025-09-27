import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { url, useConfig } from "../hooks/useConfig";
import {
  FormInput,
  FormSelect,
  RadioGroup,
  CheckboxGroup,
  FormCheckbox,
} from "../components/reusable/FormComponents";

// Type definitions
interface AccountsData {
  item_quantity?: number;
  item_type?: string;
  tip?: number;
  barcode_type?: string;
  timeframe?: string;
  store_default?: string;
  autofill?: boolean;
  pickup_picture?: boolean;
  delivery_picture?: boolean;
  delivery_recipient?: boolean;
  delivery_signature?: boolean;
  delivery_21?: boolean;
  delivery_pin?: boolean;
  [key: string]: unknown; // For additional properties
}

interface OutletContext {
  accountsData: AccountsData;
  setAccountsData: (data: AccountsData) => void;
}

interface UpdatedDefaultsData {
  [key: string]: string | number | boolean;
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

interface RadioOption {
  value: string | boolean;
  label: string;
}

interface CheckboxOption {
  id: string;
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

const AccountsDefault: React.FC = () => {
  const config = useConfig();
  const { accountsData, setAccountsData } = useOutletContext<OutletContext>();
  const [updatedDefaultsData, setUpdatedDefaultsData] =
    useState<UpdatedDefaultsData>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: "",
    message: "",
  });
  const [error, setError] = useState<ErrorState>({
    message: "",
    fieldErrors: {},
  });

  // Store current form values (combination of original data and updates)
  const currentFormValues = useMemo(() => {
    const combined: AccountsData = { ...accountsData };

    // Apply updates, but handle tip specially
    Object.keys(updatedDefaultsData).forEach((key) => {
      if (key === "tip") {
        // If tip is being edited, show the raw dollar value
        combined[parseInt(key)] =
          typeof updatedDefaultsData[key] === "number"
            ? ((updatedDefaultsData[key] as number) / 100).toFixed(2) // Convert cents to dollars
            : (updatedDefaultsData[key] as string); // Keep raw input while typing
      } else {
        combined[key] = updatedDefaultsData[key];
      }
    });

    // Convert tip from cents to dollars for display (only if not being edited)
    if (combined.tip !== undefined && !updatedDefaultsData.tip) {
      combined.tip = parseInt((combined.tip / 100).toFixed(2));
    }

    return combined;
  }, [accountsData, updatedDefaultsData]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { id, value } = e.target;

    // Clear field error and status when user starts typing
    if (error.fieldErrors[id]) {
      setError((prev) => {
        const newFieldErrors = { ...prev.fieldErrors };
        delete newFieldErrors[id];
        return {
          ...prev,
          fieldErrors: newFieldErrors,
        };
      });
    }

    if (error.message) {
      setError((prev) => ({
        ...prev,
        message: "",
      }));
    }

    // Clear submit status when user makes changes
    if (submitStatus.message) {
      setSubmitStatus({ type: "", message: "" });
    }

    // For tip field, just store the raw dollar value temporarily
    const processedValue = value;
    const originalValue =
      id === "tip"
        ? ((accountsData[id] as number) / 100).toFixed(2)
        : accountsData[id];

    if (originalValue !== processedValue) {
      setUpdatedDefaultsData((prev) => ({
        ...prev,
        [id]: processedValue,
      }));
    } else {
      const newData = { ...updatedDefaultsData };
      delete newData[id];
      setUpdatedDefaultsData(newData);
    }
  }

  // Handle tip field when user finishes typing (onBlur)
  function handleTipBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { id, value } = e.target;

    if (id === "tip") {
      // Convert to cents when user is done typing
      const processedValue = Math.round(parseFloat(value || "0") * 100);
      const originalValue = accountsData[id] as number;

      if (originalValue !== processedValue) {
        setUpdatedDefaultsData((prev) => ({
          ...prev,
          [id]: processedValue,
        }));
      } else {
        const newData = { ...updatedDefaultsData };
        delete newData[id];
        setUpdatedDefaultsData(newData);
      }
    }
  }

  // Handle radio group changes
  const handleRadioChange = (fieldName: string, value: string | boolean) => {
    // Clear field error and status when user starts typing
    if (error.fieldErrors[fieldName]) {
      setError((prev) => {
        const newFieldErrors = { ...prev.fieldErrors };
        return {
          ...prev,
          fieldErrors: newFieldErrors,
        };
      });
    }

    if (error.message) {
      setError((prev) => ({
        ...prev,
        message: "",
      }));
    }

    // Clear submit status when user makes changes
    if (submitStatus.message) {
      setSubmitStatus({ type: "", message: "" });
    }

    if (accountsData[fieldName] !== value) {
      setUpdatedDefaultsData((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
    } else {
      const newData = { ...updatedDefaultsData };
      delete newData[fieldName];
      setUpdatedDefaultsData(newData);
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (fieldName: string, checked: boolean) => {
    // Clear field error and status when user starts typing
    if (error.fieldErrors[fieldName]) {
      setError((prev) => {
        const newFieldErrors = { ...prev.fieldErrors };
        return {
          ...prev,
          fieldErrors: newFieldErrors,
        };
      });
    }

    if (error.message) {
      setError((prev) => ({
        ...prev,
        message: "",
      }));
    }

    // Clear submit status when user makes changes
    if (submitStatus.message) {
      setSubmitStatus({ type: "", message: "" });
    }

    if (accountsData[fieldName] !== checked) {
      setUpdatedDefaultsData((prev) => ({
        ...prev,
        [fieldName]: checked,
      }));
    } else {
      const newData = { ...updatedDefaultsData };
      delete newData[fieldName];
      setUpdatedDefaultsData(newData);
    }
  };

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: UpdatedDefaultsData) => {
      // Ensure tip is in cents before sending
      const dataToSend = { ...newTodo };
      if (dataToSend.tip !== undefined && typeof dataToSend.tip === "string") {
        dataToSend.tip = Math.round(parseFloat(dataToSend.tip || "0") * 100);
      }
      return axios.patch(url + "/retail", dataToSend, config);
    },
    onSuccess: (data) => {
      setError({ message: "", fieldErrors: {} });
      const updatedData: AccountsData = {
        ...accountsData,
        ...data.data.data,
      };
      setAccountsData(updatedData);
      setUpdatedDefaultsData({});

      // Show success message
      setSubmitStatus({
        type: "success",
        message: "Defaults saved successfully!",
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 5000);
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
        fieldErrors: fieldErrors,
      });

      // Show error message
      setSubmitStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to save defaults",
      });
    },
  });

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(updatedDefaultsData).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [updatedDefaultsData]);

  // Options for select fields
  const itemTypeOptions: SelectOption[] = [
    { value: "box", label: "Box" },
    { value: "bag", label: "Bag" },
    { value: "catoon", label: "Catoon" },
  ];

  const barcodeTypeOptions: SelectOption[] = [
    { value: "UPC", label: "UPC" },
    { value: "QR", label: "QR" },
    { value: "other", label: "Other" },
  ];

  // Options for radio groups
  const timeframeOptions: RadioOption[] = [
    { value: "fastest", label: "Fastest" },
    { value: "cheapest", label: "Cheapest" },
  ];

  const storeDefaultOptions: RadioOption[] = [
    { value: "pickup", label: "Pick-up" },
    { value: "delivery", label: "Delivery" },
  ];

  const autofillOptions: RadioOption[] = [
    { value: false, label: "Off" },
    { value: true, label: "On" },
  ];

  // Options for checkbox groups
  const proofOfDeliveryOptions: CheckboxOption[] = [
    { id: "delivery_picture", label: "Picture" },
    { id: "delivery_recipient", label: "Recipient" },
    { id: "delivery_signature", label: "Signature" },
    { id: "delivery_21", label: "21+" },
    { id: "delivery_pin", label: "Pin" },
  ];

  if (accountsData === undefined) {
    return (
      <div className="w-full h-full bg-white p-themePadding rounded-2xl flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-themeGreen border-t-transparent rounded-full"></div>
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
              <h2 className="text-xl text-black font-bold">Defaults</h2>
              <p className="text-sm text-themeDarkGray mt-1">
                Set your default preferences for orders and deliveries
              </p>
            </div>
            {Object.keys(updatedDefaultsData).length > 0 && (
              <div className="flex items-center gap-2 text-sm text-themeDarkGray">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span>Unsaved changes</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Order Defaults Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">
                Order Defaults
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <FormInput
                  label="Quantity"
                  id="item_quantity"
                  type="number"
                  value={currentFormValues?.item_quantity?.toString() || ""}
                  onChange={handleChange}
                  error={error.fieldErrors?.item_quantity}
                />

                <FormSelect
                  label="Item Type"
                  id="item_type"
                  value={currentFormValues?.item_type || ""}
                  onChange={handleChange}
                  options={itemTypeOptions}
                  error={error.fieldErrors?.item_type}
                />

                <FormInput
                  label="Tip"
                  id="tip"
                  type="number"
                  step="0.01"
                  prefix="$"
                  value={currentFormValues?.tip?.toString() || ""}
                  onChange={handleChange}
                  onBlur={handleTipBlur}
                  error={error.fieldErrors?.tip}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Barcode Type"
                  id="barcode_type"
                  value={currentFormValues?.barcode_type || ""}
                  onChange={handleChange}
                  options={barcodeTypeOptions}
                  error={error.fieldErrors?.barcode_type}
                />

                <RadioGroup
                  label="Timeframe"
                  name="timeframe"
                  options={timeframeOptions}
                  value={currentFormValues?.timeframe || ""}
                  onChange={(value) => handleRadioChange("timeframe", value)}
                  error={error.fieldErrors?.timeframe}
                />
              </div>
            </div>

            {/* Service Preferences Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-black">
                Service Preferences
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <RadioGroup
                  label="Store as Default"
                  name="store_default"
                  options={storeDefaultOptions}
                  value={currentFormValues?.store_default || ""}
                  onChange={(value) =>
                    handleRadioChange("store_default", value)
                  }
                  error={error.fieldErrors?.store_default}
                />

                <RadioGroup
                  label="Autofill"
                  name="autofill"
                  options={autofillOptions}
                  value={currentFormValues?.autofill}
                  onChange={(value) => handleRadioChange("autofill", value)}
                  error={error.fieldErrors?.autofill}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                  <FormCheckbox
                    label="Proof of pickup"
                    value="Picture"
                    id="pickup_picture"
                    checked={currentFormValues?.pickup_picture || false}
                    onChange={(e) =>
                      handleCheckboxChange("pickup_picture", e.target.checked)
                    }
                    error={error.fieldErrors?.pickup_picture}
                  />
                </div>

                <CheckboxGroup
                  label="Proof of Delivery"
                  options={proofOfDeliveryOptions}
                  values={{
                    delivery_picture:
                      currentFormValues?.delivery_picture || false,
                    delivery_recipient:
                      currentFormValues?.delivery_recipient || false,
                    delivery_signature:
                      currentFormValues?.delivery_signature || false,
                    delivery_21: currentFormValues?.delivery_21 || false,
                    delivery_pin: currentFormValues?.delivery_pin || false,
                  }}
                  onChange={handleCheckboxChange}
                  error={
                    error.fieldErrors?.delivery_picture ||
                    error.fieldErrors?.delivery_recipient ||
                    error.fieldErrors?.delivery_signature ||
                    error.fieldErrors?.delivery_21 ||
                    error.fieldErrors?.delivery_pin
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex flex-col items-center mt-8">
          <button
            disabled={
              Object.keys(updatedDefaultsData).length < 1 ||
              addTodoMutation.isPending
            }
            onClick={() => addTodoMutation.mutate(updatedDefaultsData)}
            className={`w-full max-w-sm py-3 text-white shadow-btnShadow rounded-lg transition-all duration-200 font-medium ${
              Object.keys(updatedDefaultsData).length > 0 &&
              !addTodoMutation.isPending
                ? "bg-themeGreen hover:bg-green-600 hover:scale-[0.98] active:scale-95"
                : "bg-themeLightGray cursor-not-allowed"
            }`}
          >
            {addTodoMutation.isPending ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving Defaults...
              </div>
            ) : (
              "Save Defaults"
            )}
          </button>

          {/* Success/Error Messages */}
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

          {/* General Error Message - Show if there's an error message and no submit status */}
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

export default AccountsDefault;
