// ============================================
// LOTUS BUSINESS — Design System : Couleurs
// ============================================

export const Colors = {
  // --- Backgrounds ---
  background: 'rgba(255, 255, 255, 1)',
  surface: '#F5F5F5',
  surfaceAlt: '#EFEFEF',

  // --- Borders ---
  border: '#E0E0E0',
  borderStrong: '#BDBDBD',

  // --- Text ---
  textPrimary: '#0A0A0A',
  textSecondary: '#6B6B6B',
  textTertiary: '#9E9E9E',
  textInverse: '#FFFFFF',

  // --- Accent ---
  accent: '#0A0A0A',
  accentHover: '#333333',

  // --- Semantic : Succès ---
  success: '#16A34A',
  successLight: '#F0FDF4',
  successBorder: '#BBF7D0',
  successText: '#15803D',

  // --- Semantic : Warning ---
  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningBorder: '#FCD34D',
  warningText: '#B45309',

  // --- Semantic : Danger ---
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  dangerBorder: '#FCA5A5',
  dangerText: '#B91C1C',

  // --- Semantic : Info ---
  info: '#2563EB',
  infoLight: '#EFF6FF',
  infoBorder: '#BFDBFE',
  infoText: '#1D4ED8',

  // --- Overlay ---
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.08)',

  // --- Transparent ---
  transparent: 'transparent',
} as const

export type ColorKey = keyof typeof Colors