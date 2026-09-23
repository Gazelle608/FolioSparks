/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        // Primary — Celestial Navy scale (50 = lightest, 900 = darkest)
        primary: {
          50: "#F0EEF6",
          100: "#E8E4EF", // pale lavender — page bg
          200: "#C7C1DC",
          300: "#A69BC2",
          400: "#8B7BA5", // dusty purple
          500: "#5A6493", // dusty slate
          600: "#3E4779", // transitional
          700: "#2A3566", // royal navy — primary CTA
          800: "#1A2255", // deep navy
          900: "#0A0F2C", // midnight navy
        },
        // Accent — purple-leaning secondary
        accent: {
          light: "#C7C1DC",
          DEFAULT: "#8B7BA5",
          dark: "#5A6493",
        },
        // Sparkle — the warm accent for Sparks currency
        spark: {
          DEFAULT: "#F4C77A",
          light: "#F9DDA8",
          dark: "#D9A552",
        },
        // Semantic
        danger: "#B91C1C",
        success: "#3E4779",
        warning: "#D97706",
        info: "#4A5BA8",
        // Celestial extras
        celestial: {
          gold: "#F4C77A",
          violet: "#8B7BA5",
          navy: "#0A0F2C",
          cream: "#F5F2EA",
        },
      },
      fontFamily: {
        display: ["Merriweather", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
      },
      fontSize: {
        "xs": ["0.75rem", { lineHeight: "1.5" }],
        "sm": ["0.875rem", { lineHeight: "1.5" }],
        "base": ["1rem", { lineHeight: "1.55" }],
        "lg": ["1.125rem", { lineHeight: "1.6" }],
        "xl": ["1.25rem", { lineHeight: "1.5" }],
        "2xl": ["1.5rem", { lineHeight: "1.3" }],
        "3xl": ["1.875rem", { lineHeight: "1.2" }],
        "4xl": ["2.25rem", { lineHeight: "1.15" }],
        "5xl": ["3rem", { lineHeight: "1.1" }],
        "6xl": ["3.75rem", { lineHeight: "1.05" }],
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(10, 15, 44, 0.06)",
        md: "0 4px 12px rgba(10, 15, 44, 0.10)",
        lg: "0 12px 32px rgba(10, 15, 44, 0.14)",
        xl: "0 24px 48px rgba(10, 15, 44, 0.18)",
        spark: "0 4px 16px rgba(244, 199, 122, 0.45)",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "fade-in": "fadeIn 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-right": "slideInRight 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        "spark-pulse": "sparkPulse 2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "heartbeat": "heartbeat 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "count-up": "countUp 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        "skeleton": "skeleton-shimmer 1.6s ease-in-out infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
