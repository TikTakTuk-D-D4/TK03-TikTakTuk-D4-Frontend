/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0B0B0B",
          soft: "#111111",
        },
        card: {
          DEFAULT: "#1A1A1A",
          hover: "#222222",
        },
        edge: {
          DEFAULT: "#2A2A2A",
          glow: "#3A2A55",
        },
        primary: {
          DEFAULT: "#9B5DE5",
          hover: "#C77DFF",
          soft: "rgba(155, 93, 229, 0.12)",
          glow: "rgba(155, 93, 229, 0.45)",
        },
        ink: {
          DEFAULT: "#FFFFFF",
          dim: "#B8B8B8",
          mute: "#707070",
        },
        success: {
          DEFAULT: "#4ADE80",
          soft: "rgba(74, 222, 128, 0.12)",
        },
        warning: {
          DEFAULT: "#FBBF24",
          soft: "rgba(251, 191, 36, 0.12)",
        },
        danger: {
          DEFAULT: "#F87171",
          soft: "rgba(248, 113, 113, 0.12)",
        },
      },
      fontFamily: {
        sans: ["Outfit", "system-ui", "sans-serif"],
        display: ["Unbounded", "system-ui", "sans-serif"],
        body: ["Outfit", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        sm: "8px",
        DEFAULT: "14px",
        lg: "20px",
      },
      boxShadow: {
        glow: "0 0 0 1px #3A2A55, 0 8px 40px -8px rgba(155, 93, 229, 0.45)",
        card: "0 4px 24px -8px rgba(0, 0, 0, 0.6)",
        "btn-primary": "0 4px 24px -8px rgba(155, 93, 229, 0.45)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #9B5DE5 0%, #C77DFF 100%)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.95) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateX(20px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease",
        "pop-in": "pop-in 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "toast-in": "toast-in 0.25s ease",
      },
    },
  },
};
