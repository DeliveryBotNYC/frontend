import DeliveredIcon from "../../assets/delivered.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";

const PickupForm = () => {
  return (
    <div className="w-full bg-white rounded-2xl my-5">
      {/* Header */}
      <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
        {/* Left side */}
        <div className="flex items-center gap-2.5">
          <img src={DeliveredIcon} alt="icon" />

          <p className="text-2xl text-black font-bold heading">Pickup</p>
        </div>

        {/* Right Side */}
        <div>
          <img src={RefreshIcon} alt="refresh-icon" />
        </div>
      </div>

      {/* Pickup Forms Data */}
      <div className="w-full grid grid-cols-2 gap-2.5 px-5 pb-3">
        {/* Phone */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Phone <span className="text-themeRed">*</span>
          </label>

          {/* Input Field */}
          <input
            type="number"
            placeholder="+1 (929) 374-4819"
            className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
          />
        </div>

        {/* Name */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Name <span className="text-themeRed">*</span>
          </label>

          {/* Input Field */}
          <input
            type="text"
            placeholder="Mini Flowers"
            className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
          />
        </div>

        {/* Address */}
        <div className="w-full">
          <label className="text-themeDarkGray text-xs">
            Address <span className="text-themeRed">*</span>
          </label>

          {/* Input Field */}
          <input
            type="text"
            placeholder="837 East 84th St, NY, NY, 10024"
            className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
          />
        </div>

        {/* Apt, Access code */}
        <div className="w-full flex items-center justify-between gap-2.5">
          {/* Apt */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Apt <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <input
              type="number"
              placeholder="12H"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
            />
          </div>

          {/* Access code */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Access code <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <input
              type="password"
              placeholder="*******"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
            />
          </div>
        </div>

        {/* Courier Note */}
        <div className="w-full col-span-2">
          <label className="text-themeDarkGray text-xs">&nbsp;</label>

          {/* Input Field */}
          <input
            type="text"
            placeholder="Courier note"
            className="w-full text-sm text-themeDarkGray placeholder:text-themeDarkGray pb-1 border-b border-b-contentBg outline-none"
          />
        </div>

        {/* Picture Box */}
        <div>
          <label className="text-themeDarkGray text-xs">Proof of pickup</label>

          <div className="flex items-center gap-1.5 mt-1">
            <input
              id="picture"
              type="checkbox"
              className="accent-themeLightOrangeTwo"
            />

            <label
              htmlFor="picture"
              className="text-black text-sm leading-none pt-[3px] cursor-pointer"
            >
              Picture
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PickupForm;
