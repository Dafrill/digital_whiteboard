/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./dist/*.{htm,html,js}"],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"'],
        serifHeader: ['"DM Serif Text"'],
      },
      colors: {
        primary: "#01093f",
        borderColor: "#a5a7b1",
        bgPastelRose: "#f2e2e0",
      },
    },
    plugins: [],
  },
};
