import StatusBtn from "../reusable/StatusBtn";

const OpenOrdersCard = () => {
  return (
    <div className="px-themePadding py-2 grid grid-cols-6 items-center gap-2.5 border-b-2 border-b-themeLightGray">
      {/* Order */}
      <div>
        <p>
          <span className="text-themeOrange">DBX</span>8UG395
        </p>
      </div>

      {/* Pickup */}
      <div>
        <p className="text-xs">33 W 84 St</p>
        <p className="leading-none mt-1">West Side Wines</p>
      </div>

      {/* delivery */}
      <div>
        <p className="text-xs">399 Ave A</p>
        <p className="leading-none mt-1">Lowes Yip</p>
      </div>

      {/* driver */}
      <div>
        <p className="leading-none mt-1">James B.</p>
      </div>

      {/* Delivery ETA */}
      <div>
        <p className="leading-none mt-1">4:09 PM</p>
      </div>

      {/* Statis */}
      <div>
        <StatusBtn type="processing" />
      </div>
    </div>
  );
};

export default OpenOrdersCard;
