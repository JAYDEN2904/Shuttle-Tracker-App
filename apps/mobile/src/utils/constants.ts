export const UG_LEGON_CENTER = {
  latitude: 5.6508,
  longitude: -0.187,
} as const;

export const DEFAULT_MAP_DELTA = {
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
} as const;

/** Background location task identifier (expo-task-manager). */
export const SHUTTLE_LOCATION_TASK_NAME = "SHUTTLE_LOCATION_BROADCAST" as const;

/** @deprecated Use SHUTTLE_LOCATION_TASK_NAME */
export const LOCATION_TASK_NAME = SHUTTLE_LOCATION_TASK_NAME;

export const LOCATION_UPDATE_INTERVAL_MS = 4000 as const;

/** Minutes after which offline shuttle positions are considered stale. */
export const STALE_POSITION_THRESHOLD_MINUTES = 10 as const;

/** Minimum touch target for map markers and general UI (iOS HIG / Material). */
export const MIN_TOUCH_TARGET = 44 as const;

/** Minimum touch target for driver UI (eyes-on-road). */
export const DRIVER_MIN_TAP_HEIGHT = 60 as const;

/** Minimum readable label size while driving. */
export const DRIVER_MIN_LABEL_FONT_SIZE = 16 as const;

export const SHUTTLE_LOCATION_CHANNEL = "shuttle-locations" as const;

export const NEARBY_SHUTTLE_RADIUS_METERS = 1500 as const;

export const ETA_REFRESH_INTERVAL_MS = 15000 as const;

export const SHUTTLE_STATUSES = [
  "idle",
  "active",
  "maintenance",
  "offline",
] as const;

export const USER_ROLES = ["student", "driver", "admin"] as const;

export const ALERT_SEVERITIES = ["info", "warning", "critical"] as const;

export const COLORS = {
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryLight: "#EFF6FF",
  success: "#12B95A",
  successBg: "#DCFCE7",
  warning: "#F59E0B",
  warningBg: "#FEF3C7",
  error: "#EF4444",
  errorBg: "#FEE2E2",
  background: "#FFFFFF",
  surface: "#F8FAFC",
  surface2: "#F1F5F9",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textTertiary: "#94A3B8",
  border: "#E2E8F0",
  white: "#FFFFFF",
  driverBg: "#0D1425",
  driverSurface: "#18223A",
  driverMedium: "#253352",
  driverBorder: "#2F3F5C",
  driverText: "#D1DEFF",
  driverDim: "#6B7FA8",
  routeA: "#2563EB",
  routeB: "#12B95A",
  routeC: "#F59E0B",
  primaryAlpha20: "#2563EB33",
  primaryAlpha40: "#2563EB66",
} as const;

export const TYPOGRAPHY = {
  display: { fontSize: 28, lineHeight: 36, fontFamily: "Inter_700Bold" },
  h1: { fontSize: 24, lineHeight: 32, fontFamily: "Inter_700Bold" },
  h2: { fontSize: 20, lineHeight: 28, fontFamily: "Inter_600SemiBold" },
  h3: { fontSize: 17, lineHeight: 24, fontFamily: "Inter_600SemiBold" },
  body: { fontSize: 15, lineHeight: 22, fontFamily: "Inter_400Regular" },
  bodyMed: { fontSize: 15, lineHeight: 22, fontFamily: "Inter_500Medium" },
  caption: { fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  label: { fontSize: 12, lineHeight: 16, fontFamily: "Inter_500Medium" },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: "Inter_600SemiBold",
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 12,
  },
  glow: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  okGlow: {
    shadowColor: "#12B95A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export type TypographyVariant = keyof typeof TYPOGRAPHY;
export type ColorToken = keyof typeof COLORS;
export type ShadowToken = keyof typeof SHADOWS;
