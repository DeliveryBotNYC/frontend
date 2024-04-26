import axios from "axios";
import { useQuery } from "@tanstack/react-query";
const AccountsGeneral = () => {
  //temp bearer
  let config = {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
    },
  };

  // Get invoice data
  const { isLoading, data, error } = useQuery({
    queryKey: ["profile"],
    queryFn: () => {
      return axios
        .get("https://api.dbx.delivery/retail/profile", config)
        .then((res) => res.data);
    },
  });
  return (
    <div className="w-full h-full bg-white p-themePadding rounded-2xl">
      <div className="w-full h-full bg-white rounded-2xl flex flex-col justify-between items-center">
        {/* Form */}
        <div className="w-full h-full">
          {isLoading ? (
            <div className="h-full w-full justify-center text-center">
              Loading..
            </div>
          ) : (
            ""
          )}
          {/* Header */}
          <div className="flex items-center justify-between gap-2.5">
            <p className="text-lg text-black font-bold">General</p>
          </div>

          {/* Pickup Forms Data */}
          <div className="w-full grid grid-cols-2 gap-2.5 pb-3 mt-7">
            {/* First Name */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                First Name <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="text"
                value={data?.account?.firstname}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              />
            </div>

            {/* Last NAme */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Last Name <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="text"
                value={data?.account?.lastname}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              />
            </div>

            {/* email */}
            <div className="w-full col-span-2">
              <label className="text-themeDarkGray text-xs">
                Email <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="email"
                placeholder="leo@rosefield.com"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              />
            </div>
          </div>
          {/* Update Password */}
          <p className="text-sm text-black">Update password</p>

          {/* STore */}
          <div className="flex items-center justify-between gap-2.5 mt-5">
            <p className="text-lg text-black font-bold">Store</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-2.5 pb-3 mt-3">
            {/* Store Name */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Store Name <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="text"
                placeholder="Rose Field"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              />
            </div>

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
          </div>

          {/* Courier Note */}
          <div className="w-full col-span-2">
            <label className="text-themeDarkGray text-xs">&nbsp;</label>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Courier Pickup note"
              className="w-full text-sm text-themeDarkGray placeholder:text-themeDarkGray pb-1 border-b border-b-contentBg outline-none"
            />
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

export default AccountsGeneral;
