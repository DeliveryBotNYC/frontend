/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        themeOrange: "#EEB678",
        themeDarkGray: "#676767",
        themeLightBlack: "#1D1B20",
        themeLighterBlack: "rgba(0, 0, 0, 0.38)",
        themeLightGray: "#EFF2F6",
        themeRed: "#E00000",
        themeGreen: "#B2D235",
        themeDarkGreen: "#657A14",
        themeGray: "#808080",
        secondaryBtnBorder: "#ACACAC",
        contentBg: "#EFF2F6",
        newOrderBtnBg: "#9C9494",
        themeSecondaryGray: "#6E6E6E",
        themeDarkOrange: "#BA772B",
        themeBlue: "#176FAD",
        themeLightRed: "#B41E1E",

        primaryBorder: "rgba(0, 0, 0, 0.42)",
      },
      backgroundColor: {
        processingBtn: "rgba(237, 182, 120, 0.30)",
        assignBtn: "rgba(63, 169, 245, 0.30)",
        pickedBtn: "rgba(128, 128, 128, 0.30)",
        deliveredBtn: "rgba(178, 210, 53, 0.30)",
        cancelledBtn: "rgba(240, 63, 63, 0.30)",
      },
      boxShadow: {
        btnShadow: "0px 1px 2px 0px rgba(16, 24, 40, 0.05)",
        dropdownShadow: "0px 0px 12px 0px rgba(0, 0, 0, 0.20)",
      },
      borderRadius: {
        primaryRadius: "15px",
      },
      padding: {
        themePadding: "30px",
      },
    },
  },
  plugins: [],
};
