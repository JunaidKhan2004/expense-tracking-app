// ─── Spendly Design System ────────────────────────────────────────────────────

export const Colors = {
  dark: {
    background: '#091413',
    backgroundSecondary: '#0D1D1C',
    surface: '#122625',
    card: '#1A332F',
    cardHighlight: '#23443F',
    border: '#285A48',
    borderLight: '#1A332F',

    primary: '#408A71',
    primaryLight: '#B0E4CC',
    primaryDark: '#285A48',
    primaryGlow: 'rgba(64, 138, 113, 0.2)',

    secondary: '#B0E4CC',
    secondaryLight: '#DFF6EC',
    secondaryGlow: 'rgba(176, 228, 204, 0.2)',

    accent: '#408A71',
    accentGlow: 'rgba(255, 184, 48, 0.2)',

    success: '#408A71',
    successLight: '#B0E4CC',
    successGlow: 'rgba(64, 138, 113, 0.2)',

    danger: '#FF4757',
    dangerLight: '#FF6B78',
    dangerGlow: 'rgba(255, 71, 87, 0.2)',

    warning: '#FFA502',
    warningGlow: 'rgba(255, 165, 2, 0.2)',

    info: '#4ECDC4',

    text: '#F0F8F6',
    textSecondary: '#A0B4B0',
    textMuted: '#5D7A75',
    textInverse: '#091413',

    gradient: {
      primary: ['#408A71', '#285A48'] as [string, string],
      income: ['#408A71', '#B0E4CC'] as [string, string],
      expense: ['#FF4757', '#285A48'] as [string, string],
      card1: ['#408A71', '#B0E4CC'] as [string, string],
      card2: ['#285A48', '#408A71'] as [string, string],
      card3: ['#B0E4CC', '#4ECDC4'] as [string, string],
      balance: ['#1A332F', '#23443F'] as [string, string],
      dark: ['#091413', '#122625'] as [string, string],
    },

    tab: {
      active: '#408A71',
      inactive: '#5D7A75',
      background: '#0D1D1C',
    },

    overlay: 'rgba(0, 0, 0, 0.7)',
    glassBg: 'rgba(26, 51, 47, 0.8)',
    glassBorder: 'rgba(64, 138, 113, 0.2)',
  },
  light: {
    background: '#F0F8F6',
    backgroundSecondary: '#E1F2ED',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardHighlight: '#F5FBF9',
    border: '#B0E4CC',
    borderLight: '#DFF6EC',

    primary: '#408A71',
    primaryLight: '#B0E4CC',
    primaryDark: '#285A48',
    primaryGlow: 'rgba(64, 138, 113, 0.15)',

    secondary: '#285A48',
    secondaryLight: '#408A71',
    secondaryGlow: 'rgba(40, 90, 72, 0.15)',

    accent: '#408A71',
    accentGlow: 'rgba(255, 184, 48, 0.15)',

    success: '#408A71',
    successLight: '#B0E4CC',
    successGlow: 'rgba(64, 138, 113, 0.15)',

    danger: '#FF4757',
    dangerLight: '#FF6B78',
    dangerGlow: 'rgba(255, 71, 87, 0.15)',

    warning: '#FFA502',
    warningGlow: 'rgba(255, 165, 2, 0.15)',

    info: '#4ECDC4',

    text: '#091413',
    textSecondary: '#408A71',
    textMuted: '#A0B4B0',
    textInverse: '#FFFFFF',

    gradient: {
      primary: ['#408A71', '#285A48'] as [string, string],
      income: ['#408A71', '#B0E4CC'] as [string, string],
      expense: ['#FF4757', '#408A71'] as [string, string],
      card1: ['#408A71', '#B0E4CC'] as [string, string],
      card2: ['#285A48', '#408A71'] as [string, string],
      card3: ['#B0E4CC', '#4ECDC4'] as [string, string],
      balance: ['#408A71', '#B0E4CC'] as [string, string],
      dark: ['#F0F8F6', '#E1F2ED'] as [string, string],
    },

    tab: {
      active: '#408A71',
      inactive: '#A0B4B0',
      background: '#FFFFFF',
    },

    overlay: 'rgba(0, 0, 0, 0.5)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(64, 138, 113, 0.2)',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 36,
  hero: 48,
};

export const FontWeight: Record<string, '400' | '500' | '600' | '700' | '800' | '900'> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

export const Shadow = {
  sm: {
    shadowColor: '#408A71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#408A71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#408A71',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: '#408A71',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};
