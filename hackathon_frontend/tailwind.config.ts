import { tailwindColors } from "./src/theme/colors";

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/shared/**/*.{js,ts,jsx,tsx}",
    "./src/features/**/*.{js,ts,jsx,tsx}",
    "./src/config/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      xs: "320px",
      sm: "480px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
    },
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
      },
    },
    extend: {
      colors: tailwindColors,
      // Fluid Typography - clamp(min, preferred, max)
      fontSize: {
        "fluid-xs": ["clamp(0.625rem, 0.6rem + 0.15vw, 0.75rem)", { lineHeight: "1.5" }],
        "fluid-sm": ["clamp(0.75rem, 0.7rem + 0.2vw, 0.875rem)", { lineHeight: "1.5" }],
        "fluid-base": ["clamp(0.875rem, 0.8rem + 0.25vw, 1rem)", { lineHeight: "1.6" }],
        "fluid-lg": ["clamp(1rem, 0.9rem + 0.4vw, 1.25rem)", { lineHeight: "1.5" }],
        "fluid-xl": ["clamp(1.125rem, 1rem + 0.5vw, 1.5rem)", { lineHeight: "1.4" }],
        "fluid-2xl": ["clamp(1.25rem, 1.1rem + 0.7vw, 1.875rem)", { lineHeight: "1.3" }],
        "fluid-3xl": ["clamp(1.5rem, 1.3rem + 0.9vw, 2.25rem)", { lineHeight: "1.2" }],
        "fluid-4xl": ["clamp(1.875rem, 1.5rem + 1.2vw, 3rem)", { lineHeight: "1.1" }],
      },
      // Fluid Spacing - responsive padding, margin, gap
      spacing: {
        13: "3.25rem",
        15: "3.75rem",
        18: "4.5rem",
        22: "5.5rem", // 88px - for header/logo area
        "fluid-1": "clamp(0.25rem, 0.2rem + 0.2vw, 0.5rem)",
        "fluid-2": "clamp(0.5rem, 0.4rem + 0.3vw, 0.75rem)",
        "fluid-3": "clamp(0.75rem, 0.6rem + 0.4vw, 1rem)",
        "fluid-4": "clamp(1rem, 0.8rem + 0.5vw, 1.5rem)",
        "fluid-5": "clamp(1.25rem, 1rem + 0.6vw, 2rem)",
        "fluid-6": "clamp(1.5rem, 1.2rem + 0.8vw, 2.5rem)",
        "fluid-8": "clamp(2rem, 1.5rem + 1vw, 3rem)",
        "fluid-10": "clamp(2.5rem, 2rem + 1.2vw, 4rem)",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 20px 60px -25px rgba(47,157,244,0.25)",
        glow: "0 0 0 1px rgba(47,157,244,0.12), 0 15px 50px -20px rgba(34,198,181,0.35)",
        "elevated-sm": "0 10px 30px -20px rgba(12,74,110,0.2)",
        "elevated-md": "0 20px 50px -24px rgba(12,74,110,0.3)",
      },
      fontFamily: {
        sans: "var(--font-geist-sans), 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
        mono: "var(--font-geist-mono), 'SFMono-Regular', Consolas, monospace",
      },
      zIndex: {
        dropdown: "60",
        sticky: "70",
        modal: "80",
        popover: "90",
        tooltip: "100",
      },
      transitionDuration: {
        150: "150ms",
        250: "250ms",
        350: "350ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 200ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
        "slide-up": "slide-up 220ms ease-out",
      },
    },
  },
};

export default config;
