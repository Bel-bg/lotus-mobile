// ============================================
// LOTUS BUSINESS — Design System : Spacing & Layout
// ============================================

export const Spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const

export const Radius = {
  none: 0,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const

export const Shadow = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
} as const

export const Layout = {
  // Dimensions écran
  screenPadding: 16,
  screenPaddingLg: 20,

  // Tab bar
  tabBarHeight: 64,
  tabBarPaddingBottom: 10,

  // Header
  headerHeight: 56,

  // FAB
  fabSize: 56,
  fabSizeSmall: 44,

  // Cards
  cardPadding: 16,
  cardPaddingSm: 12,

  // Inputs
  inputHeight: 48,
  inputHeightSm: 40,

  // Buttons
  buttonHeight: 52,
  buttonHeightSm: 44,
  buttonHeightXs: 36,

  // Avatar
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 56,
  avatarXl: 72,
} as const