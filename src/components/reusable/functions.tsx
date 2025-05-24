import moment from "moment";
//export const stadia = "fdcd2695-e5e1-4888-b985-4ffc0cccc317";
export const stadia = "";
export const mapStyle =
  "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=";
export function isCompleted(input) {
  return {
    pickup:
      !/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(
        input.pickup.phone
      ) ||
      input.pickup.name === "" ||
      input.pickup.address.street === "" ||
      input.pickup.address.lat === "" ||
      input.pickup.address.lon === ""
        ? false
        : true,
    delivery:
      !/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(
        input.delivery.phone
      ) ||
      input.delivery.name === "" ||
      input.delivery.address.street === "" ||
      input.delivery.address.lat === "" ||
      input.delivery.address.lon === ""
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

export function isCustomerCompleted(input) {
  if ("phone" in input && input.phone !== "") {
    const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    if (!phoneRegex.test(input.phone)) return false;
  }

  if ("name" in input && input.name === "") {
    return false;
  }

  if (
    "address" in input &&
    input.address &&
    "address_id" in input.address &&
    input.address.address_id === ""
  ) {
    return false;
  }

  return true;
}

export function itemCompleted(items) {
  let value = true;
  for (let i = 0; i < items.length; ++i) {
    if (items[i].description === "") {
      value = false;
      break;
    }
  }

  return value;
}

export function isEmpty(input) {
  return {
    pickup:
      (input.pickup.phone === "" || input.pickup.phone === "+1") &&
      input.pickup.name === "" &&
      input.pickup.address.street === "" &&
      input.pickup.address.lat === "" &&
      input.pickup.address.lon === ""
        ? true
        : false,
    delivery:
      input.delivery.phone === "" &&
      input.delivery.name === "" &&
      input.delivery.address.street === "" &&
      input.delivery.address.lat === "" &&
      input.delivery.address.lon === ""
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

// Custom phone formatter that ensures +1 prefix
export const enforcePhoneFormat = (e) => {
  // First run the original enforceFormat
  enforceFormat(e);

  // Additional logic to handle +1 prefix
  const input = e.target;
  const value = input.value;

  // If the user tries to delete or modify the +1 prefix, restore it
  if (!value.startsWith("+1")) {
    // If completely empty, set to +1
    if (value === "") {
      input.value = "+1";
    }
    // If user tried to modify the prefix, restore it and keep the rest
    else {
      input.value = "+1" + value.replace(/^\+1/, "");
    }
  }
};

// Helper function to capitalize first letter of each word and make every other letter lowercase
export const formatName = (str) => {
  if (!str) return "";

  return str
    .split(" ")
    .map((word) => {
      return word
        .split("")
        .map((char, index) => {
          // First letter of each word is uppercase
          if (index === 0) return char.toUpperCase();
          return char.toLowerCase();
        })
        .join("");
    })
    .join(" ");
};

// Parse clipboard text function
export const parseClipboardText = (text) => {
  // Expected format: "Junior Nicolle, 100 Wall St, 10th Floor, New York New York 10005, United States, +19175737687"
  try {
    // Basic split by commas
    const parts = text.split(",").map((part) => part.trim());

    if (parts.length < 3) {
      console.error("Clipboard text doesn't match expected format");
      return null;
    }

    // Extract name (first part)
    const name = formatName(parts[0]);

    // Extract phone number if it exists (10 digits with optional +1 prefix)
    // Look for a part that contains a sequence of 10 digits, possibly with a +1 prefix
    const phoneMatch = parts.find((part) => {
      // Remove all non-digit characters to count the digits
      const digitsOnly = part.replace(/\D/g, "");
      // Check if it has exactly 10 digits or 11 digits starting with 1
      return (
        digitsOnly.length === 10 ||
        (digitsOnly.length === 11 && digitsOnly.startsWith("1"))
      );
    });

    let phone = "";

    if (phoneMatch) {
      // Create a mock event object to use with formatPhoneWithPrefix
      const mockEvent = {
        target: { value: phoneMatch.trim() },
        preventDefault: () => {},
      };

      // Use the existing formatPhoneWithPrefix function
      formatPhoneWithPrefix(mockEvent);

      // Get the formatted phone number
      phone = mockEvent.target.value;
    }

    // Address parsing
    const addressParts = parts.slice(1, phoneMatch);

    // 1. Street is the first part of the address
    const street = addressParts[0]; // "100 Wall St"

    // 2. Apt/Floor is the second part ONLY if it's not a borough or ZIP
    const isNYCBorough = (str) =>
      [
        "new york",
        "brooklyn",
        "queens",
        "manhattan",
        "bronx",
        "staten island",
        "ny",
        "bk",
        "qn",
        "mn",
        "bx",
        "si",
      ].includes(str.toLowerCase());
    let apt = null;
    if (addressParts.length > 1) {
      const possibleApt = addressParts[1];
      const isNotBorough = !isNYCBorough(possibleApt);
      const isNotZip = !/\b\d{5}\b/.test(possibleApt);
      if (isNotBorough && isNotZip) {
        apt = possibleApt;
      }
    }

    // 3. ZIP is the last 5-digit number in the address
    let zip = null;
    const zipMatch = addressParts.join(" ").match(/\b\d{5}\b/);
    if (zipMatch) {
      zip = zipMatch[0]; // "10005"
    }

    return {
      name,
      phone,
      street,
      apt,
      zip,
    };
  } catch (error) {
    console.error("Error parsing clipboard data:", error);
    return null;
  }
};

export const formatPhoneWithPrefix = (e) => {
  console.log(e);
  if (isModifierKey(e)) {
    return;
  }

  // Get the current value
  let value = e.target.value;

  // Ensure it has the +1 prefix
  if (!value.startsWith("+1")) {
    value = "+1" + value.replace(/^\+1/, "");
  }

  // If it's just the prefix, do nothing more
  if (value === "+1") {
    e.target.value = "+1";
    return;
  }

  // Extract just the digits after the +1 prefix
  const digitsOnly = value.substring(2).replace(/\D/g, "").substring(0, 10);
  const areaCode = digitsOnly.substring(0, 3);
  const middle = digitsOnly.substring(3, 6);
  const last = digitsOnly.substring(6, 10);

  // Format with the +1 prefix preserved
  if (digitsOnly.length > 6) {
    e.target.value = `+1 (${areaCode}) ${middle}-${last}`;
  } else if (digitsOnly.length > 3) {
    e.target.value = `+1 (${areaCode}) ${middle}`;
  } else if (digitsOnly.length > 0) {
    e.target.value = `+1 (${areaCode}`;
  } else {
    e.target.value = "+1";
  }
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
  status: "delivered",
  pickup: {
    phone: "",
    name: "",
    note: "",
    access_code: "",
    apt: "",
    address: {
      address_id: "",
      formatted: "",
      street: "",
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
    access_code: "",
    external_order_id: "",
    apt: "",
    address: {
      address_id: "",
      formatted: "",
      street: "",
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
        description: "box",
        size: "xsmall",
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

export function getRouteStatusText(
  status: string,
  date?: string | Date
): { text: string; color: string } {
  const now = moment();
  const start = date ? moment(date) : null;

  if (status === "assigned" && start) {
    const minAckWindow = start.clone().subtract(90, "minutes");
    const maxAckWindow = start.clone().subtract(30, "minutes");
    if (now.isBetween(minAckWindow, maxAckWindow)) {
      return {
        text: "Awaiting Acknowledged",
        color: "#F9A825", // example color (amber/yellow)
      };
    }
  }

  switch (status) {
    case "created":
      return { text: "Awaiting driver", color: "#74C2F8" };
    case "assigned":
      return { text: "Assigned", color: "#74C2F8" };
    case "acknowledged":
      return { text: "Acknowledged", color: "#4DB6AC" };
    case "arrived":
      return { text: "Driver arrived", color: "#4DD0E1" };
    case "started":
      return { text: "Route started", color: "#B2D235" };
    case "completed":
      return { text: "Route completed", color: "#388E3C" };
    case "dropped":
      return { text: "Route dropped", color: "#757575" };
    case "missed_acknowledged":
      return { text: "Missed: never acknowledged", color: "#F03F3F" };
    case "missed_arrived":
      return { text: "Never arrived", color: "#F03F3F" };
    default:
      return { text: "Status unknown", color: "#ACACAC" };
  }
}

/** 
  //google autofill
  let autocomplete;
  let address1Field = document.getElementById("pickup_street_address_1");
  if (address1Field)
    (autocomplete = new google.maps.places.Autocomplete(address1Field, {
      componentRestrictions: { country: ["us", "ca"] },
      fields: ["address_components", "geometry"],
      types: ["address"],
    })),
      autocomplete.addListener("place_changed", fillInAddress);
  function fillInAddress() {
    // Get the place details from the autocomplete object.
    const place = this.getPlace();
    let full = "";
    let street_address_1 = "";
    let city = "";
    let state = "";
    let zip = "";
    let building = "";
    for (const component of place.address_components) {
      // @ts-ignore remove once typings fixed
      const componentType = component.types[0];
      switch (componentType) {
        case "street_number": {
          building = `${component.long_name} ${street_address_1}`;
          full = `${component.long_name} ${street_address_1}`;
          street_address_1 = `${component.long_name} ${street_address_1}`;
          break;
        }

        case "route": {
          full += component.short_name;
          street_address_1 += component.short_name;
          break;
        }

        case "locality":
          full += ", " + component.long_name;
          city = component.long_name;
          break;

        case "administrative_area_level_1": {
          full += ", " + component.short_name;
          state = component.short_name;
          break;
        }
        case "postal_code": {
          full += " " + component.long_name;
          zip = component.long_name;
          break;
        }
      }
    }
    if (building) {
      stateChanger({
        ...rest.state,
        pickup: {
          ...rest?.state?.pickup,
          location: {
            ...rest?.state?.pickup?.location,
            full: full,
            street_address_1: street_address_1,
            city: city,
            state: state,
            zip: zip,
            lat: place.geometry.location.lat(),
            lon: place.geometry.location.lng(),
          },
        },
      });
    } else {
      stateChanger({
        ...rest.state,
        pickup: {
          ...rest?.state?.pickup,
          location: {
            ...initialState.pickup.location,
          },
        },
      });
    }
  }*/
