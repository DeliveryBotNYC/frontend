import VisaIcon from "../../assets/visa-icon.svg";

const PaymentMethodCard = ({ type, exp, defaults }) => {
  return (
    <div className="w-max px-5 py-4 rounded-2xl border border-secondaryBtnBorder flex items-center gap-10 mt-2">
      {/* Icon */}
      <div className="w-[94px] h-12 border border-secondaryBtnBorder rounded-[10px] flex items-center justify-center">
        <img src={VisaIcon} alt="visa-icon" />
      </div>

      {/* Middle Part */}
      <div>
        <p className="text-sm lg:text-base text-black">{type}</p>

        {/* Expire */}
        <p className="text-xs text-themeDarkGray mt-2.5">{exp}</p>
      </div>

      {/* Right Side */}
      {defaults ? (
        <div className="px-2.5 py-1.5 bg-themeOrange rounded-full">
          <p className="text-xs text-white">Default</p>
        </div>
      ) : null}
    </div>
  );
};

export default PaymentMethodCard;
