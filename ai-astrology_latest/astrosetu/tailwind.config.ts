import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
             colors: {
               saffron: {
                 50: "#fff7ed",
                 100: "#ffedd5",
                 200: "#fed7aa",
                 300: "#fdba74",
                 400: "#fb923c",
                 500: "#f97316", // Indian Saffron
                 600: "#ea580c",
                 700: "#c2410c",
                 800: "#9a3412",
                 900: "#7c2d12"
               },
               spiritual: {
                 saffron: "#FF9933", // Indian Flag Saffron
                 white: "#FFFFFF", // Indian Flag White
                 green: "#138808", // Indian Flag Green
                 gold: "#FFD700", // Spiritual Gold
                 red: "#DC143C", // Spiritual Red
                 orange: "#FF8C00", // Spiritual Orange
                 yellow: "#FFD700", // Spiritual Yellow
                 maroon: "#800000", // Spiritual Maroon
               },
        indigo: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          // Custom dark purple matching reference images (#282C40)
          dark: "#282C40"
        },
        purple: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
          // Darker purple for headers matching reference
          dark: "#4C1D95"
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f"
        }
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2,6,23,0.08)",
        "soft-gold": "0 10px 30px rgba(244,196,48,0.15)",
        "soft-indigo": "0 10px 30px rgba(99,102,241,0.15)",
        "glow-saffron": "0 0 20px rgba(244,196,48,0.3)",
        "glow-indigo": "0 0 20px rgba(99,102,241,0.3)"
      },
      backgroundImage: {
        "gradient-saffron": "linear-gradient(135deg, #f4c048 0%, #f0a920 100%)",
        "gradient-indigo": "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
        "gradient-purple": "linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)",
        "gradient-indigo-purple": "linear-gradient(135deg, #6366f1 0%, #9333ea 100%)",
        "gradient-cosmic": "linear-gradient(135deg, rgba(244,196,48,0.1) 0%, rgba(99,102,241,0.1) 100%)"
      }
    }
  },
  plugins: []
} satisfies Config;
