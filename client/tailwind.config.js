/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0f172a",
        },
        canvas: {
          DEFAULT: "#f8fafc",
        },
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f1f5f9",
          dark: "#1e293b",
          "dark-muted": "#334155",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        accent: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#083344",
        },
        success: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
      },
      fontFamily: {
        display: ["Outfit", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 32px -8px rgba(37, 99, 235, 0.35)",
        "glow-accent": "0 0 28px -8px rgba(6, 182, 212, 0.3)",
        card: "0 4px 24px -4px rgba(15, 23, 42, 0.06)",
        "card-dark": "0 8px 32px -8px rgba(0, 0, 0, 0.4)",
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.06) 0px, transparent 50%), radial-gradient(at 100% 10%, rgba(6, 182, 212, 0.04) 0px, transparent 45%)",
        "mesh-dark":
          "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%), radial-gradient(at 100% 20%, rgba(6, 182, 212, 0.06) 0px, transparent 45%)",
        "hero-brand": "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%)",
        "hero-dark": "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #172554 100%)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};
