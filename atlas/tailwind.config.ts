import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0A1628",
        foreground: "#F8FAFC",
        primary: { DEFAULT: "#3B82F6", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#0F172A", foreground: "#F8FAFC" },
        muted: { DEFAULT: "#1E293B", foreground: "#94A3B8" },
        accent: { DEFAULT: "#3B82F6", foreground: "#FFFFFF" },
        card: { DEFAULT: "#0F172A", foreground: "#F8FAFC" },
        destructive: { DEFAULT: "#EF4444", foreground: "#FFFFFF" },
        border: "#1E293B",
        input: "#1E293B",
        ring: "#3B82F6",
      },
      borderRadius: { lg: "0.75rem", md: "0.5rem", sm: "0.25rem" },
    },
  },
  plugins: [],
};

export default config;
