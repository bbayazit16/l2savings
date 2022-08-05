/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                dongle: ["Dongle", "sans-serif"],
            },
            rotate: {
                360: "360deg",
            },
        },
    },
    plugins: [],
}
