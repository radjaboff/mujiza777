import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: {
            DEFAULT: "#244B2B",
            hover: "#1A3720",
            light: "#335E3B",
            subtle: "#EBF1EC",
          },
          gold: {
            DEFAULT: "#D4AF37",
            light: "#FDF0CD",
            dark: "#AA820A",
            warm: "#C59B27",
            subtle: "#FBF5E5",
          },
          cream: {
            DEFAULT: "#FBF9F4",
            soft: "#F4EFE6",
            border: "#E9E5DD",
          },
          dark: {
            DEFAULT: "#1C261E",
            muted: "#596B5E",
            subtle: "#8A998E",
          },
          berry: {
            DEFAULT: "#B83A3A",
            dark: "#9B2D30",
            light: "#FBECEC",
          },
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        luxury: "0 10px 30px -10px rgba(36, 75, 43, 0.08)",
        "luxury-lg": "0 20px 40px -15px rgba(36, 75, 43, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
