import { Link } from "react-router-dom";
import OpenOrdersCard from "./OpenOrdersCard";

const OpenOrdersContainer = () => {
  return (
    <div className="my-2.5 pt-[15px] bg-white rounded-primaryRadius">
      {/* header */}
      <div className="px-12 pb-2.5">
        <p className="text-lg font-semibold">Open Orders</p>
      </div>

      {/* Data Title */}
      <div className="w-full bg-contentBg px-themePadding py-2.5 grid grid-cols-6 gap-2.5">
        <div>
          <p className="text-themeDarkGray">Order</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Pickup</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Delivery</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Driver</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Delivery ETA</p>
        </div>
        <div>
          <p className="text-themeDarkGray">Status</p>
        </div>
      </div>

      {/*  Data Card Container */}
      <div className="w-full">
        {/* Pass props to this component for dynamic data */}
        {Array.from({ length: 4 }).map((_, idx) => (
          <OpenOrdersCard key={idx} />
        ))}
      </div>

      {/* Link to the page */}
      <div className="w-full px-themePadding py-2 text-end">
        <Link to={"/orders"}>
          <p className="text-xs text-themeDarkGray">View all</p>
        </Link>
      </div>
    </div>
  );
};

export default OpenOrdersContainer;
