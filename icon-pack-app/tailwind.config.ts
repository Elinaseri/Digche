import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Inter",
          "sans-serif",
        ],
      },
      colors: {
        ink: {
          50: "#f7f7f8",
          100: "#eeeef1",
          200: "#d8d8df",
          300: "#b6b6c2",
          400: "#8a8a9a",
          500: "#62626f",
          600: "#46464f",
          700: "#33333a",
          800: "#1f1f24",
          900: "#0f0f12",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15,15,18,0.04), 0 8px 24px rgba(15,15,18,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
