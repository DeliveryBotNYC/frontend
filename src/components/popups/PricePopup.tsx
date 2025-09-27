import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { isCompleted } from "../reusable/functions";
import { url, useConfig } from "../../hooks/useConfig";

const PricePopup = ({ data, stateChanger, ...rest }) => {
  const config = useConfig();
  const [givenQuote, setGivenQuote] = useState({
    price: "",
    original_price: "",
    tip: "",
  });
  const [patchQuote, setPatchQuote] = useState({
    previous_price: "",
    price: "",
    previous_tip: "",
    tip: "",
  });

  const [error, setError] = useState({ message: "" });
  const navigate = useNavigate();

  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post(url + "/order", rest.state, config),
    onSuccess: (data) => {
      navigate("/orders/tracking/" + data.data.order_id);
    },
    onError: (error) => {
      console.log(error);
      //accessTokenRef.current = data.token;
    },
  });

  const createQuote = useMutation({
    mutationFn: (newQuote: string) =>
      axios.post(url + "/order/quote", rest.state, config),
    onMutate: () => {
      setError({ message: "" });
      setGivenQuote({
        price: "",
        original_price: "",
        tip: "",
      });
    },
    onSuccess: (quote) => {
      setGivenQuote({
        price: quote.data.data.pricing.price,
        tip: quote.data.data.pricing.tip,
        original_price: quote.data.data.pricing.discount.original
          ? quote.data.data.pricing.discount.original
          : "",
      });
    },
    onError: (error) => {
      setError({ message: error.response.data.message });
    },
  });

  const createPatchQuote = useMutation({
    mutationFn: (patchQuote: string) =>
      axios.post(
        url + "/order/quote?order_id=" + data?.order_id,
        rest.state,
        config
      ),
    onSuccess: (quote) => {
      setPatchQuote({
        price: quote.data.price,
        tip: quote.data.tip,
        previous_price: quote.data.previous_price,
        previous_tip: quote.data.previous_tip,
      });
    },
    onError: (error) => {
      console.log(error);
      //accessTokenRef.current = data.token;
    },
  });

  useEffect(() => {
    if (
      isCompleted(rest?.state).pickup &&
      isCompleted(rest?.state).delivery &&
      isCompleted(rest?.state).timeframe
    ) {
      if (rest.state?.status == "new_order") createQuote.mutate(rest?.state);
      else if (JSON.stringify(rest?.state) != JSON.stringify(data))
        createPatchQuote.mutate(rest?.state);
      else {
        setPatchQuote({
          previous_price: "",
          price: "",
          previous_tip: "",
          tip: "",
        });
      }
    } else setError({ message: "" });
  }, [rest?.state]);

  // Helper function to render pricing display
  const renderPricing = () => {
    const isNewOrder = rest.state?.status == "new_order";
    const hasPatchQuote =
      patchQuote.price && !isNaN(parseInt(patchQuote.price) / 100);
    const hasGivenQuote =
      givenQuote.price && !isNaN(parseInt(givenQuote.price) / 100);

    // For existing orders (viewing/editing)
    if (!isNewOrder && data) {
      const currentPrice = data.price || 0;
      const currentTip = data.tip || 0;

      if (hasPatchQuote) {
        // Show crossed out current price and new price
        const priceDiff = parseInt(patchQuote.price) - currentPrice;
        const tipDiff = parseInt(patchQuote.tip) - currentTip;
        const totalDiff = priceDiff + tipDiff;

        return (
          <>
            {/* Current price - crossed out */}
            <span className="line-through text-gray-500">
              ${(currentPrice / 100).toFixed(2)} + $
              {(currentTip / 100).toFixed(2)} tip
            </span>
            <br />
            {/* New price */}
            <span className="text-secondaryBtnBorder font-bold">
              New Total:{" "}
            </span>
            ${(parseInt(patchQuote.price) / 100).toFixed(2)} + $
            {(parseInt(patchQuote.tip) / 100).toFixed(2)} tip
            <br />
            <span className="text-sm">
              ({totalDiff >= 0 ? "+" : ""}${(totalDiff / 100).toFixed(2)}{" "}
              change)
            </span>
          </>
        );
      } else {
        // Show current price only
        return (
          <>
            <span className="text-secondaryBtnBorder font-bold">Current: </span>
            ${(currentPrice / 100).toFixed(2)} + $
            {(currentTip / 100).toFixed(2)} tip
          </>
        );
      }
    }

    // For new orders
    if (isNewOrder && hasGivenQuote) {
      return (
        <>
          <span className="text-secondaryBtnBorder font-bold">Total: </span>
          {givenQuote.original_price && (
            <span className="line-through">
              ${(parseInt(givenQuote.original_price) / 100).toFixed(2)}
            </span>
          )}{" "}
          ${(parseInt(givenQuote.price) / 100).toFixed(2)} + $
          {(parseInt(givenQuote.tip) / 100).toFixed(2)} tip
        </>
      );
    }

    return null;
  };

  const shouldShowActiveButton = () => {
    const isNewOrder = rest.state?.status == "new_order";
    const hasValidQuote = isNewOrder
      ? !isNaN(parseInt(givenQuote.price) / 100)
      : !isNaN(parseInt(patchQuote.price) / 100) || (data && data.price);

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
            <p className="text-sm text-themeRed">
              {error.message ? error.message : null}
            </p>
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
