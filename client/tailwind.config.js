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
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdbb74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
          950: "#431407",
        },
        accent: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          950: "#451a03",
        },
        success: {
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 32px -8px rgba(37, 99, 235, 0.35)",
        "glow-accent": "0 0 28px -8px rgba(6, 182, 212, 0.3)",
        card: "0 4px 24px -4px rgba(15, 23, 42, 0.06)",
        "card-dark": "0 8px 32px -8px rgba(0, 0, 0, 0.4)",
        "festival": "0 22px 80px -28px rgba(15, 23, 42, 0.28)",
      },
      backgroundImage: {
        "mesh-light":
          "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.06) 0px, transparent 50%), radial-gradient(at 100% 10%, rgba(6, 182, 212, 0.04) 0px, transparent 45%)",
        "mesh-dark":
          "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%), radial-gradient(at 100% 20%, rgba(6, 182, 212, 0.06) 0px, transparent 45%)",
        "hero-brand": "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0891b2 100%)",
        "hero-dark": "linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #172554 100%)",
        "festival-grid":
          "linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(12px, -10px, 0)" },
        },
      },
      animation: {
        rise: "rise 0.4s ease-out both",
        floaty: "floaty 5s ease-in-out infinite",
        drift: "drift 12s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
