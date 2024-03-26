import PaymentMethodCard from "../components/accounts/PaymentMethodCard";

const AccountsBilling = () => {
  return (
    <div className="w-full h-full bg-white p-themePadding rounded-2xl">
      <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-between items-center">
        {/* Form */}
        <div className="w-full h-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5">
            <p className="text-lg text-black font-bold">Billing</p>
          </div>

          {/* email */}
          <div className="w-full mt-8">
            <label className="text-themeDarkGray text-xs">
              Invoice email <span className="text-themeRed">*</span>
            </label>

            {/* Input Field */}
            <input
              type="email"
              placeholder="accounting@rosefield.com"
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
            />
          </div>

          {/* Payment Verified */}
          <div className="w-full mt-2.5">
            <p className="text-xs text-paymentMethodText">Payment methods</p>

            {/* Payment Method Card */}
            <PaymentMethodCard />

            <p className="text-xs text-themeDarkGray mt-1 cursor-pointer">
              + Add new payment method
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full flex items-center justify-center">
          <button className="w-[352px] py-2.5 bg-themeGreen text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountsBilling;
