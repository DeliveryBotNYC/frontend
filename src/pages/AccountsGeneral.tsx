import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useConfig, url } from "../hooks/useConfig";
const AccountsGeneral = () => {
  const config = useConfig();
  //temp bearer

  const [accountData, setaccountData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    store_name: "",
    phone: "",
    location: {
      street_address_1: "",
      street_address_2: "",
      access_code: "",
    },
    note: "",
  });
  // Get invoice data
  const { isLoading, data, error, status } = useQuery({
    queryKey: ["profile"],
    queryFn: () => {
      return axios.get(url + "/retail/profile", config).then((res) => res.data);
    },
  });

  // form data
  useEffect(() => {
    console.log("called");
    if (status === "success")
      setaccountData({
        ...accountData,
        firstname: data?.account?.firstname,
        lastname: data?.account?.lastname,
        email: data?.account?.email,
        store_name: data?.account?.store_name,
        phone: data?.account?.phone,
        location: {
          street_address_1: data?.account?.location?.street_address_1,
          street_address_2: data?.account?.location?.street_address_2,
          access_code: data?.account?.location?.access_code,
        },
        note: data?.account?.note,
      });
  }, [status === "success"]);

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
                value={accountData.firstname}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    firstname: e.target.value,
                  })
                }
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
                value={accountData.lastname}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    lastname: e.target.value,
                  })
                }
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
                value={accountData.email}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    email: e.target.value,
                  })
                }
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
                value={accountData.store_name}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none bg-transparent"
                disabled
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    store_name: e.target.value,
                  })
                }
              />
            </div>

            {/* Phone */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">
                Phone <span className="text-themeRed">*</span>
              </label>

              {/* Input Field */}
              <input
                type="text"
                value={accountData.phone}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    store_name: e.target.value,
                  })
                }
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
                value={accountData.location.street_address_1}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none bg-transparent"
                disabled
                onChange={(e) =>
                  setaccountData({
                    ...accountData,
                    location: {
                      street_address_1: e.target.value,
                      street_address_2: accountData.location?.street_address_2,
                      access_code: accountData.location?.access_code,
                    },
                  })
                }
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
                  value={accountData.location?.street_address_2}
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none bg-transparent"
                  disabled
                  onChange={(e) =>
                    setaccountData({
                      ...accountData,
                      location: {
                        street_address_1:
                          accountData.location?.street_address_1,
                        street_address_2: e.target.value,
                        access_code: accountData.location?.access_code,
                      },
                    })
                  }
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
                  value={accountData.location?.access_code}
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  onChange={(e) =>
                    setaccountData({
                      ...accountData,
                      location: {
                        street_address_1:
                          accountData.location?.street_address_1,
                        street_address_2:
                          accountData.location?.street_address_2,
                        access_code: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Courier Note */}
          <div className="w-full col-span-2">
            <label className="text-themeDarkGray text-xs">Courier note</label>

            {/* Input Field */}
            <input
              type="text"
              value={accountData.note}
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              onChange={(e) =>
                setaccountData({
                  ...accountData,
                  note: e.target.value,
                })
              }
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
