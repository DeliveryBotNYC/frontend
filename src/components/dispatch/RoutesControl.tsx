import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import ForwardIcon from "../../assets/forward.svg";

const RoutesControl = () => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);
  const routeStats = [
    {
      title: "Total",
      value: "21",
    },
    {
      title: "In progress",
      value: "11",
    },
    {
      title: "Future",
      value: "7",
    },
    {
      title: "Completed",
      value: "3",
    },
    {
      title: "Unassigned",
      value: "1",
    },
  ];

  return (
    <div className="h-200px items-center w-full flex justify-between gap-10 bg-white p-5">
      <div className="w-1/3 h-full flex justify-between gap-2.5">
        {/* Service area */}
        <select className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none">
          <option value="box">Manhattan</option>
          <option value="packets">Packets</option>
          <option value="catoon">Catoon</option>
        </select>
        {/* Date */}
        <div className="border-b border-b-contentBg pb-[2px] w-full">
          <input type="date" className="w-full" defaultValue="2024-04-25" />
        </div>
      </div>
      <div className="w-1/3 h-full flex justify-between py-2.5">
        {routeStats.map((item) => (
          <div className="w-full">
            <div className="flex gap-2.5">
              <p className="text-2xl font-semibold heading">{item.value}</p>
              <img src={ForwardIcon} alt="forward-icon" />
            </div>
            <p className="text-xs text-secondaryBtnBorder">{item.title}</p>
          </div>
        ))}
      </div>
      <div className="w-1/3 h-full flex justify-between gap-2.5 py-2.5">
        {routeStats.map((item) => (
          <div className="w-full">
            <div className="flex gap-2.5">
              <p className="text-2xl font-semibold heading">{item.value}</p>
              <img src={ForwardIcon} alt="forward-icon" />
            </div>
            <p className="text-xs text-secondaryBtnBorder">{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutesControl;
