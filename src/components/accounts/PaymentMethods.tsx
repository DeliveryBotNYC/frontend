import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect } from "react";
import { url, useConfig } from "../../hooks/useConfig";
import VisaIcon from "../../assets/visa-icon.svg";
import MastercardIcon from "../../assets/mastercard-icon.svg";
import AmexIcon from "../../assets/amex-icon.svg";
import DiscoverIcon from "../../assets/discover-icon.svg";

const PaymentMethods = ({
  billingMethod,
  stripeCustomerData,
  refetchStripeCustomer,
  newCard,
  setNewCard,
  setSubmitStatus,
}) => {
  const config = useConfig();

  // Fetch payment methods when billing method is 'card'
  const {
    data: paymentMethodsData,
    isLoading: paymentMethodsLoading,
    error: paymentMethodsError,
    refetch: refetchPaymentMethods,
  } = useQuery({
    queryKey: ["paymentMethods", billingMethod],
    queryFn: () => axios.get(url + "/stripe/paymentmethods", config),
    enabled: !!config && billingMethod === "card",
    select: (data) => data.data.data || [],
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Set default payment method mutation
  const setDefaultPaymentMethodMutation = useMutation({
    mutationFn: (paymentMethodId) =>
      axios.patch(
        url + "/stripe/customer/default-payment-method",
        { payment_method_id: paymentMethodId },
        config
      ),
    onSuccess: () => {
      refetchStripeCustomer();
      setSubmitStatus({
        type: "success",
        message: "Default payment method updated successfully!",
      });
      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 5000);
    },
    onError: (error) => {
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Failed to update default payment method",
      });
    },
  });

  // Delete payment method mutation
  const deletePaymentMethodMutation = useMutation({
    mutationFn: (paymentMethodId) =>
      axios.delete(url + `/stripe/paymentmethod/${paymentMethodId}`, config),
    onSuccess: () => {
      refetchStripeCustomer();
      refetchPaymentMethods();
      setSubmitStatus({
        type: "success",
        message: "Payment method removed successfully!",
      });
      setTimeout(() => {
        setSubmitStatus({ type: "", message: "" });
      }, 5000);
    },
    onError: (error) => {
      setSubmitStatus({
        type: "error",
        message:
          error.response?.data?.message || "Failed to remove payment method",
      });
    },
  });

  // Handle setting default payment method
  const handleSetDefaultPaymentMethod = (paymentMethodId) => {
    if (window.confirm("Set this payment method as default?")) {
      setDefaultPaymentMethodMutation.mutate(paymentMethodId);
    }
  };

  // Handle removing payment method
  const handleRemovePaymentMethod = (paymentMethodId, cardInfo) => {
    const cardDisplay = `${formatCardBrand(cardInfo.brand)} ••••${
      cardInfo.last4
    }`;
    if (window.confirm(`Are you sure you want to remove ${cardDisplay}?`)) {
      deletePaymentMethodMutation.mutate(paymentMethodId);
    }
  };

  // Get card brand icon
  const getCardIcon = (brand) => {
    const iconMap = {
      visa: <img src={VisaIcon} alt="Visa" className="w-8 h-5" />,
      mastercard: (
        <img src={MastercardIcon} alt="Mastercard" className="w-8 h-5" />
      ),
      amex: <img src={AmexIcon} alt="American Express" className="w-8 h-5" />,
      american_express: (
        <img src={AmexIcon} alt="American Express" className="w-8 h-5" />
      ),
      discover: <img src={DiscoverIcon} alt="Discover" className="w-8 h-5" />,
      default: (
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 003 3z"
          />
        </svg>
      ),
    };
    return iconMap[brand?.toLowerCase()] || iconMap.default;
  };

  // Format card brand name
  const formatCardBrand = (brand) => {
    const brandMap = {
      visa: "Visa",
      mastercard: "Mastercard",
      amex: "American Express",
      discover: "Discover",
      diners: "Diners Club",
      jcb: "JCB",
      unionpay: "UnionPay",
    };
    return (
      brandMap[brand?.toLowerCase()] ||
      brand?.charAt(0).toUpperCase() + brand?.slice(1) ||
      "Card"
    );
  };

  // Refetch payment methods when newCard is set to false
  useEffect(() => {
    if (!newCard && billingMethod === "card") {
      refetchPaymentMethods();
      refetchStripeCustomer();
    }
  }, [newCard, billingMethod, refetchPaymentMethods, refetchStripeCustomer]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-black">Payment Methods</h3>

      <div className="space-y-4">
        {/* Check Payment Method */}
        {billingMethod === "check" && (
          <div className="border border-secondaryBtnBorder rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-themeOrange"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-lg font-semibold text-black">
                    Check Payment
                  </h4>
                  <span className="px-2 py-1 text-xs font-medium bg-orange-50 text-themeOrange rounded-full">
                    Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <svg
                        className="w-4 h-4 text-themeOrange"
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
                      <span className="text-sm font-medium text-themeOrange">
                        Important Notice
                      </span>
                    </div>
                    <p className="text-sm text-themeDarkGray">
                      DO NOT MAIL CHECK: Will be picked up 3 days after due date
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-black mb-2">
                      Payment Address
                    </h5>
                    <div className="text-sm text-themeDarkGray space-y-1">
                      <p className="font-medium text-black">Delivery Bot LLC</p>
                      <p>400 E 74th St</p>
                      <p>New York, NY 10021</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACH Payment Method */}
        {billingMethod === "ach" && (
          <div className="border border-secondaryBtnBorder rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-themeOrange"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-lg font-semibold text-black">
                    ACH Transfer
                  </h4>
                  <span className="px-2 py-1 text-xs font-medium bg-orange-50 text-themeOrange rounded-full">
                    Active
                  </span>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-black mb-3">
                    Bank Transfer Details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-themeDarkGray mb-1">Account Holder</p>
                      <p className="font-medium text-black">Delivery Bot LLC</p>
                    </div>
                    <div>
                      <p className="text-themeDarkGray mb-1">Bank Name</p>
                      <p className="font-medium text-black">Wells Fargo</p>
                    </div>
                    <div>
                      <p className="text-themeDarkGray mb-1">Account Number</p>
                      <p className="font-mono font-medium text-black">
                        6787950556
                      </p>
                    </div>
                    <div>
                      <p className="text-themeDarkGray mb-1">Routing Number</p>
                      <p className="font-mono font-medium text-black">
                        026012881
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-themeDarkGray mb-1">Account Type</p>
                      <p className="font-medium text-black">
                        Business Checking
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card Payment Methods */}
        {billingMethod === "card" && (
          <>
            {/* Loading state */}
            {paymentMethodsLoading && (
              <div className="border border-secondaryBtnBorder rounded-2xl p-6 flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-themeGreen border-t-transparent rounded-full"></div>
                <span className="ml-2 text-themeDarkGray">
                  Loading payment methods...
                </span>
              </div>
            )}

            {/* Error state */}
            {paymentMethodsError && (
              <div className="border border-red-200 rounded-2xl p-6 bg-red-50">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500"
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
                  <p className="text-sm text-red-700">
                    Failed to load payment methods. Please try again.
                  </p>
                </div>
              </div>
            )}

            {/* Payment method cards and add new button - only show when there are payment methods */}
            {!paymentMethodsLoading &&
              !paymentMethodsError &&
              paymentMethodsData &&
              paymentMethodsData.length > 0 && (
                <>
                  {paymentMethodsData.map((item) => (
                    <div
                      key={item.id}
                      className={`border rounded-2xl p-6 ${
                        item.id ===
                        stripeCustomerData?.invoice_settings
                          ?.default_payment_method
                          ? "border-themeGreen bg-green-50"
                          : "border-secondaryBtnBorder"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Card Icon */}
                        <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                          {getCardIcon(item.card?.brand)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <h4 className="text-lg font-semibold text-black">
                              {formatCardBrand(item.card?.brand)} ••••{" "}
                              {item.card?.last4}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                item.id ===
                                stripeCustomerData?.invoice_settings
                                  ?.default_payment_method
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-50 text-themeOrange"
                              }`}
                            >
                              {item.id ===
                              stripeCustomerData?.invoice_settings
                                ?.default_payment_method
                                ? "Default"
                                : "Active"}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-themeDarkGray mb-1">
                                Card Type
                              </p>
                              <p className="font-medium text-black capitalize">
                                {item.card?.funding || "Credit"}
                              </p>
                            </div>
                            <div>
                              <p className="text-themeDarkGray mb-1">Expires</p>
                              <p className="font-medium text-black">
                                {String(item.card?.exp_month).padStart(2, "0")}/
                                {item.card?.exp_year}
                              </p>
                            </div>
                            <div>
                              <p className="text-themeDarkGray mb-1">Country</p>
                              <p className="font-medium text-black">
                                {item.card?.country || "US"}
                              </p>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center gap-3 mt-4">
                            {item.id !==
                              stripeCustomerData?.invoice_settings
                                ?.default_payment_method && (
                              <>
                                <button
                                  onClick={() =>
                                    handleSetDefaultPaymentMethod(item.id)
                                  }
                                  disabled={
                                    setDefaultPaymentMethodMutation.isPending
                                  }
                                  className="text-sm text-themeOrange hover:text-orange-600 font-medium transition-colors disabled:opacity-50"
                                >
                                  {setDefaultPaymentMethodMutation.isPending
                                    ? "Setting..."
                                    : "Set as Default"}
                                </button>
                                <span className="text-gray-300">|</span>
                              </>
                            )}
                            <button
                              onClick={() =>
                                handleRemovePaymentMethod(item.id, item.card)
                              }
                              disabled={deletePaymentMethodMutation.isPending}
                              className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                            >
                              {deletePaymentMethodMutation.isPending
                                ? "Removing..."
                                : "Remove"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add New Payment Method - only shown when there are existing payment methods */}
                  <button
                    className="text-sm text-themeDarkGray cursor-pointer hover:text-themeOrange transition-colors flex items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-themeOrange group w-full justify-center"
                    onClick={() => setNewCard(true)}
                  >
                    <div className="w-8 h-8 bg-gray-100 group-hover:bg-orange-100 rounded-full flex items-center justify-center transition-colors">
                      <svg
                        className="w-4 h-4 text-gray-500 group-hover:text-themeOrange transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                    <span className="group-hover:text-themeOrange transition-colors">
                      Add new payment method
                    </span>
                  </button>
                </>
              )}

            {/* Empty state - only shows the no payment methods message */}
            {!paymentMethodsLoading &&
              !paymentMethodsError &&
              paymentMethodsData &&
              paymentMethodsData.length === 0 && (
                <div className="border border-gray-200 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">
                    No payment methods
                  </h4>
                  <p className="text-themeDarkGray mb-4">
                    Add a payment method to get started
                  </p>
                  <button
                    className="bg-themeGreen text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    onClick={() => setNewCard(true)}
                  >
                    Add Payment Method
                  </button>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentMethods;
