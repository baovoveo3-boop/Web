import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        neonPurple: {
          DEFAULT: "#a855f7",
          dark: "#7e22ce",
        },
        neonGreen: {
          DEFAULT: "#22c55e",
          dark: "#16a34a",
        },
        zinc: {
          950: "#09090b",
          900: "#18181b",
          800: "#27272a",
          400: "#a1a1aa",
          100: "#f4f4f5",
        }
      },
    },
  },
  plugins: [],
};
export default config;

