import VisaIcon from "../../assets/visa-icon.svg";

const PaymentMethodCard = () => {
  return (
    <div className="w-max px-5 py-4 rounded-2xl border border-secondaryBtnBorder flex items-center gap-10 mt-2">
      {/* Icon */}
      <div className="w-[94px] h-12 border border-secondaryBtnBorder rounded-[10px] flex items-center justify-center">
        <img src={VisaIcon} alt="visa-icon" />
      </div>

      {/* Middle Part */}
      <div>
        <p className="text-sm lg:text-base text-black">Visa ending in 7130</p>

        {/* Expire */}
        <p className="text-xs text-themeDarkGray mt-2.5">Exp. date 06/2025</p>
      </div>

      {/* Right Side */}
      <div className="px-2.5 py-1.5 bg-themeOrange rounded-full">
        <p className="text-xs text-white">Default</p>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
