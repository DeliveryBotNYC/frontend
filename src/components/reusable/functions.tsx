//export const stadia = "fdcd2695-e5e1-4888-b985-4ffc0cccc317";
export const stadia = "";
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
  status: "delivered",
  pickup: {
    phone: "",
    name: "",
    note: "",
    access_code: "",
    location: {
      address_id: "",
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
    access_code: "",
    external_order_id: "",
    location: {
      address_id: "",
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
