import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import StarRatingComponent from "react-star-rating-component";
import { useState } from "react";
const RateDeliveryMan = ({ setRateDriver, }) => {
    // State for the star value
    const [ratingValue, setRatingValue] = useState(0);
    const handleStarValue = (nextValue) => {
        setRatingValue(nextValue);
    };
    // star rate updated
    const ratingUpdated = (nextValue) => {
        setRatingValue(nextValue);
        setRateDriver(false);
    };
    return (_jsxs("div", { className: "w-full h-full bg-black bg-opacity-35 absolute inset-0 z-[99999] flex flex-col items-center justify-center", children: [_jsx("h3", { className: "text-xl font-semibold text-black", children: "How was your driver James?" }), _jsx("div", { children: _jsx(StarRatingComponent, { name: "Start-Ratinig", value: ratingValue, starCount: 5, onStarClick: (nextValue) => ratingUpdated(nextValue), onStarHover: (nextValue) => handleStarValue(nextValue), onStarHoverOut: (nextValue) => handleStarValue(nextValue), starColor: "#ffb400", emptyStarColor: "#333", editing: true }) })] }));
};
export default RateDeliveryMan;
