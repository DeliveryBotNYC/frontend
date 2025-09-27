import React from "react";

interface StopIconProps {
  stopNumber: number;
  hasPickup: boolean;
  hasDelivery: boolean;
  bgColor?: string; // Optional background color prop
}

export const StopIcon: React.FC<StopIconProps> = ({
  stopNumber,
  hasPickup,
  hasDelivery,
  bgColor = "#B2D235", // Default to the original green color
}) => (
  <div className="flex-shrink-0">
    <svg viewBox="0 0 135 103" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main circle with number */}
      <path
        d="M109.074 45.9289C109.073 38.0632 106.88 30.3541 102.743 23.6694C98.6057 16.9848 92.6881 11.59 85.6565 8.0924C78.6248 4.59483 70.7583 3.13338 62.9426 3.87254C55.1268 4.61171 47.6722 7.52217 41.418 12.2762C35.1637 17.0303 30.3582 23.4393 27.5423 30.7815C24.7265 38.1238 24.0122 46.1078 25.4798 53.8347C26.9474 61.5617 30.5387 68.7248 35.8494 74.5175C41.16 80.3103 47.9792 84.5028 55.5391 86.6229C57.3759 87.1291 58.9413 88.3365 59.8995 89.9861L66.5145 101.468L72.9959 90.221C73.4823 89.3835 74.1305 88.6517 74.9025 88.0681C75.6746 87.4846 76.5551 87.0611 77.4924 86.8225C86.533 84.4722 94.5391 79.1816 100.255 71.7806C105.971 64.3796 109.073 55.2868 109.074 45.9289Z"
        fill={bgColor}
        stroke="white"
        strokeWidth="2"
        strokeMiterlimit="10"
      />

      {/* Stop number */}
      <text
        x="67"
        y="55"
        textAnchor="middle"
        fill="white"
        fontSize="26"
        fontWeight="bold"
      >
        {stopNumber}
      </text>

      {/* Pickup arrow (top right) */}
      {hasPickup && (
        <g>
          <circle
            cx="112.664"
            cy="22.1738"
            r="21.9238"
            fill={bgColor}
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M122.992 22.1725L121.115 20.2922L114.007 27.4144V11.8247H111.325V27.4144L104.213 20.2922L102.336 22.1725L112.664 32.5204L122.992 22.1725Z"
            fill="white"
          />
        </g>
      )}

      {/* Delivery arrow (bottom left) */}
      {hasDelivery && (
        <g>
          <circle
            cx="22.1328"
            cy="71.3702"
            r="21.9238"
            fill={bgColor}
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M11.8047 71.3715L13.6814 73.2518L20.7899 66.1296L20.7899 81.7193H23.4722L23.4722 66.1296L30.5837 73.2518L32.4604 71.3715L22.1326 61.0236L11.8047 71.3715Z"
            fill="white"
          />
        </g>
      )}
    </svg>
  </div>
);
