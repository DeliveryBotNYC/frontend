import moment from "moment";

export const stadia = "fdcd2695-e5e1-4888-b985-4ffc0cccc317";
//export const stadia = "";
export const mapStyle = `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${stadia}`;

export function isCompleted(input) {
  return {
    pickup:
      !/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(input.pickup.phone) ||
      input.pickup.name === "" ||
      input.pickup.address.street_address_1 === "" ||
      input.pickup.address.lat === "" ||
      input.pickup.address.lon === ""
        ? false
        : true,
    delivery:
      !/^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(input.delivery.phone) ||
      input.delivery.name === "" ||
      input.delivery.address.street_address_1 === "" ||
      input.delivery.address.lat === "" ||
      input.delivery.address.lon === "" ||
      !isSizeOrMeasurementsComplete(input.delivery) ||
      !itemCompleted(input.delivery.items || [])
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

// Helper function to check if size or measurements are complete
function isSizeOrMeasurementsComplete(delivery) {
  // Check if size_category is set
  if (delivery.size_category) {
    return true;
  }

  // Check if all items have measurements
  if (!delivery.items || delivery.items.length === 0) {
    return false;
  }

  // All items must have length, width, and weight height
  return delivery.items.every((item) => {
    return (
      item.length !== undefined &&
      item.length !== null &&
      item.length !== "" &&
      item.width !== undefined &&
      item.width !== null &&
      item.width !== "" &&
      item.weight !== undefined &&
      item.weight !== null &&
      item.weight !== "" &&
      item.height !== null &&
      item.height !== "" &&
      item.description !== null &&
      item.description !== ""
    );
  });
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

export function isCustomerCompleted(input) {
  if ("phone" in input && input.phone !== "") {
    const phoneRegex = /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
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

export function isEmpty(input) {
  return {
    pickup:
      input.pickup.phone === "" &&
      input.pickup.name === "" &&
      input.pickup.address.street_address_1 === "" &&
      input.pickup.address.lat === "" &&
      input.pickup.address.lon === ""
        ? true
        : false,
    delivery:
      input.delivery.phone === "" &&
      input.delivery.name === "" &&
      input.delivery.address.street_address_1 === "" &&
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

// Phone format enforcement without +1 prefix
export const enforcePhoneFormat = (e) => {
  // Input must be of a valid number format or a modifier key, and not longer than ten digits
  if (!isNaN(e.key) || isModifierKey(e)) {
    return;
  } else {
    e.preventDefault();
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
  try {
    // Normalize the text - replace newlines with commas for consistent parsing
    const normalizedText = text.replace(/\n/g, ", ").trim();

    // Basic split by commas
    const parts = normalizedText
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part);

    if (parts.length < 2) {
      console.error("Clipboard text doesn't match expected format");
      return null;
    }

    // Extract name (first part)
    const name = formatName(parts[0]);

    // Extract phone number if it exists (10 digits)
    // Look for a part that contains a sequence of 10 digits
    const phoneMatch = parts.find((part) => {
      // Remove all non-digit characters to count the digits
      const digitsOnly = part.replace(/\D/g, "");
      // Check if it has exactly 10 digits (or 11 with country code)
      return digitsOnly.length === 10 || digitsOnly.length === 11;
    });

    let phone = "";

    if (phoneMatch) {
      // Extract just the digits
      let digitsOnly = phoneMatch.replace(/\D/g, "");

      // Remove leading 1 if it's 11 digits (country code)
      if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
        digitsOnly = digitsOnly.substring(1);
      }

      // Create a mock event object to use with formatPhoneWithPrefix
      const mockEvent = {
        target: { value: digitsOnly },
        preventDefault: () => {},
      };

      // Use the existing formatPhoneWithPrefix function
      formatPhoneWithPrefix(mockEvent);

      // Get the formatted phone number
      phone = mockEvent.target.value;
    }

    // Address parsing - exclude name and phone parts
    const addressParts = parts.slice(
      1,
      phoneMatch ? parts.indexOf(phoneMatch) : undefined,
    );

    // Remove empty parts and common noise words
    const cleanedAddressParts = addressParts.filter((part) => {
      const lower = part.toLowerCase();
      return (
        part &&
        !lower.includes("united states") &&
        !lower.includes("usa") &&
        part.trim().length > 0
      );
    });

    if (cleanedAddressParts.length === 0) {
      return { name, phone, street: null, apt: null, zip: null };
    }

    // 1. Street is the first part of the address
    const street = cleanedAddressParts[0];

    // 2. ZIP is the last 5-digit number in the address
    let zip = null;
    const zipMatch = cleanedAddressParts.join(" ").match(/\b\d{5}\b/);
    if (zipMatch) {
      zip = zipMatch[0];
    }

    // 3. Apt/Floor detection - look for patterns
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
      ].includes(str.toLowerCase().trim());

    const aptPatterns = [
      /^apartment\s+/i,
      /^apt\.?\s+/i,
      /^apt$/i,
      /^unit\s+/i,
      /^#/,
      /^\d+[a-z]$/i, // Like "5H"
      /^floor\s+/i,
      /^\d+(st|nd|rd|th)\s+floor$/i,
    ];

    let apt = null;

    // Check each address part for apt patterns
    for (let i = 1; i < cleanedAddressParts.length; i++) {
      const part = cleanedAddressParts[i].trim();
      const isBorough = isNYCBorough(part);
      const hasZip = /\b\d{5}\b/.test(part);

      // Skip if it's a borough or contains ZIP
      if (isBorough || hasZip) continue;

      // Check if it matches apartment patterns
      const matchesAptPattern = aptPatterns.some((pattern) =>
        pattern.test(part),
      );

      if (matchesAptPattern) {
        // Clean up the apartment value
        apt = part
          .replace(/^apartment\s+/i, "")
          .replace(/^apt\.?\s+/i, "")
          .replace(/^unit\s+/i, "")
          .trim();
        break;
      }
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
  if (isModifierKey(e)) {
    return;
  }

  // Get the current value and extract only digits
  const digitsOnly = e.target.value.replace(/\D/g, "").substring(0, 10);
  const areaCode = digitsOnly.substring(0, 3);
  const middle = digitsOnly.substring(3, 6);
  const last = digitsOnly.substring(6, 10);

  // Format without +1 prefix
  if (digitsOnly.length > 6) {
    e.target.value = `(${areaCode}) ${middle}-${last}`;
  } else if (digitsOnly.length > 3) {
    e.target.value = `(${areaCode}) ${middle}`;
  } else if (digitsOnly.length > 0) {
    e.target.value = `(${areaCode}`;
  } else {
    e.target.value = "";
  }
};

export const enforceFormat = (event) => {
  // Input must be of a valid number format or a modifier key, and not longer than ten digits
  if (!isNaN(event.key) || isModifierKey(event)) {
    return;
  } else {
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

export function handleAuthError(
  error: {
    response: { status: number; data: { message: any } };
  },
  navigate: (path: string, options?: any) => void, // Pass navigate as parameter
) {
  console.log(error);
  if (error.response?.status === 401 || error.response?.status === 403) {
    // Clear auth tokens
    localStorage.removeItem("aT");
    localStorage.removeItem("roles");

    // Navigate to login with error message
    navigate("/auth/login", {
      state: { message: error.response?.data?.message },
    });
    return true; // Indicates auth error was handled
  }
  return false; // No auth error
}

export function getRouteStatusText(
  status: string,
  date?: string | Date,
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
