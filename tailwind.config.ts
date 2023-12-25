import type { Config } from "tailwindcss"

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            rotate: {
                360: "360deg",
            },
            animation: {
                shake: "shake 0.2s ease-in-out 0s 2",
            },
        },
    },
    darkMode: "class",
}

export default config
