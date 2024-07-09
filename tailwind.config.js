// eslint-disable-next-line no-undef
const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#0BAAC9',
          '200': 'rgba(11, 170, 201, 0.2)',
          '300': 'rgba(11, 170, 201, 0.3)',
          '400':'#3DD3F1'
        },
        gray: {
          400:'#9CA3AF',
          900: '#111928', // your custom gray-900 color
        },
        green: {
          500:'#0E9F6E',
        }
        // Add more custom colors here
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-in-out',
        slideOut: 'slideOut 0.3s ease-in-out',
      },
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}
