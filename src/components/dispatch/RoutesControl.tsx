import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import ForwardIcon from "../../assets/forward.svg";

const RoutesControl = ({ ...rest }) => {
  // Context to grab the search input state
  const contextValue = useContext(ThemeContext);

  return (
    <div className="items-center w-full grid gap-y-4 bg-white p-3">
      <div className="h-full flex gap-2.5">
        {/* Service area */}
        <select className="w-60 text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none">
          <option value="box">Manhattan</option>
          <option value="packets">Packets</option>
          <option value="catoon">Catoon</option>
        </select>

        {/* Date */}
        <div className="border-b border-b-contentBg pb-[2px] w-60">
          <input type="date" className="w-full" defaultValue="2024-04-25" />
        </div>
      </div>
      <div className=" w-full flex gap-14 bg-white">
        {Object.entries(rest?.state).map(([key, value]) => (
          <div className="h-full py-2.5" key={key}>
            <p className="text-xs text-secondaryBtnBorder">{key}</p>
            <div className="flex gap-7">
              {(rest?.state?.[key]).map((item) => (
                <div className="w-full" key={key + "-" + item.title}>
                  <div className="flex gap-2.5">
                    <p className="text-2xl font-semibold heading">
                      {item?.value}
                    </p>
                    <img src={ForwardIcon} alt="forward-icon" />
                  </div>
                  <p className="text-xs text-secondaryBtnBorder">
                    {item?.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoutesControl;
