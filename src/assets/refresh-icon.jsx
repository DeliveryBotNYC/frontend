import React from "react";

const RefreshIcon = ({ className = "", color = "currentColor", ...props }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M23 4V10H17"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 20V14H7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.51 9.00001C4.01717 7.56445 4.87913 6.28132 6.01547 5.27879C7.1518 4.27627 8.52547 3.58966 10.0083 3.28469C11.4911 2.97971 13.0348 3.06823 14.4721 3.53988C15.9094 4.01153 17.1947 4.84552 18.19 5.95001L23 10M1 14L5.81 18.05C6.80533 19.1545 8.09063 19.9885 9.52794 20.4602C10.9652 20.9318 12.5089 21.0203 13.9917 20.7153C15.4745 20.4104 16.8482 19.7238 17.9845 18.7212C19.1209 17.7187 19.9828 16.4356 20.49 15"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RefreshIcon;
