export let config = {
  headers: {
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjowLCJlbWFpbCI6InNtaTN0aEBtYWlsLmNvbSIsImlhdCI6MTcxMjUxNzE5NCwiZXhwIjoxNzQ4NTE3MTk0fQ.Tq4Hf4jYL0cRVv_pv6EP39ttuPsN_zBO7HUocL2xsNs",
  },
};

export function isCompleted(input) {
  return {
    pickup:
      !/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(
        input.pickup.phone
      ) ||
      input.pickup.name === "" ||
      input.pickup.location.street_address_1 === "" ||
      input.pickup.location.lat === "" ||
      input.pickup.location.lon === ""
        ? false
        : true,
    delivery:
      !/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(
        input.delivery.phone
      ) ||
      input.delivery.name === "" ||
      input.delivery.location.street_address_1 === "" ||
      input.delivery.location.lat === "" ||
      input.delivery.location.lon === ""
        ? false
        : true,
    timeframe:
      input.timeframe.service === "" ||
      input.timeframe.start_time === "" ||
      input.timeframe.end_time === ""
        ? false
        : true,
  };
}
export function isEmpty(input) {
  return {
    pickup:
      input.pickup.phone === "" &&
      input.pickup.name === "" &&
      input.pickup.location.street_address_1 === "" &&
      input.pickup.location.lat === "" &&
      input.pickup.location.lon === ""
        ? true
        : false,
    delivery:
      input.delivery.phone === "" &&
      input.delivery.name === "" &&
      input.delivery.location.street_address_1 === "" &&
      input.delivery.location.lat === "" &&
      input.delivery.location.lon === ""
        ? true
        : false,
  };
}

export const isModifierKey = (event) => {
  const key = event.keyCode;
  return (
    event.shiftKey === true ||
    key === 35 ||
    key === 36 || // Allow Shift, Home, End
    key === 8 ||
    key === 9 ||
    key === 13 ||
    key === 46 || // Allow Backspace, Tab, Enter, Delete
    (key > 36 && key < 41) || // Allow left, up, right, down
    // Allow Ctrl/Command + A,C,V,X,Z
    ((event.ctrlKey === true || event.metaKey === true) &&
      (key === 65 || key === 67 || key === 86 || key === 88 || key === 90))
  );
};

export const enforceFormat = (event) => {
  // Input must be of a valid number format or a modifier key, and not longer than ten digits
  if (!isNaN(event) && !isModifierKey(event)) {
    event.preventDefault();
  }
};

export const formatToPhone = (event) => {
  if (isModifierKey(event)) {
    return;
  }

  const input = event.target.value.replace(/\D/g, "").substring(0, 10); // First ten digits of input only
  const areaCode = input.substring(0, 3);
  const middle = input.substring(3, 6);
  const last = input.substring(6, 10);

  if (input.length > 6) {
    event.target.value = `(${areaCode}) ${middle}-${last}`;
  } else if (input.length > 3) {
    event.target.value = `(${areaCode}) ${middle}`;
  } else if (input.length > 0) {
    event.target.value = `(${areaCode}`;
  }
};

export const initialState = {
  pickup: {
    phone: "",
    name: "",
    note: "",
    location: {
      full: "",
      street_address_1: "",
      street_address_2: "",
      access_code: "",
      city: "",
      state: "",
      zip: "",
      lat: "",
      lon: "",
    },
    required_verification: {
      picture: false,
    },
  },
  delivery: {
    phone: "",
    name: "",
    note: "",
    tip: 0,
    external_order_id: "",
    location: {
      street_address_1: "",
      street_address_2: "",
      access_code: "",
      city: "",
      state: "",
      zip: "",
      lat: "",
      lon: "",
    },
    required_verification: {
      picture: false,
      recipient: false,
      signature: false,
    },
    items: [
      {
        quantity: 1,
        type: "box",
      },
    ],
  },
  timeframe: {
    service: "same-day",
    service_id: 0,
    start_time: "",
    end_time: "",
  },
};
