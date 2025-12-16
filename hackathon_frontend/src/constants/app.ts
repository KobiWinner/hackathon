export const APP_ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  settings: "/settings",
} as const;

export const STORAGE_KEYS = {
  theme: "app:theme",
  onboarding: "app:onboarding",
} as const;

export const BREAKPOINTS = {
  xs: 320,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
