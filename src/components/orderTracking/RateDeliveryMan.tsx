import StarRatingComponent from "react-star-rating-component";
import React, { SetStateAction, useState } from "react";

const RateDeliveryMan = ({
  setRateDriver,
}: {
  setRateDriver: React.Dispatch<SetStateAction<boolean>>;
}) => {
  // State for the star value
  const [ratingValue, setRatingValue] = useState<number>(0);

  const handleStarValue = (nextValue: number) => {
    setRatingValue(nextValue);
  };

  // star rate updated
  const ratingUpdated = (nextValue: number) => {
    setRatingValue(nextValue);
    setRateDriver(false);
  };

  return (
    <div className="w-full h-full bg-black bg-opacity-35 absolute inset-0 z-[99999] flex flex-col items-center justify-center">
      {/* heading */}
      <h3 className="text-xl font-semibold text-black">
        How was your driver James?
      </h3>

      <div>
        <StarRatingComponent
          name={"Start-Ratinig"}
          value={ratingValue}
          starCount={5}
          onStarClick={(nextValue) => ratingUpdated(nextValue)}
          onStarHover={(nextValue) => handleStarValue(nextValue)}
          onStarHoverOut={(nextValue) => handleStarValue(nextValue)}
          starColor={"#ffb400"}
          emptyStarColor={"#333"}
          editing={true}
        />
      </div>
    </div>
  );
};

export default RateDeliveryMan;
