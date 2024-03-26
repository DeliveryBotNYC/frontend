import DeliveredBwIcon from "../../assets/delivery-bw.svg";
import RefreshIcon from "../../assets/refresh-icon.svg";
import PlusIcon from "../../assets/plus-icon.svg";
const AddDelivery = () => {
  return (
    <>
      <div className="w-full bg-white rounded-2xl my-5">
        {/* Header */}
        <div className="py-5 px-2.5 flex items-center justify-between gap-2.5">
          {/* Left side */}
          <div className="flex items-center gap-2.5">
            <img src={DeliveredBwIcon} alt="icon" />

            <p className="text-2xl text-black font-bold heading">Delivery</p>
          </div>

          {/* Right Side */}
          <div>
            <img src={RefreshIcon} alt="refresh-icon" />
          </div>
        </div>

        {/* Pickup Forms Data */}
        <div className="w-full grid grid-cols-2 gap-2.5 px-5 pb-3 mt-6">
          {/* Phone */}
          <div className="w-full">
            <label className="text-themeDarkGray text-xs">
              Phone <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <input
              type="tel"
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
          <div className="w-full col-span-2">
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
            <label className="text-themeDarkGray text-xs">
              Proof of pickup
            </label>

            {/* Proofs */}
            <div className="flex items-center gap-2.5">
              {/* Picture */}
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="DeliveryPicture"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                />

                <label
                  htmlFor="DeliveryPicture"
                  className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                >
                  Picture
                </label>
              </div>

              {/* Recipient */}
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="recipient"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                />

                <label
                  htmlFor="recipient"
                  className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                >
                  Recipient
                </label>
              </div>

              {/* Signature */}
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="signature"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                />

                <label
                  htmlFor="signature"
                  className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                >
                  Signature
                </label>
              </div>

              {/* 21+ */}
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="21+"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                />

                <label
                  htmlFor="21+"
                  className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                >
                  21+
                </label>
              </div>

              {/* pin */}
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="pin"
                  type="checkbox"
                  className="accent-themeLightOrangeTwo"
                />

                <label
                  htmlFor="pin"
                  className="text-black text-sm leading-none pt-[3px] cursor-pointer"
                >
                  Pin
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Order information */}
        <div className="px-5 pb-3 mt-6">
          {/* Heading */}
          <p className="font-bold text-sm text-black">Order information</p>

          {/* Order Information Boxes */}
          <div className="grid grid-cols-4 gap-2.5">
            {/* Tip */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Tip <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="text"
                placeholder="$"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              />
            </div>

            {/* Order ID */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">&nbsp;</label>

              {/* Input Field */}
              <input
                type="text"
                placeholder="Order #"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              />
            </div>

            {/* Quantity */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Quantity <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="number"
                placeholder="1"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              />
            </div>

            {/* Item type */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Item type <span className="text-themeRed">*</span>
              </label>

              {/* Select Field */}
              <select className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none">
                <option value="box">Box</option>
                <option value="packets">Packets</option>
                <option value="catoon">Catoon</option>
              </select>
            </div>

            {/* Add barcode or Additional Item */}
            <div className="col-span-4 flex items-center justify-between gap-2.5 py-2.5">
              {/* left */}
              <div>
                <p className="text-xs text-themeDarkGray cursor-pointer">
                  Add barcode +
                </p>
              </div>

              {/* right */}
              <div>
                <p className="text-xs text-themeDarkGray cursor-pointer">
                  Additional item +
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Delivery Button */}
      <div className="flex items-center justify-center">
        <button className="text-sm text-white bg-themeOrange flex items-center justify-center gap-2.5 py-2 px-7 rounded-full hover:translate-y-2 duration-200">
          <img src={PlusIcon} alt="plus-icon" /> Add a delivery
        </button>
      </div>
    </>
  );
};

export default AddDelivery;
