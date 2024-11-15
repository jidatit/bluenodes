// Import dependencies using ES modules
import flowbite from 'flowbite/plugin';
import autoprefixer from 'autoprefixer';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", 
    "./src/**/*.{js,jsx,ts,tsx}", 
    "node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}" // Adjust path for Flowbite components
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#0BAAC9",
          200: "rgba(11, 170, 201, 0.2)",
          300: "rgba(11, 170, 201, 0.3)",
          400: "#3DD3F1",
          700: "#0BAAC9",
        },
        gray: {
          400: "#9CA3AF",
          900: "#111928", // Custom gray-900 color
        },
        green: {
          500: "#0E9F6E",
        },
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideOut: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        slideIn: "slideIn 0.3s ease-in-out",
        slideOut: "slideOut 0.3s ease-in-out",
      },
    },
  },
  plugins: [
    flowbite,
    autoprefixer
  ],
};
