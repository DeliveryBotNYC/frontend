import FilterIcon from "../../assets/filter-icon.svg";

const OrdersTableHeader = () => {
  return (
    <thead className="w-full bg-contentBg px-themePadding">
      <tr>
        <th>
          <div className="py-2.5">
            <p className="text-themeDarkGray font-normal text-start pl-[30px]">
              Order
            </p>
          </div>
        </th>

        <th>
          <div className="flex items-center gap-2.5 px-2.5">
            <p className="text-themeDarkGray font-normal">Status</p>
            <img src={FilterIcon} alt="filter-icon" />
          </div>
        </th>

        <th>
          <div className="flex items-center gap-2.5 px-2.5">
            <p className="text-themeDarkGray font-normal">Pickup</p>
            <img src={FilterIcon} alt="filter-icon" />
          </div>
        </th>

        <th>
          <div className="flex items-center gap-2.5 px-2.5">
            <p className="text-themeDarkGray font-normal">Delivery</p>
            <img src={FilterIcon} alt="filter-icon" />
          </div>
        </th>

        <th>
          <div className="flex items-center gap-2.5 px-2.5">
            <p className="text-themeDarkGray font-normal">Time-frame</p>
            <img src={FilterIcon} alt="filter-icon" />
          </div>
        </th>

        <th>
          <div className="flex items-center gap-2.5 pr-[30px] pl-2.5">
            <p className="text-themeDarkGray font-normal">Last updated</p>
            <img src={FilterIcon} alt="filter-icon" />
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default OrdersTableHeader;
