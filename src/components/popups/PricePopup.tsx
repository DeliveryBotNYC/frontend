import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { isCompleted, config } from "../reusable/functions";

const PricePopup = ({ stateChanger, ...rest }) => {
  const [givenQuote, setGivenQuote] = useState({ price: "", tip: "" });
  const navigate = useNavigate();
  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.post("https://api.dbx.delivery/orders", rest.state, config),
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
      axios.post("https://api.dbx.delivery/orders/quote", rest.state, config),
    onSuccess: (quote) => {
      setGivenQuote({ price: quote.data.price, tip: quote.data.delivery.tip });
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
      createQuote.mutate(rest?.state);
  }, [rest?.state]);
  return (
    <div className="w-full z-10 sticky left-0 bottom-0 bg-white shadow-dropdownShadow py-2.5 px-4 flex items-center justify-between gap-2.5">
      {isCompleted(rest?.state).pickup &&
      isCompleted(rest?.state).delivery &&
      isCompleted(rest?.state).timeframe ? (
        <>
          <div>
            <p className="text-sm">
              {" "}
              <span className="text-secondaryBtnBorder font-bold">
                Total:
              </span>{" "}
              <span className="line-through">$8.65</span> $
              {(parseInt(givenQuote.price) / 100).toFixed(2)} + $
              {givenQuote.tip} tip
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
