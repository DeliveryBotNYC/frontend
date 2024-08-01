import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { isCompleted } from "../reusable/functions";
import { url, useConfig } from "../../hooks/useConfig";

const PricePopup = ({ stateChanger, ...rest }) => {
  const config = useConfig();
  const [givenQuote, setGivenQuote] = useState({
    price: "",
    original_price: "",
    tip: "",
  });
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
      console.log(error);
      //accessTokenRef.current = data.token;
    },
  });

  useEffect(() => {
    if (
      isCompleted(rest?.state).pickup &&
      isCompleted(rest?.state).delivery &&
      isCompleted(rest?.state).timeframe
    )
      setGivenQuote({
        price: "",
        tip: "",
        original_price: "",
      });
    createQuote.mutate(rest?.state);
  }, [rest?.state]);
  return (
    <div className="w-full z-10 sticky left-0 bottom-0 bg-white shadow-dropdownShadow py-2.5 px-4 flex items-center justify-between gap-2.5">
      {isCompleted(rest?.state).pickup &&
      isCompleted(rest?.state).delivery &&
      isCompleted(rest?.state).timeframe &&
      !isNaN(parseInt(givenQuote.price) / 100) ? (
        <>
          <div>
            <p className="text-sm">
              {" "}
              <span className="text-secondaryBtnBorder font-bold">
                Total:
              </span>{" "}
              {givenQuote.original_price ? (
                <span className="line-through">
                  ${(parseInt(givenQuote.original_price) / 100).toFixed(2)}
                </span>
              ) : null}{" "}
              ${(parseInt(givenQuote.price) / 100).toFixed(2)} + $
              {(parseInt(givenQuote.tip) / 100).toFixed(2)} tip
            </p>
          </div>
          <button
            className="bg-themeGreen py-2 px-themePadding text-white font-bold"
            onClick={() => addTodoMutation.mutate(rest.state)}
          >
            Request
          </button>
        </>
      ) : (
        <>
          <div></div>
          <button className="bg-themeLightGray py-2 px-themePadding text-white font-bold">
            Request
          </button>
        </>
      )}
    </div>
  );
};

export default PricePopup;
