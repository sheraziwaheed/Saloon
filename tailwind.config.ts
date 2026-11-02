import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "var(--ink)",
        ink: "var(--ink)",
        gold: "var(--gold)",
        background: "var(--background)",
        surface: "var(--surface)",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
