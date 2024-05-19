import VisaIcon from "../../assets/visa-icon.svg";

const PaymentMethodCard = ({ item }) => {
  return (
    <div className="w-max px-5 py-4 rounded-2xl border border-secondaryBtnBorder flex items-center gap-10 mt-2">
      {/* Icon */}
      <div className="w-[94px] h-12 border border-secondaryBtnBorder rounded-[10px] flex items-center justify-center">
        <img src={VisaIcon} alt="visa-icon" />
      </div>

      {/* Middle Part */}
      <div>
        <p className="min-w-40 text-sm lg:text-base text-black">
          {item.type} ending in {item.last4}
        </p>

        {/* Expire */}
        <p className="text-xs text-themeDarkGray mt-2.5">{item.exp}</p>
      </div>

      {/* Right Side */}
      {item.default ? (
        <div className="w-24 text-center px-2.5 py-1.5 bg-themeOrange rounded-full">
          <p className="text-xs text-white">Default</p>
        </div>
      ) : (
        <div className="w-24 text-center px-2.5 py-1.5 rounded-full cursor-pointer">
          <p className="text-xs text-themeDarkGray">Set as default</p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodCard;
