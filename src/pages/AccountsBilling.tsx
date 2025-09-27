import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { useOutletContext } from "react-router-dom";
import { url, useConfig } from "../hooks/useConfig";
import { FormInput, FormSelect } from "../components/reusable/FormComponents";
import Stripe from "../components/accounts/Stripe";
import PaymentMethods from "../components/accounts/PaymentMethods";

// Type definitions
interface AccountsData {
  email?: string;
  default_payment_method?: string;
  stripe_customer_id?: string;
  billing_frequency?: string;
  billing_method?: string;
  [key: string]: string | undefined;
}

interface StripeCustomerData {
  id: string;
  email?: string;
  invoice_settings?: {
    default_payment_method?: string;
  };
}

interface OutletContext {
  accountsData: AccountsData;
  setAccountsData: (data: AccountsData) => void;
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

const AccountsBilling: React.FC = () => {
  const config = useConfig();
  const { accountsData, setAccountsData } = useOutletContext<OutletContext>();
  const [updatedBillingData, setUpdatedBillingData] = useState<
    Record<string, string>
  >({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: "",
    message: "",
  });
  const [newCard, setNewCard] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState>({
    message: "",
    fieldErrors: {},
  });

  // Fetch Stripe customer data for billing email and default payment method
  const {
    data: stripeCustomerData,
    isLoading: stripeCustomerLoading,
    error: stripeCustomerError,
    refetch: refetchStripeCustomer,
  } = useQuery({
    queryKey: ["stripeCustomer"],
    queryFn: (): Promise<AxiosResponse<{ data: StripeCustomerData }>> =>
      axios.get(url + "/stripe/customer", config),
    enabled: !!config,
    select: (data: AxiosResponse<{ data: StripeCustomerData }>) =>
      data.data.data || null,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Store current form values (combination of original data, stripe data, and updates)
  const currentFormValues = useMemo((): AccountsData => {
    const baseData = { ...accountsData };

    // Override with Stripe customer data if available
    if (stripeCustomerData) {
      baseData.email = stripeCustomerData.email || baseData.email;
      baseData.default_payment_method =
        stripeCustomerData.invoice_settings?.default_payment_method ||
        baseData.default_payment_method;
      baseData.stripe_customer_id =
        stripeCustomerData.id || baseData.stripe_customer_id;
    }

    // Apply any local updates
    return { ...baseData, ...updatedBillingData };
  }, [accountsData, stripeCustomerData, updatedBillingData]);

  // Update customer email mutation
  const updateCustomerMutation = useMutation({
    mutationFn: (updateData: {
      email: string;
    }): Promise<AxiosResponse<StripeCustomerData>> =>
      axios.patch(url + "/stripe/customer", updateData, config),
    onSuccess: () => {
      refetchStripeCustomer();
      setSubmitStatus({
        type: "success",
        message: "Customer information updated successfully!",
      });
      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 5000);
    },
    onError: (error: ApiErrorResponse) => {
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update customer information",
      });
    },
  });

  // Handle form input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { id, value } = e.target;

    // Clear field error and status when user starts typing
    if (error.fieldErrors[id]) {
      setError((prev) => ({
        ...prev,
        fieldErrors: {
          ...prev.fieldErrors,
          [id]: undefined,
        },
      }));
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

    // Compare with current value (which includes Stripe data)
    const currentValue = currentFormValues[id];

    if (currentValue !== value) {
      setUpdatedBillingData((prev) => ({
        ...prev,
        [id]: value,
      }));
    } else {
      const newData = { ...updatedBillingData };
      delete newData[id];
      setUpdatedBillingData(newData);
    }
  };

