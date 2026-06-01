import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        primary: "hsl(var(--primary))",
        accent: "hsl(var(--accent))",
        muted: "hsl(var(--muted))",
        border: "hsl(var(--border))"
      },
      borderRadius: {
        xl: "1.25rem",
        '2xl': "1.75rem"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(15, 23, 42, 0.35)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;
