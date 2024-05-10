import FilterIcon from "../../assets/filter-icon.svg";
import FilterIconDown from "../../assets/filter-icon-down.svg";
import FilterIconUp from "../../assets/filter-icon-up.svg";

const OrdersTableHeader = ({ stateChanger, ...rest }) => {
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
          <div
            className="flex items-center gap-2.5 px-2.5 cursor-pointer"
            onClick={() => {
              stateChanger({
                header: "status",
                order:
                  rest.state?.header == "status" && rest.state?.order == "desc"
                    ? "asc"
                    : "desc",
              });
            }}
          >
            <p className="text-themeDarkGray font-normal">Status</p>
            <img
              src={
                rest?.state?.header == "status" && rest?.state?.order == "desc"
                  ? FilterIconDown
                  : rest?.state?.header == "status" &&
                    rest?.state?.order == "asc"
                  ? FilterIconUp
                  : FilterIcon
              }
              alt="filter-icon"
            />
          </div>
        </th>

        <th>
          <div className="flex items-center gap-2.5 px-2.5">
            <p className="text-themeDarkGray font-normal">Pickup</p>
            {/*<img src={FilterIcon} alt="filter-icon" />*/}
          </div>
        </th>

        <th>
          <div
            className="flex items-center gap-2.5 px-2.5 cursor-pointer"
            onClick={() => {
              stateChanger({
                header: "name",
                order:
                  rest?.state?.header == "name" && rest?.state?.order == "desc"
                    ? "asc"
                    : "desc",
              });
            }}
          >
            <p className="text-themeDarkGray font-normal">Delivery</p>
            <img
              src={
                rest?.state?.header == "name" && rest?.state?.order == "desc"
                  ? FilterIconDown
                  : rest?.state?.header == "name" && rest?.state?.order == "asc"
                  ? FilterIconUp
                  : FilterIcon
              }
              alt="filter-icon"
            />
          </div>
        </th>

        <th>
          <div
            className="flex items-center gap-2.5 px-2.5 cursor-pointer"
            onClick={() => {
              stateChanger({
                header: "start_time",
                order:
                  rest.state?.header == "start_time" &&
                  rest.state?.order == "desc"
                    ? "asc"
                    : "desc",
              });
            }}
          >
            <p className="text-themeDarkGray font-normal">Time-frame</p>
            <img
              src={
                rest?.state?.header == "start_time" &&
                rest?.state?.order == "desc"
                  ? FilterIconDown
                  : rest?.state?.header == "start_time" &&
                    rest?.state?.order == "asc"
                  ? FilterIconUp
                  : FilterIcon
              }
              alt="filter-icon"
            />
          </div>
        </th>

        <th>
          <div
            className="flex items-center gap-2.5 pr-[30px] pl-2.5 cursor-pointer"
            onClick={() => {
              stateChanger({
                header: "last_updated",
                order:
                  rest?.state?.header == "last_updated" &&
                  rest?.state?.order == "desc"
                    ? "asc"
                    : "desc",
              });
            }}
          >
            <p className="text-themeDarkGray font-normal">Last updated</p>
            <img
              src={
                rest?.state?.header == "last_updated" &&
                rest?.state?.order == "desc"
                  ? FilterIconDown
                  : rest?.state?.header == "last_updated" &&
                    rest?.state?.order == "asc"
                  ? FilterIconUp
                  : FilterIcon
              }
              alt="filter-icon"
            />
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default OrdersTableHeader;
