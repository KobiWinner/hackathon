// Helper function to create CSS variables
export const vars = (variables: Record<string, string>) => variables;

// Raw color palette for JS usage
export const palette = {
  // Primary - Okyanus Mavisi (#2f9df4)
  primary: {
    DEFAULT: "#2f9df4",
    50: "#edf7ff",
    100: "#d6ecff",
    200: "#b4ddff",
    300: "#83c7ff",
    400: "#4ba9f7",
    500: "#2f9df4",
    600: "#1f80cb",
    700: "#1e6ca8",
    800: "#1f5681",
    900: "#1f496a",
  },

  // Secondary - Su Yeşili (#22c6b5)
  secondary: {
    DEFAULT: "#22c6b5",
    50: "#ecfffb",
    100: "#c9fff5",
    200: "#97ffeb",
    300: "#59f2d8",
    400: "#30d9c2",
    500: "#22c6b5",
    600: "#169e93",
    700: "#167f78",
    800: "#17665f",
    900: "#15534f",
  },

  // Accent - Açık Mavi (#7ad8ff)
  accent: {
    DEFAULT: "#7ad8ff",
    50: "#f1fbff",
    100: "#e0f6ff",
    200: "#bdeaff",
    300: "#8edbff",
    400: "#7ad8ff",
    500: "#48c5f8",
    600: "#32a4d6",
    700: "#2f8db7",
    800: "#2c7494",
    900: "#295f79",
  },

  // Status colors
  success: {
    DEFAULT: "#16a34a",
    light: "#dcfce7",
    dark: "#15803d",
  },

  warning: {
    DEFAULT: "#f59e0b",
    light: "#fef3c7",
    dark: "#d97706",
  },

  danger: {
    DEFAULT: "#ef4444",
    light: "#fee2e2",
    dark: "#dc2626",
  },

  // Base colors
  background: "#f8fafc",
  foreground: "#0f172a",
  border: "#e2e8f0",
  muted: "#f1f5f9",
  "muted-foreground": "#64748b",
};

// CSS variables theme
export const appTheme = vars({
  "--color-background": palette.background,
  "--color-foreground": palette.foreground,
  "--color-border": palette.border,
  "--color-muted": palette.muted,
  "--color-muted-foreground": palette["muted-foreground"],

  "--color-primary": palette.primary.DEFAULT,
  "--color-primary-50": palette.primary[50],
  "--color-primary-100": palette.primary[100],
  "--color-primary-200": palette.primary[200],
  "--color-primary-300": palette.primary[300],
  "--color-primary-400": palette.primary[400],
  "--color-primary-500": palette.primary[500],
  "--color-primary-600": palette.primary[600],
  "--color-primary-700": palette.primary[700],
  "--color-primary-800": palette.primary[800],
  "--color-primary-900": palette.primary[900],

  "--color-secondary": palette.secondary.DEFAULT,
  "--color-secondary-50": palette.secondary[50],
  "--color-secondary-100": palette.secondary[100],
  "--color-secondary-200": palette.secondary[200],
  "--color-secondary-300": palette.secondary[300],
  "--color-secondary-400": palette.secondary[400],
  "--color-secondary-500": palette.secondary[500],
  "--color-secondary-600": palette.secondary[600],
  "--color-secondary-700": palette.secondary[700],
  "--color-secondary-800": palette.secondary[800],
  "--color-secondary-900": palette.secondary[900],

  "--color-accent": palette.accent.DEFAULT,
  "--color-accent-50": palette.accent[50],
  "--color-accent-100": palette.accent[100],
  "--color-accent-200": palette.accent[200],
  "--color-accent-300": palette.accent[300],
  "--color-accent-400": palette.accent[400],
  "--color-accent-500": palette.accent[500],
  "--color-accent-600": palette.accent[600],
  "--color-accent-700": palette.accent[700],
  "--color-accent-800": palette.accent[800],
  "--color-accent-900": palette.accent[900],

  "--color-success": palette.success.DEFAULT,
  "--color-success-light": palette.success.light,
  "--color-success-dark": palette.success.dark,

  "--color-warning": palette.warning.DEFAULT,
  "--color-warning-light": palette.warning.light,
  "--color-warning-dark": palette.warning.dark,

  "--color-danger": palette.danger.DEFAULT,
  "--color-danger-light": palette.danger.light,
  "--color-danger-dark": palette.danger.dark,
});

// Tailwind colors object (uses palette directly - NO CSS variables!)
export const tailwindColors = {
  background: palette.background,
  foreground: palette.foreground,
  border: palette.border,
  muted: palette.muted,
  "muted-foreground": palette["muted-foreground"],
  ring: palette.primary.DEFAULT,
  primary: palette.primary,
  secondary: palette.secondary,
  accent: palette.accent,
  success: palette.success,
  warning: palette.warning,
  danger: palette.danger,

  // Semantic Layout Colors
  "header-bg": "rgba(255, 255, 255, 0.85)",
  "header-border": palette.border,
  "footer-bg": "rgba(255, 255, 255, 0.9)",
  "footer-text": palette["muted-foreground"],
  "sidebar-bg": "#ffffff",
  "sidebar-border": palette.border,
};

export type AppColors = typeof tailwindColors;
