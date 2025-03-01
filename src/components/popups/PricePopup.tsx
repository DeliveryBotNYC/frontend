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
      axios.post(url + "/orders", rest.state, config),
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
      axios.post(url + "/orders/quote", rest.state, config),
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
        price: quote.data.price,
        tip: quote.data.tip,
        original_price: quote.data.original_price
          ? quote.data.original_price
          : null,
      });
    },
    onError: (error) => {
      setError({ message: error.response.data.message });
    },
  });

  const createPatchQuote = useMutation({
    mutationFn: (patchQuote: string) =>
      axios.post(
        url + "/orders/quote?order_id=" + data?.order_id,
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
  return (
    <div className="w-full z-10 sticky left-0 bottom-0 bg-white shadow-dropdownShadow py-2.5 px-4 flex items-center justify-between gap-2.5">
      {isCompleted(rest?.state).pickup &&
      isCompleted(rest?.state).delivery &&
      isCompleted(rest?.state).timeframe &&
      (!isNaN(parseInt(givenQuote.price) / 100) ||
        !isNaN(parseInt(patchQuote.price) / 100)) ? (
        <>
          <div>
            <p className="text-sm">
              <span className="text-secondaryBtnBorder font-bold">
                {rest.state?.status == "new_order" ? "Total:" : "Additional:"}
              </span>
              {givenQuote.original_price ? (
                <span className="line-through">
                  ${(parseInt(givenQuote.original_price) / 100).toFixed(2)}
                </span>
              ) : null}{" "}
              {givenQuote?.price
                ? "$" +
                  (parseInt(givenQuote.price) / 100).toFixed(2) +
                  " + $" +
                  (parseInt(givenQuote.tip) / 100).toFixed(2) +
                  " tip"
                : "+$" +
                  (
                    (parseInt(patchQuote.price) +
                      parseInt(patchQuote.tip) -
                      (parseInt(patchQuote.previous_price) +
                        parseInt(patchQuote.previous_tip))) /
                    100
                  ).toFixed(2) +
                  " ($" +
                  (parseInt(patchQuote.price) / 100).toFixed(2) +
                  " + $" +
                  (parseInt(patchQuote.tip) / 100).toFixed(2) +
                  " tip)"}
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
