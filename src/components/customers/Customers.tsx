import ContentBox2 from "../reusable/ContentBox2";
import { Link, useNavigate } from "react-router-dom";
import BackIcon from "../../assets/arrow-back.svg";
import { useConfig, url } from "../../hooks/useConfig";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import UseGetOrderId from "../../hooks/UseGetOrderId";
import { isCustomerCompleted } from "../reusable/functions";
import moment from "moment";

interface Address {
  street: string;
  formatted?: string;
  street_address_1: string;
}

interface Customer {
  phone_formatted: string;
  phone: string;
  name: string;
  access_code: string;
  apt: string;
  external_customer_id: string;
  address: Address;
  default_pickup_note?: string;
  default_delivery_note?: string;
}

interface CustomerUpdate {
  [key: string]: any;
  address?: Address;
}

const Customers = () => {
  const navigate = useNavigate();
  const customerId = UseGetOrderId();
  const config = useConfig();
  const [autoFillDropdown, setAutoFillDropdown] = useState<Address[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    phone_formatted: "",
    phone: "",
    name: "",
    access_code: "",
    apt: "",
    external_customer_id: "",
    address: { street: "", street_address_1: "" },
  });
  const [updatedCustomer, setUpdatedCustomer] = useState<CustomerUpdate>({});
  console.log(customer);
  console.log(updatedCustomer);
  // Get customer data
  const { isLoading } = useQuery({
    queryKey: ["customer", customerId],
    queryFn: async () => {
      const res = await axios.get(`${url}/customer/${customerId}`, config);
      setCustomer(res.data.data || {});
      return res.data.data;
    },
    enabled: !!customerId,
  });

  // Address autofill mutation
  const checkAddressExist = useMutation({
    mutationFn: (address: string) =>
      axios.get(
        `${url}/address/autocomplete?address=${encodeURI(address)}`,
        config
      ),
    onSuccess: (response) => {
      if (response?.data) {
        setAutoFillDropdown(response.data.data);
      }
    },
    onError: (error) => {
      console.log("Address lookup error:", error);
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async (customerData: CustomerUpdate) => {
      return axios.patch(
        `${url}/customer?customer_id=${customerId}`,
        customerData,
        config
      );
    },
    onSuccess: (response) => {
      const newCustomerId = response.data.customer_id;
      if (newCustomerId !== customerId) {
        navigate(`/address-book/${newCustomerId}`);
      }
      setUpdatedCustomer({});
      setCustomer(response.data.data);
    },
  });

  // Handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;

      // Only update if value has changed
      if (customer[id as keyof Customer] !== value) {
        setUpdatedCustomer((prev) => ({
          ...prev,
          [id]: value,
        }));
      } else {
        setUpdatedCustomer((prev) => {
          const updated = { ...prev };
          delete updated[id];
          return updated;
        });
      }
    },
    [customer]
  );

  const handleAddressInput = useCallback(
    (address) => {
      if (customer.address.street_address_1 !== address) {
        // Check for matching address in dropdown
        const matchingAddress = autoFillDropdown.find(
          (item) => item.formatted === address
        );

        if (matchingAddress) {
          setAutoFillDropdown([]);
          if (matchingAddress.address_id == customer.address.address_id)
            setUpdatedCustomer((prevState) => {
              const updated = { ...prevState };
              delete updated.address;
              return updated;
            });
          else
            setUpdatedCustomer((prevState) => ({
              ...updatedCustomer,
              address: matchingAddress,
            }));
        } else {
          // No match, update with manual entry
          setUpdatedCustomer((prevState) => ({
            ...prevState,
            address: {
              ...prevState.address,
              street_address_1: address,
              address_id: "",
              formatted: "",
              city: "",
              state: "",
              zip: "",
              lat: "",
              lon: "",
            },
          }));

          // Only look up if address has some content
          if (address && address.trim().length > 3) {
            checkAddressExist.mutate(address);
          } else {
            setAutoFillDropdown([]);
          }
        }
      } else {
        setAutoFillDropdown([]);
        setUpdatedCustomer((prevState) => ({
          ...prevState,
          address: {
            ...customer.address,
          },
        }));
      }
    },
    [autoFillDropdown, checkAddressExist, customer.address, updatedCustomer]
  );

  // Handle form submission
  const handleSubmit = useCallback(() => {
    if (Object.keys(updatedCustomer).length > 0) {
      updateCustomerMutation.mutate(updatedCustomer);
    }
  }, [updatedCustomer, updateCustomerMutation]);

  return (
    <ContentBox2>
      <div className="w-full h-full flex flex-col bg-white rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="w-full bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Customer Profile
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>DBC ID: {customerId}</span>
                {customer.external_customer_id && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span>External ID: {customer.external_customer_id}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Link to="/customers">
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors px-3 py-2 rounded-md hover:bg-gray-100">
              <img src={BackIcon} alt="prev-icon" />
              <span className="font-medium">Back to Customers</span>
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            Loading customer data...
          </div>
        ) : (
          <div className="w-full flex-1">
            <form className="w-full px-10">
              <div className="w-full grid grid-cols-2 gap-2.5 pb-3 mt-7">
                {/* Phone */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">Phone</label>
                  <input
                    id="phone"
                    defaultValue={customer.phone_formatted}
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                    onChange={handleChange}
                  />
                </div>

                {/* Name */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">Name</label>
                  <input
                    id="name"
                    defaultValue={customer.name}
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="w-full grid grid-cols-3 gap-2.5 pb-3 mt-7">
                {/* Address */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">Address</label>
                  <input
                    autoComplete="new-password"
                    value={
                      updatedCustomer.address?.hasOwnProperty(
                        "street_address_1"
                      )
                        ? updatedCustomer.address.street_address_1
                        : customer.address.street_address_1
                    }
                    type="search"
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                    list="delivery_autofill"
                    onChange={(e) => handleAddressInput(e.target.value)}
                  />
                  <datalist id="delivery_autofill">
                    {autoFillDropdown.map((item, key) => (
                      <option key={key} value={item.formatted || item.street} />
                    ))}
                  </datalist>
                </div>

                {/* Apt */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">Apt</label>
                  <input
                    id="apt"
                    defaultValue={customer.apt}
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                    onChange={handleChange}
                  />
                </div>

                {/* Access code */}
                <div className="w-full">
                  <label className="text-themeDarkGray text-xs">
                    Access code
                  </label>
                  <input
                    id="access_code"
                    defaultValue={customer.access_code}
                    className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Default pickup note */}
              <div className="w-full col-span-2 mb-3">
                <label className="text-themeDarkGray text-xs">
                  Default pickup note
                </label>
                <input
                  type="text"
                  id="default_pickup_note"
                  defaultValue={customer.default_pickup_note}
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  onChange={handleChange}
                />
              </div>

              {/* Default delivery note */}
              <div className="w-full col-span-2 mb-5">
                <label className="text-themeDarkGray text-xs">
                  Default delivery note
                </label>
                <input
                  type="text"
                  id="default_delivery_note"
                  defaultValue={customer.default_delivery_note}
                  className="w-full text-sm text-themeLightBlack placeholder:text-themeLightBlack pb-1 border-b border-b-contentBg outline-none"
                  onChange={handleChange}
                />
              </div>

              {/* Submit Button */}
              <div className="w-full flex items-center justify-center mt-4 mb-4">
                <button
                  type="button"
                  disabled={Object.keys(updatedCustomer).length < 1}
                  onClick={handleSubmit}
                  className={`w-[352px] py-2.5 text-white shadow-btnShadow rounded-lg hover:scale-95 duration-200 ${
                    Object.keys(updatedCustomer).length > 0 &&
                    isCustomerCompleted(updatedCustomer)
                      ? "bg-themeGreen"
                      : "bg-themeLightGray cursor-not-allowed"
                  }`}
                >
                  {updateCustomerMutation.isPending ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </ContentBox2>
  );
};

export default Customers;
