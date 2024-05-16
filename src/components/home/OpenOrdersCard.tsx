import StatusBtn from "../reusable/StatusBtn";
import moment from "moment";

const OpenOrdersCard = ({ item }) => {
  return (
    <div className="px-themePadding py-2 grid grid-cols-6 items-center gap-2.5 border-b-2 border-b-themeLightGray">
      {/* Order */}
      <div>
        <p>
          <span className="text-themeOrange">DBX</span>
          {item.order_id}
        </p>
      </div>

      {/* Pickup */}
      <div>
        <p className="text-xs">{item.pickup.location.street_address_1}</p>
        <p className="leading-none mt-1">{item.pickup.name}</p>
      </div>

      {/* delivery */}
      <div>
        <p className="text-xs">{item.delivery.location.street_address_1}</p>
        <p className="leading-none mt-1">{item.delivery.name}</p>
      </div>

      {/* driver */}
      <div>
        <p className="leading-none mt-1">{item.driver?.name}</p>
      </div>

      {/* Delivery ETA */}
      <div>
        <p className="leading-none mt-1">
          {moment(item.delivery.eta).format("h:mm A")}
        </p>
      </div>

      {/* Statis */}
      <div>
        <StatusBtn type="processing" />
      </div>
    </div>
  );
};

export default OpenOrdersCard;
