import { useState } from "react";

const CompanySetupForm = () => {
  // active delivery per week btn
  const [deliveryPerWeek, setdeliveryPerWeek] = useState<string>("");

  // delivery per week state
  const deliveryData = [
    {
      id: 1,
      title: "1-5",
      quantity: "1-5",
    },
    {
      id: 2,
      title: "5-20",
      quantity: "5-20",
    },
    {
      id: 3,
      title: "20-50",
      quantity: "20-50",
    },
    {
      id: 4,
      title: "100+",
      quantity: "100+",
    },
  ];

  // form data
  const [companySetupData, setCompanySetupData] = useState({
    firstName: "",
    lastName: "",
    storetName: "",
    phoneNum: "",
    fullAddress: "",
    aptNo: "",
    accessCode: "",
    pickupNote: "",
    deliveryLimit: "",
  });

  // Submit Handler
  const formSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <form className="mt-[60px] w-full" onSubmit={formSubmitHandler}>
      {/* Form Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* First Name */}
        <div className="w-full">
          <label htmlFor="firstName" className="text-themeDarkGray text-xs">
            First name <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="firstName"
            type="text"
            placeholder="Enter your first name"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.firstName}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                firstName: e.target.value,
              })
            }
          />
        </div>

        {/* Last Name */}
        <div className="w-full">
          <label htmlFor="lastName" className="text-themeDarkGray text-xs">
            Last name <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="lastName"
            type="text"
            placeholder="Enter your last name"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.lastName}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                lastName: e.target.value,
              })
            }
          />
        </div>

        {/* Store Name */}
        <div className="w-full">
          <label htmlFor="storeName" className="text-themeDarkGray text-xs">
            Store name <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="storeName"
            type="text"
            placeholder="Enter your store name"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.storetName}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                storetName: e.target.value,
              })
            }
          />
        </div>

        {/* Phone  */}
        <div className="w-full">
          <label htmlFor="phoneField" className="text-themeDarkGray text-xs">
            Phone <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="phoneField"
            type="number"
            placeholder="Enter your phone number"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.phoneNum}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                phoneNum: e.target.value,
              })
            }
          />
        </div>

        {/* Address  */}
        <div className="w-full">
          <label htmlFor="addressField" className="text-themeDarkGray text-xs">
            Address <span className="text-themeRed">*</span>
          </label>

          {/* input */}
          <input
            required
            id="addressField"
            type="text"
            placeholder="Enter your full address"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.fullAddress}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                fullAddress: e.target.value,
              })
            }
          />
        </div>

        {/* Address Additional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Apt */}
          <div className="w-full">
            <label htmlFor="aptField" className="text-themeDarkGray text-xs">
              Apt
            </label>

            {/* input */}
            <input
              id="aptField"
              type="number"
              placeholder="Enter your Appartment No"
              className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
              value={companySetupData.aptNo}
              onChange={(e) =>
                setCompanySetupData({
                  ...companySetupData,
                  aptNo: e.target.value,
                })
              }
            />
          </div>

          {/* Access */}
          <div className="w-full">
            <label htmlFor="accessField" className="text-themeDarkGray text-xs">
              Access
            </label>

            {/* input */}
            <input
              id="accessField"
              type="number"
              placeholder="Enter your Access Code"
              className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
              value={companySetupData.accessCode}
              onChange={(e) =>
                setCompanySetupData({
                  ...companySetupData,
                  accessCode: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* Pickup note */}
        <div className="md:col-span-2">
          <label htmlFor="pickupNote" className="text-themeDarkGray text-xs">
            Courier pickup note
          </label>

          {/* INput */}
          <input
            id="pickupNote"
            type="text"
            placeholder="Please type your message"
            className="w-full text-xs sm:text-sm pb-1 text-themeLightBlack placeholder:text-themeLightBlack border-b border-b-themeLightGray focus:border-b-themeOrange outline-none"
            value={companySetupData.pickupNote}
            onChange={(e) =>
              setCompanySetupData({
                ...companySetupData,
                pickupNote: e.target.value,
              })
            }
          />
        </div>

        {/* Number of deliveries per week */}
        <div className="md:col-span-2 py-2.5">
          <p className="text-themeDarkGray text-xs">
            Number of deliveries per week
          </p>

          {/* Buttons */}
          <div className="grid grid-cols-4 gap-2.5 mt-2.5">
            {/* Btns */}
            {deliveryData.map(({ id, quantity, title }) => (
              <div
                key={id}
                className={`w-full p-2.5 shadow-btnShadow border ${
                  quantity === deliveryPerWeek
                    ? "border-themeOrange font-bold"
                    : "border-secondaryBtnBorder font-normal"
                }  rounded-lg text-center cursor-pointer`}
                onClick={() => {
                  setdeliveryPerWeek(quantity);
                  setCompanySetupData({
                    ...companySetupData,
                    deliveryLimit: quantity,
                  });
                }}
              >
                <p className="text-sm text-themeDarkGray">{title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Btn */}
      <div className="text-end mt-20">
        <button className="text-sm md:text-base text-white font-bold bg-themeGreen px-themePadding py-2.5 rounded-md hover:-translate-x-4 duration-300">
          Sign-up
        </button>
      </div>
    </form>
  );
};

export default CompanySetupForm;
