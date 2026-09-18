import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#005BAC",
        secondary: "#173A5E",
        background: "#F4F7FA",
        surface: "#FFFFFF",
        ink: "#182A3A",
        muted: "#6B7C8D",
        border: "#DDE6ED",
        positive: "#16815D",
        warning: "#C87818",
        negative: "#C04444",
        neutral: "#6B7C8D",
      },
      fontSize: {
        base: "14px",
      },
      borderRadius: {
        card: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
