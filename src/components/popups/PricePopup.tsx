import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { isCompleted } from "../reusable/functions";
import { url, useConfig } from "../../hooks/useConfig";

const PricePopup = ({ data, stateChanger, ...rest }) => {
  // src/utils/orderUtils.js
  const getOrderChanges = (original, updated) => {
    const hasMeasurements = (updated?.delivery?.items || []).some(
      (item) => item.exact === true, // ← add this, was checking length/width/etc
    );
    const changes = {};

    // Helper to normalize phone numbers for comparison
    const normalizePhone = (phone) => {
      if (!phone) return "";
      return phone.replace(/\D/g, ""); // Remove all non-digits
    };

    const compareObjects = (orig, upd, path = "") => {
      const result = {};

      for (const key in upd) {
        const currentPath = path ? `${path}.${key}` : key;

        // Special handling for phone numbers
        if (key === "phone" || key === "phone_formatted") {
          const origPhone = normalizePhone(orig?.[key]);
          const updPhone = normalizePhone(upd[key]);

          if (origPhone !== updPhone) {
            result[key] = upd[key];
          }
          continue;
        }

        // Special handling for items array - only compare if both exist
        if (key === "items" && Array.isArray(upd[key])) {
          console.log("Comparing items:", {
            hasOrigItems: !!orig?.[key],
            origItems: orig?.[key],
            updItems: upd[key],
          });

          // If original doesn't have items, skip comparison
          if (!orig?.[key] || !Array.isArray(orig[key])) {
            console.log("Skipping items - original doesn't have items");
            continue;
          }

          // Compare items while ignoring barcode, barcode_type, and other fields that don't affect pricing
          const normalizeItem = (item) => ({
            description: item.description,
            quantity: item.quantity,
            length: item.length ?? null,
            width: item.width ?? null,
            height: item.height ?? null,
            weight: item.weight ?? null,
          });

          const itemsChanged =
            JSON.stringify(orig[key].map(normalizeItem)) !==
            JSON.stringify(upd[key].map(normalizeItem));

          console.log("Items changed:", itemsChanged);

          if (itemsChanged) {
            result[key] = upd[key];
          }
          continue;
        }

        // Handle nested objects
        if (
          typeof upd[key] === "object" &&
          upd[key] !== null &&
          !Array.isArray(upd[key])
        ) {
          const nestedChanges = compareObjects(
            orig?.[key] || {},
            upd[key],
            currentPath,
          );
          if (Object.keys(nestedChanges).length > 0) {
            result[key] = nestedChanges;
          }
        }
        // Handle primitive values
        else if (JSON.stringify(orig?.[key]) !== JSON.stringify(upd[key])) {
          // Skip undefined/null to empty string changes
          if (
            (orig?.[key] === undefined ||
              orig?.[key] === null ||
              orig?.[key] === "") &&
            (upd[key] === undefined || upd[key] === null || upd[key] === "")
          ) {
            continue;
          }
          result[key] = upd[key];
        }
      }

      return result;
    };

    // Compare each section
    ["pickup", "delivery", "timeframe"].forEach((section) => {
      if (updated[section]) {
        const sectionChanges = compareObjects(
          original?.[section] || {},
          updated[section],
          section,
        );
        if (Object.keys(sectionChanges).length > 0) {
          // Always send the complete timeframe if anything changed
          if (section === "timeframe") {
            changes[section] = {
              service: updated[section].service,
              start_time: updated[section].start_time,
              end_time: updated[section].end_time,
            };
          } else {
            changes[section] = sectionChanges;
          }
        }
      }
    });
    // Compare top-level fields
    if (
      updated.user_id !== original?.user_id &&
      updated.user_id !== undefined &&
      original?.user_id !== undefined
    ) {
      changes.user_id = updated.user_id;
    }

    return changes;
  };

  const config = useConfig();
  const [givenQuote, setGivenQuote] = useState({
    price: "",
    original_price: "",
    tip: "",
    fee_breakdown: null,
  });
  const [patchQuote, setPatchQuote] = useState({
    previous_price: "",
    price: "",
    tip: "",
    fee_breakdown: null,
  });

  const [justSaved, setJustSaved] = useState(false);

  const [error, setError] = useState({ message: "" });
  const [showBreakdown, setShowBreakdown] = useState(false);
  const navigate = useNavigate();

  const addTodoMutation = useMutation({
    mutationFn: (newTodo) => {
      const isNewOrder = rest.state?.status == "new_order";

      if (isNewOrder) {
        // For new orders, send complete state
        return axios.post(url + "/order", rest.state, config);
      } else {
        // For updates, only send changed fields
        const changes = getOrderChanges(data, rest.state);
        console.log("Sending order update with changes:", changes);
        return axios.patch(`${url}/order/${data?.order_id}`, changes, config);
      }
    },
    onSuccess: (response) => {
      const isNewOrder = rest.state?.status == "new_order";

      if (isNewOrder) {
        const orderId = response.data.data.order_id;
        navigate("/orders/tracking/" + orderId);
      } else {
        const updatedData = response.data.data;
        setJustSaved(true);

        // Clear patch quote immediately so button disappears
        setPatchQuote({
          previous_price: "",
          price: "",
          tip: "",
          fee_breakdown: null,
        });

        // Update parent with full response data
        stateChanger(updatedData);
      }
    },
    onError: (error) => {
      console.log(error);
      setError({
        message: error.response?.data?.message || "Error updating order",
      });
    },
  });

  const createQuote = useMutation({
    mutationFn: (newQuote) =>
      axios.post(url + "/order/quote", rest.state, config),
    onMutate: () => {
      setError({ message: "" });
      setGivenQuote({
        price: "",
        original_price: "",
        tip: "",
        fee_breakdown: null,
      });
    },
    onSuccess: (response) => {
      console.log("Quote response:", response.data);
      // Handle nested data structure: response.data.data.pricing
      const pricing = response.data?.data;
      if (pricing) {
        setGivenQuote({
          price: pricing.fee,
          tip: pricing.delivery.tip,
          original_price: pricing.discount?.original || "",
          fee_breakdown: pricing.fee_breakdown || null,
        });
      }
    },
    onError: (error) => {
      setError({
        message: error.response?.data?.message || "Error getting quote",
      });
    },
  });

  const createPatchQuote = useMutation({
    mutationFn: (patchQuote) => {
      // Calculate only the changed fields
      const changes = getOrderChanges(data, rest.state);
      // Only send the patch request if there are actual changes
      if (Object.keys(changes).length === 0) {
        console.log("No changes detected, skipping patch quote request");
        return Promise.resolve({ data: { data: null } }); // Return empty response
      }

      console.log("Sending patch quote with changes:", changes);

      return axios.post(
        `${url}/order/quote/${data?.order_id}`,
        changes,
        config,
      );
    },
    onMutate: () => {
      setError({ message: "" });
    },
    onSuccess: (response) => {
      console.log("Patch quote response:", response.data);

      // If no actual request was made (no changes), clear the patch quote
      if (!response.data?.data) {
        setPatchQuote({
          previous_price: "",
          price: "",
          tip: "",
          fee_breakdown: null,
        });
        return;
      }

      // Handle nested data structure similar to createQuote
      const pricing = response.data?.data;
      if (pricing) {
        setPatchQuote({
          price: pricing.fee,
          tip: pricing.delivery.tip,
          previous_price: pricing.fee_breakdown.previous_fee || "",
          fee_breakdown: pricing.fee_breakdown || null,
        });
      }
    },
    onError: (error) => {
      console.log("Patch quote error:", error);
      setError({
        message: error.response?.data?.message || "Error getting quote",
      });
    },
  });

  useEffect(() => {
    if (justSaved) {
      setJustSaved(false); // reset on next state change
      return;
    }
    if (
      isCompleted(rest?.state).pickup &&
      isCompleted(rest?.state).delivery &&
      isCompleted(rest?.state).timeframe
    ) {
      if (rest.state?.status == "new_order") {
        createQuote.mutate(rest?.state);
      } else if (JSON.stringify(rest?.state) != JSON.stringify(data)) {
        if (!data?.order_id) return; // ← add this guard
        createPatchQuote.mutate(rest?.state);
      } else {
        setPatchQuote({
          previous_price: "",
          price: "",
          tip: "",
          fee_breakdown: null,
        });
      }
    } else {
      setError({ message: "" });
      setGivenQuote({
        price: "",
        original_price: "",
        tip: "",
        fee_breakdown: null,
      });
    }
  }, [rest?.state]);

  // Helper function to get fee breakdown
  const getFeeBreakdown = () => {
    const isNewOrder = rest.state?.status == "new_order";
    // Get breakdown from the appropriate state
    return isNewOrder ? givenQuote.fee_breakdown : patchQuote.fee_breakdown;
  };

  // Helper function to render pricing display
  const renderPricing = () => {
    const isNewOrder = rest.state?.status == "new_order";
    const hasPatchQuote =
      patchQuote.price && !isNaN(parseInt(patchQuote.price) / 100);
    const hasGivenQuote =
      givenQuote.price && !isNaN(parseInt(givenQuote.price) / 100);
    const breakdown = getFeeBreakdown();

    // For existing orders (viewing/editing)
    if (!isNewOrder && data) {
      const currentPrice = data.fee || 0;
      const currentTip = data.delivery.tip || 0;

      if (hasPatchQuote) {
        // Show crossed out current price and new price
        const newPrice = parseInt(patchQuote.price);
        const newTip = parseInt(patchQuote.tip);
        const prevPrice = parseInt(patchQuote.previous_price);
        const priceDiff = newPrice - prevPrice;

        return (
          <div className="flex items-start gap-2">
            <div>
              <span className="">
                Quote:
                <span className="line-through text-gray-500">
                  {" "}
                  ${(prevPrice / 100).toFixed(2)}
                </span>{" "}
                ${(newPrice / 100).toFixed(2)} + ${(newTip / 100).toFixed(2)}{" "}
                tip
              </span>
              <span className="text-sm">
                {" (+"}${(priceDiff / 100).toFixed(2)}
                {")"}
              </span>
            </div>
            {breakdown && (
              <div className="relative">
                <button
                  className="w-4 h-4 rounded-full bg-themeOrange text-white flex items-center justify-center font-bold hover:bg-orange-500 transition-colors"
                  style={{ fontSize: "9px" }}
                  onMouseEnter={() => setShowBreakdown(true)}
                  onMouseLeave={() => setShowBreakdown(false)}
                  type="button"
                >
                  i
                </button>
                {showBreakdown && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white border border-contentBg rounded-lg p-3 shadow-dropdownShadow min-w-[180px] z-50">
                    <div className="font-bold text-xs text-themeLightBlack mb-2 pb-2 border-b border-contentBg">
                      Fee Breakdown
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-themeDarkGray">
                        <span>Base Fee:</span>
                        <span className="text-themeLightBlack font-medium">
                          ${(breakdown.base / 100).toFixed(2)}
                        </span>
                      </div>
                      {breakdown.mileage_surcharge > 0 && (
                        <div className="flex justify-between text-themeDarkGray">
                          <span>Mileage:</span>
                          <span className="text-themeLightBlack font-medium">
                            ${(breakdown.mileage_surcharge / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {breakdown.item_surcharge > 0 && (
                        <div className="flex justify-between text-themeDarkGray">
                          <span>Item Fee:</span>
                          <span className="text-themeLightBlack font-medium">
                            ${(breakdown.item_surcharge / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {breakdown.time_surcharge > 0 && (
                        <div className="flex justify-between text-themeDarkGray">
                          <span>Time Fee:</span>
                          <span className="text-themeLightBlack font-medium">
                            ${(breakdown.time_surcharge / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t border-contentBg pt-2 mt-2 text-themeLightBlack text-xs">
                        <span>Total Fee:</span>
                        <span>${(newPrice / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      } else {
        // Show current price only
        return (
          <div className="flex items-start gap-2">
            <div>
              <span className="text-secondaryBtnBorder font-bold">Fee: </span>$
              {(currentPrice / 100).toFixed(2)} + $
              {(currentTip / 100).toFixed(2)} tip
            </div>
            {breakdown && (
              <div className="relative">
                <button
                  className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold hover:bg-orange-600 transition-colors"
                  style={{ fontSize: "9px" }}
                  onMouseEnter={() => setShowBreakdown(true)}
                  onMouseLeave={() => setShowBreakdown(false)}
                  type="button"
                >
                  i
                </button>
                {showBreakdown && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white border border-contentBg rounded-lg p-3 shadow-dropdownShadow min-w-[180px] z-50">
                    <div className="font-bold text-xs text-themeLightBlack mb-2 pb-2 border-b border-contentBg">
                      Fee Breakdown
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-themeDarkGray">
                        <span>Base Fee:</span>
                        <span className="text-themeLightBlack font-medium">
                          ${(breakdown.base / 100).toFixed(2)}
                        </span>
                      </div>
                      {breakdown.mileage_surcharge > 0 && (
                        <div className="flex justify-between text-themeDarkGray">
                          <span>Mileage:</span>
                          <span className="text-themeLightBlack font-medium">
                            ${(breakdown.mileage_surcharge / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {breakdown.item_surcharge > 0 && (
                        <div className="flex justify-between text-themeDarkGray">
                          <span>Item Fee:</span>
                          <span className="text-themeLightBlack font-medium">
                            ${(breakdown.item_surcharge / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {breakdown.time_surcharge > 0 && (
                        <div className="flex justify-between text-themeDarkGray">
                          <span>Time Fee:</span>
                          <span className="text-themeLightBlack font-medium">
                            ${(breakdown.time_surcharge / 100).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold border-t border-contentBg pt-2 mt-2 text-themeLightBlack text-xs">
                        <span>Total Fee:</span>
                        <span>${(currentPrice / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      }
    }

    // For new orders
    if (isNewOrder && hasGivenQuote) {
      const price = parseInt(givenQuote.price);
      const tip = parseInt(givenQuote.tip);
      const total = price + tip;

      return (
        <div className="flex items-start gap-2">
          <span className="">
            Quote: ${(price / 100).toFixed(2)} + ${(tip / 100).toFixed(2)} tip
          </span>
          {breakdown && (
            <div className="relative">
              <button
                className="w-4 h-4 rounded-full bg-themeOrange text-white flex items-center justify-center font-bold hover:bg-orange-500 transition-colors"
                style={{ fontSize: "9px" }}
                onMouseEnter={() => setShowBreakdown(true)}
                onMouseLeave={() => setShowBreakdown(false)}
                type="button"
              >
                i
              </button>
              {showBreakdown && (
                <div className="absolute bottom-full right-0 mb-2 bg-white border border-contentBg rounded-lg p-3 shadow-dropdownShadow min-w-[180px] z-50">
                  <div className="font-bold text-xs text-themeLightBlack mb-2 pb-2 border-b border-contentBg">
                    Fee Breakdown
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-themeDarkGray">
                      <span>Base Fee:</span>
                      <span className="text-themeLightBlack font-medium">
                        ${(breakdown.base / 100).toFixed(2)}
                      </span>
                    </div>
                    {breakdown.mileage_surcharge > 0 && (
                      <div className="flex justify-between text-themeDarkGray">
                        <span>Mileage:</span>
                        <span className="text-themeLightBlack font-medium">
                          ${(breakdown.mileage_surcharge / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {breakdown.item_surcharge > 0 && (
                      <div className="flex justify-between text-themeDarkGray">
                        <span>Item Fee:</span>
                        <span className="text-themeLightBlack font-medium">
                          ${(breakdown.item_surcharge / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {breakdown.time_surcharge > 0 && (
                      <div className="flex justify-between text-themeDarkGray">
                        <span>Time Fee:</span>
                        <span className="text-themeLightBlack font-medium">
                          ${(breakdown.time_surcharge / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold border-t border-contentBg pt-2 mt-2 text-themeLightBlack text-xs">
                      <span>Total Fee:</span>
                      <span>${(price / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const shouldShowActiveButton = () => {
    const isNewOrder = rest.state?.status == "new_order";

    if (justSaved) return false; // ← suppress after save

    const hasValidQuote = isNewOrder
      ? givenQuote.price && !isNaN(parseInt(givenQuote.price) / 100)
      : patchQuote.price && !isNaN(parseInt(patchQuote.price) / 100);

    return (
      isCompleted(rest?.state).pickup &&
      isCompleted(rest?.state).delivery &&
      isCompleted(rest?.state).timeframe &&
      hasValidQuote
    );
  };

  return (
    <div className="w-full z-10 sticky left-0 bottom-0 bg-white shadow-dropdownShadow py-2.5 px-4 flex items-center justify-between gap-2.5">
      {shouldShowActiveButton() ? (
        <>
          <div>
            <p className="text-sm">{renderPricing()}</p>
            <p className="text-xs text-gray-500">
              Save up to 15% when you batch orders for the same time slot
            </p>
          </div>
          <button
            className="bg-themeGreen py-2 px-themePadding text-white font-bold"
            onClick={() => addTodoMutation.mutate(rest.state)}
          >
            {rest.state?.status == "new_order" ? "Request" : "Update"}
          </button>
        </>
      ) : (
        <>
          <div>
            {error.message ? (
              <p className="text-sm text-themeRed">{error.message}</p>
            ) : rest.state?.status == "new_order" ? (
              <></>
            ) : (
              <>
                <p className="text-sm">{renderPricing()}</p>
                <p className="text-xs text-gray-500">
                  Batch discount will be automatically applied when order is
                  completed
                </p>
              </>
            )}
          </div>
          <button className="bg-themeLightGray py-2 px-themePadding text-white font-bold">
            {rest.state?.status == "new_order" ? "Request" : "Update"}
          </button>
        </>
      )}
    </div>
  );
};

export default PricePopup;
