// ============================================
// LOTUS BUSINESS — Design System : Typographie
// ============================================

// Font Families par défaut (DM Sans)
const DMSans = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  bold: 'DMSans-Bold',
  semiBold: 'DMSans-SemiBold',
}

// Zonage Typographique — À swapper si une police Display est ajoutée (ex: General Sans)
export const FontFamily = {
  // Zone : Titans, Metrics, Headers (Géométrique/Premium)
  display: DMSans.bold,
  displaySemi: DMSans.semiBold,
  
  // Zone : Corps de texte, Descriptions (Lisibilité)
  content: DMSans.regular,
  
  // Zone : Contrôles, Labels, Boutons (Utilitaire)
  utility: DMSans.medium,
  utilityBold: DMSans.bold,

  // Compatibilité ascendante (Legacy)
  regular: DMSans.regular,
  medium: DMSans.medium,
  bold: DMSans.bold,
  semiBold: DMSans.semiBold,
} as const

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  base: 14,
  lg: 15,
  xl: 16,
  '2xl': 18,
  '3xl': 20,
  '4xl': 22,
  '5xl': 24,
  '6xl': 28,
  '7xl': 32,
  '8xl': 40,
} as const

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.7,
} as const

export const LetterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 1.5,
} as const

// Styles typographiques prédéfinis
export const TextStyles = {
  // Headings — Zone Display
  h1: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['4xl'],
    lineHeight: FontSize['4xl'] * LineHeight.tight,
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontFamily: FontFamily.display,
    fontSize: FontSize['3xl'],
    lineHeight: FontSize['3xl'] * LineHeight.tight,
  },
  h3: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize['2xl'],
    lineHeight: FontSize['2xl'] * LineHeight.normal,
  },
  h4: {
    fontFamily: FontFamily.displaySemi,
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * LineHeight.normal,
  },

  // Body — Zone Content
  bodyLg: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.lg,
    lineHeight: FontSize.lg * LineHeight.relaxed,
  },
  body: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.base,
    lineHeight: FontSize.base * LineHeight.relaxed,
  },
  bodySm: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * LineHeight.relaxed,
  },

  // Labels — Zone Utility
  label: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.sm,
    letterSpacing: LetterSpacing.wider,
  },
  labelSm: {
    fontFamily: FontFamily.utility,
    fontSize: FontSize.xs,
    letterSpacing: LetterSpacing.widest,
  },

  // Boutons — Zone Utility
  button: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.base,
    letterSpacing: LetterSpacing.wide,
  },
  buttonSm: {
    fontFamily: FontFamily.utilityBold,
    fontSize: FontSize.sm,
  },

  // Captions — Zone Content
  caption: {
    fontFamily: FontFamily.content,
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * LineHeight.normal,
  },
} as const