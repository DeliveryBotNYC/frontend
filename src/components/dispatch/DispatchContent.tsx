import ContentBox2 from "../reusable/ContentBox2";
import RoutesControl from "./RoutesControl";
import { Outlet } from "react-router-dom";
import RoutesMap from "./RoutesMap";

import { useState } from "react";

const OrderTrackingContent = () => {
  return (
    <ContentBox2>
      {/* Settings / stats (Top) */}
      <RoutesControl />
      <div className="flex h-[calc(100%-120px)]">
        {/* All Orders (Sidebar) */}
        <Outlet />

        {/* Content Box */}
        <div className="w-full h-full bg-white relative overflow-hidden">
          {/* Map */}
          <RoutesMap />
        </div>
      </div>
    </ContentBox2>
  );
};

export default OrderTrackingContent;
