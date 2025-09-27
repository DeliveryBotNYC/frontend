import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
        mutationFn: (newTodo) => axios.post(url + "/order", rest.state, config),
        onSuccess: (data) => {
            navigate("/orders/tracking/" + data.data.order_id);
        },
        onError: (error) => {
            console.log(error);
            //accessTokenRef.current = data.token;
        },
    });
    const createQuote = useMutation({
        mutationFn: (newQuote) => axios.post(url + "/order/quote", rest.state, config),
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
        mutationFn: (patchQuote) => axios.post(url + "/orders/quote?order_id=" + data?.order_id, rest.state, config),
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
        if (isCompleted(rest?.state).pickup &&
            isCompleted(rest?.state).delivery &&
            isCompleted(rest?.state).timeframe) {
            if (rest.state?.status == "new_order")
                createQuote.mutate(rest?.state);
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
        }
        else
            setError({ message: "" });
    }, [rest?.state]);
    return (_jsx("div", { className: "w-full z-10 sticky left-0 bottom-0 bg-white shadow-dropdownShadow py-2.5 px-4 flex items-center justify-between gap-2.5", children: isCompleted(rest?.state).pickup &&
            isCompleted(rest?.state).delivery &&
            isCompleted(rest?.state).timeframe &&
            (!isNaN(parseInt(givenQuote.price) / 100) ||
                !isNaN(parseInt(patchQuote.price) / 100)) ? (_jsxs(_Fragment, { children: [_jsx("div", { children: _jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "text-secondaryBtnBorder font-bold", children: rest.state?.status == "new_order" ? "Total:" : "Additional:" }), givenQuote.original_price != "" ? (_jsxs("span", { className: "line-through", children: ["$", (parseInt(givenQuote.original_price) / 100).toFixed(2)] })) : null, " ", givenQuote?.price
                                ? "$" +
                                    (parseInt(givenQuote.price) / 100).toFixed(2) +
                                    " + $" +
                                    (parseInt(givenQuote.tip) / 100).toFixed(2) +
                                    " tip"
                                : "+$" +
                                    ((parseInt(patchQuote.price) +
                                        parseInt(patchQuote.tip) -
                                        (parseInt(patchQuote.previous_price) +
                                            parseInt(patchQuote.previous_tip))) /
                                        100).toFixed(2) +
                                    " ($" +
                                    (parseInt(patchQuote.price) / 100).toFixed(2) +
                                    " + $" +
                                    (parseInt(patchQuote.tip) / 100).toFixed(2) +
                                    " tip)"] }) }), _jsx("button", { className: "bg-themeGreen py-2 px-themePadding text-white font-bold", onClick: () => addTodoMutation.mutate(rest.state), children: rest.state?.status == "new_order" ? "Request" : "Update" })] })) : (_jsxs(_Fragment, { children: [_jsx("div", { children: _jsx("p", { className: "text-sm text-themeRed", children: error.message ? error.message : null }) }), _jsx("button", { className: "bg-themeLightGray py-2 px-themePadding text-white font-bold", children: rest.state?.status == "new_order" ? "Request" : "Update" })] })) }));
};
export default PricePopup;
