/** @type {DefaultColors} */
const colors = require("tailwindcss/colors");
module.exports = {
  darkMode: ['class', '[data-mode="dark"]'],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./node_modules/vue-tailwind-datepicker/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        "background": "#232323",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-circle": " radial-gradient(circle at center,(var(--tw-gradient-stops))",
       },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
