import ContentBox from "../reusable/ContentBox";
import { Link, useNavigate } from "react-router-dom";
import CloseIcon from "../../assets/close-red.svg";
import { useConfig, url } from "../../hooks/useConfig";
import { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { useMutation } from "@tanstack/react-query";

const Customers = () => {
  const navigate = useNavigate();
  const [autoFillDropdown, setaAutoFillDropdown] = useState([]);
  const CustomerId = UseGetOrderId();
  const config = useConfig();
  const [getCustomer, setGetCustomer] = useState({
    phone_formatted: "",
    phone: "",
    name: "",
    access_code: "",
    apt: "",
    external_customer_id: "",
    address: { street: "" },
  });
  const [updatedCustomer, setUpdatedCustomer] = useState({});
  console.log(updatedCustomer);
  function handleChange(e) {
    getCustomer[e.target.id] != e.target.value
      ? setUpdatedCustomer({
          ...updatedCustomer,
          [e.target.id]: e.target.value,
        })
      : (delete updatedCustomer?.[e.target.id],
        setUpdatedCustomer(updatedCustomer));
  }
  // Get invoice data
  const { isLoading, data, error } = useQuery({
    queryKey: ["cat"],
    queryFn: () => {
      return axios
        .get(url + "/customer?customer_id=" + CustomerId, config)
        .then((res) => setGetCustomer(res.data));
    },
  });

  //address autofill
  const checkAddressExist = useMutation({
    mutationFn: (newTodo: string) =>
      axios.get(
        url + "/address?address=" + encodeURI(updatedCustomer?.address?.street),
        config
      ),
    onSuccess: (address) => {
      if (address) setaAutoFillDropdown(address.data);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  //address autofill
  function address_input(address: string) {
    for (let i = 0; i < autoFillDropdown.length; i++) {
      if (autoFillDropdown[i].formatted === address) {
        setUpdatedCustomer({
          ...updatedCustomer,
          address: autoFillDropdown[i],
        });
        return;
      }
    }
    setUpdatedCustomer({
      ...updatedCustomer,
      address: {
        street: address,
      },
    });
    checkAddressExist.mutate(address);
  }

  //submit
  const addTodoMutation = useMutation({
    mutationFn: (newTodo: string) =>
      axios.patch(
        url + "/customer?customer_id=" + CustomerId,
        updatedCustomer,
        config
      ),
    onSuccess: (data) => {
      console.log(data.data.customer_id);
      if (data.data.customer_id != CustomerId)
        navigate(`/address-book/${data.data.customer_id}`);
      setUpdatedCustomer({});
      setGetCustomer(data.data);
    },
    onError: (error) => {
      console.log(error);
      //accessTokenRef.current = data.token;
    },
  });

  return (
    <ContentBox>
      <div className="w-full h-full bg-white rounded-2xl p-5">
        {/* Header */}
        <div className="w-full flex items-center gap-5">
          <div className="w-full">
            <p className="text-lg text-themeOrange">
              <span className="text-black font-semibold">
                Customer id: {CustomerId}
              </span>
            </p>
          </div>
          <div className="w-full justify-end flex gap-5">
            {getCustomer.external_customer_id ? (
              <span className="text-black font-semibold">
                External customer id: {getCustomer.external_customer_id}
              </span>
            ) : null}
            {/* Close Icon */}
            <Link to="/address-book">
              <img src={CloseIcon} alt="download-icon" />
            </Link>
          </div>
        </div>

        <div className="w-full h-full">
          <div className="w-full grid grid-cols-2 gap-2.5 pb-3 mt-7">
            {/* Access code */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Phone</label>

              {/* Input Field */}
              <input
                id="phone"
                defaultValue={getCustomer.phone_formatted}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange(e)}
              />
            </div>

            {/* Access code */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Name</label>

              {/* Input Field */}
              <input
                id="name"
                defaultValue={getCustomer.name}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2.5 pb-3 mt-7">
            {/* Address */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Address</label>

              {/* Input Field */}
              <input
                defaultValue={getCustomer.address.street}
                type="search"
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                list="delivery_autofill"
                onChange={(e) => address_input(e.target.value)}
              />

              <datalist id="delivery_autofill">
                {autoFillDropdown.map((item, key) => (
                  <option key={key} value={item?.formatted} />
                ))}
              </datalist>
            </div>

            {/* Apt */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Apt</label>

              {/* Input Field */}
              <input
                id="apt"
                defaultValue={getCustomer.apt}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange(e)}
              />
            </div>

            {/* Access code */}
            <div className="w-full">
              <label className="text-themeDarkGray text-xs">Access code</label>

              {/* Input Field */}
              <input
                id="access_code"
                defaultValue={getCustomer.access_code}
                className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                onChange={(e) => handleChange(e)}
              />
            </div>
          </div>
          {/* Courier Note */}
          <div className="w-full col-span-2">
            <label className="text-themeDarkGray text-xs">
              Default pickup note
            </label>
            {/* Input Field */}
            <input
              type="text"
              id="default_pickup_note"
              defaultValue={getCustomer?.default_pickup_note}
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              onChange={(e) => handleChange(e)}
            />
          </div>
          {/* Courier Note */}
          <div className="w-full col-span-2">
            <label className="text-themeDarkGray text-xs">
              Default delivery note
            </label>
            {/* Input Field */}
            <input
              type="text"
              id="default_delivery_note"
              defaultValue={getCustomer?.default_delivery_note}
              className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
              onChange={(e) => handleChange(e)}
            />
          </div>
          {/* Submit Button */}
          <div className="w-full flex items-center justify-center">
            <button
              disabled={Object.keys(updatedCustomer).length < 1}
              onClick={() => addTodoMutation.mutate(updatedCustomer)}
              className={`w-[352px] py-2.5 text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200 bg-theme${
                Object.keys(updatedCustomer).length > 0 ? "Green" : "LightGray"
              }`}
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </ContentBox>
  );
};

export default Customers;
