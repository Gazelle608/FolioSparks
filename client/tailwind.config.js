/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#DAF1DE",
          100: "#C5E4CB",
          200: "#9CCDAA",
          300: "#8EB69B",
          400: "#6A9A7A",
          500: "#235347",
          600: "#1A4036",
          700: "#163832",
          800: "#0B2B26",
          900: "#051F20",
        },
        accent: {
          light: "#DAF1DE",
          DEFAULT: "#8EB69B",
          dark: "#235347",
        },
        spark: {
          DEFAULT: "#FFD966",
          light: "#FFE9A8",
          dark: "#E5B93F",
        },
        danger: "#B91C1C",
        success: "#235347",
        warning: "#D97706",
      },
      fontFamily: {
        display: ["Merriweather", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
    },
  },
  plugins: [],
};