  // Save billing data mutation
  const saveBillingMutation = useMutation({
    mutationFn: (
      billingData: Record<string, string>
    ): Promise<AxiosResponse<AccountsData>> =>
      axios.patch(url + "/stripe/customer", billingData, config),
    onSuccess: (data: AxiosResponse<AccountsData>) => {
      setError({ message: "", fieldErrors: {} });
      const updatedData: AccountsData = {
        ...accountsData,
        ...data.data,
      };
      setAccountsData(updatedData);

      // If email was updated, also update it in Stripe
      if (
        updatedBillingData.email &&
        updatedBillingData.email !== stripeCustomerData?.email
      ) {
        updateCustomerMutation.mutate({ email: updatedBillingData.email });
      }

      setUpdatedBillingData({});
      refetchStripeCustomer();

      setSubmitStatus({
        type: "success",
        message: "Billing information saved successfully!",
      });

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

      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message || "Failed to save billing information",
      });
    },
  });

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (Object.keys(updatedBillingData).length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [updatedBillingData]);

  // Options for the select dropdowns
  const frequencyOptions: SelectOption[] = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const methodOptions: SelectOption[] = [
    { value: "card", label: "Card" },
    { value: "check", label: "Check" },
    { value: "ach", label: "ACH" },
  ];

  // Loading state
  if (accountsData === undefined || stripeCustomerLoading) {
    return (
      <div className="w-full h-full bg-white p-themePadding rounded-2xl flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-themeGreen border-t-transparent rounded-full"></div>
        <span className="ml-2 text-themeDarkGray">
          {stripeCustomerLoading
            ? "Loading billing information..."
            : "Loading..."}
        </span>
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
              <h2 className="text-xl text-black font-bold">Billing</h2>
              <p className="text-sm text-themeDarkGray mt-1">
                Manage your billing information and payment methods
              </p>
            </div>
            {!newCard && Object.keys(updatedBillingData).length > 0 && (
              <div className="flex items-center gap-2 text-sm text-themeDarkGray">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span>Unsaved changes</span>
              </div>
            )}
            {newCard && (
              <button
                className="text-lg text-black font-bold cursor-pointer hover:text-themeOrange transition-colors"
                onClick={() => setNewCard(false)}
              >
                Go back
              </button>
            )}
          </div>

          {/* Stripe Customer Error */}
          {stripeCustomerError && (
            <div className="mb-6 border border-yellow-200 rounded-lg p-4 bg-yellow-50">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow-500"
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
                <p className="text-sm text-yellow-700">
                  Warning: Could not load Stripe billing information. Some data
                  may be outdated.
                </p>
              </div>
            </div>
          )}

          {/* Content */}
          {newCard ? (
            <Stripe
              onSuccess={() => {
                console.log(
                  "AccountsBilling onSuccess called - closing Stripe form"
                );
                // Close the Stripe form
                setNewCard(false);
                // Show success message
                setSubmitStatus({
                  type: "success",
                  message: "Payment method added successfully!",
                });
                // Clear the message after 5 seconds
                setTimeout(() => {
                  setSubmitStatus({ type: "", message: "" });
                }, 5000);
              }}
              onError={(error: { message?: string }) => {
                console.log("AccountsBilling onError called:", error);
                setSubmitStatus({
                  type: "error",
                  message: error.message || "Failed to add payment method",
                });
              }}
            />
          ) : (
            <div className="space-y-6">
              {/* Billing Information Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-black">
                  Billing Information
                </h3>

                {/* Email and Stripe ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Invoice email"
                    id="email"
                    type="email"
                    required={true}
                    value={currentFormValues?.email || ""}
                    onChange={handleChange}
                    placeholder="Enter invoice email"
                    error={error.fieldErrors?.email}
                  />
                  <FormInput
                    label="Stripe ID"
                    id="stripe_id"
                    type="text"
                    required={true}
                    disabled={true}
                    value={stripeCustomerData?.id || ""}
                    onChange={handleChange}
                    placeholder="Enter Stripe customer id"
                    error={error.fieldErrors?.customer_id}
                  />
                </div>

                {/* Frequency and Method Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormSelect
                    label="Frequency"
                    id="billing_frequency"
                    required={true}
                    disabled={true}
                    value={currentFormValues?.billing_frequency || ""}
                    onChange={handleChange}
                    options={frequencyOptions}
                    placeholder="Select frequency"
                    error={error.fieldErrors?.billing_frequency}
                  />

                  <FormSelect
                    label="Method"
                    id="billing_method"
                    required={true}
                    disabled={true}
                    value={currentFormValues?.billing_method || ""}
                    onChange={handleChange}
                    options={methodOptions}
                    placeholder="Select method"
                    error={error.fieldErrors?.billing_method}
                  />
                </div>
              </div>

              {/* Payment Methods Section */}
              <PaymentMethods
                billingMethod={currentFormValues?.billing_method}
                stripeCustomerData={stripeCustomerData}
                refetchStripeCustomer={refetchStripeCustomer}
                newCard={newCard}
                setNewCard={setNewCard}
                setSubmitStatus={setSubmitStatus}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        {!newCard && (
          <div className="w-full flex flex-col items-center mt-8">
            <button
              disabled={
                Object.keys(updatedBillingData).length < 1 ||
                saveBillingMutation.isPending
              }
              onClick={() => saveBillingMutation.mutate(updatedBillingData)}
              className={`w-full max-w-sm py-3 text-white shadow-btnShadow rounded-lg transition-all duration-200 font-medium ${
                Object.keys(updatedBillingData).length > 0 &&
                !saveBillingMutation.isPending
                  ? "bg-themeGreen hover:bg-green-600 hover:scale-[0.98] active:scale-95"
                  : "bg-themeLightGray cursor-not-allowed"
              }`}
            >
              {saveBillingMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving Billing Info...
                </div>
              ) : (
                "Save Billing Information"
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

            {/* General Error Message */}
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
        )}
      </div>
    </div>
  );
};

export default AccountsBilling;
