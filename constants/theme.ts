// ─── FinVault Design System ───────────────────────────────────────────────────

export const Colors = {
  dark: {
    background: '#0A0B1E',
    backgroundSecondary: '#0F1028',
    surface: '#141528',
    card: '#1C1E35',
    cardHighlight: '#232640',
    border: '#2A2D50',
    borderLight: '#1E2040',

    primary: '#7C6FFF',
    primaryLight: '#9D93FF',
    primaryDark: '#5A4FCC',
    primaryGlow: 'rgba(124, 111, 255, 0.2)',

    secondary: '#FF6B8A',
    secondaryLight: '#FF8FAA',
    secondaryGlow: 'rgba(255, 107, 138, 0.2)',

    accent: '#FFB830',
    accentGlow: 'rgba(255, 184, 48, 0.2)',

    success: '#00D9A0',
    successLight: '#33E5B8',
    successGlow: 'rgba(0, 217, 160, 0.2)',

    danger: '#FF4757',
    dangerLight: '#FF6B78',
    dangerGlow: 'rgba(255, 71, 87, 0.2)',

    warning: '#FFA502',
    warningGlow: 'rgba(255, 165, 2, 0.2)',

    info: '#4ECDC4',

    text: '#F0F0FF',
    textSecondary: '#8B8FA8',
    textMuted: '#4A4E6A',
    textInverse: '#0A0B1E',

    gradient: {
      primary: ['#7C6FFF', '#FF6B8A'] as [string, string],
      income: ['#00D9A0', '#00B8D9'] as [string, string],
      expense: ['#FF4757', '#FF6B8A'] as [string, string],
      card1: ['#7C6FFF', '#9D93FF'] as [string, string],
      card2: ['#FF6B8A', '#FFB830'] as [string, string],
      card3: ['#00D9A0', '#4ECDC4'] as [string, string],
      balance: ['#1C1E35', '#232640'] as [string, string],
      dark: ['#0A0B1E', '#141528'] as [string, string],
    },

    tab: {
      active: '#7C6FFF',
      inactive: '#4A4E6A',
      background: '#0F1028',
    },

    overlay: 'rgba(0, 0, 0, 0.7)',
    glassBg: 'rgba(28, 30, 53, 0.8)',
    glassBorder: 'rgba(124, 111, 255, 0.2)',
  },
  light: {
    background: '#F5F5FF',
    backgroundSecondary: '#EEEEFF',
    surface: '#FFFFFF',
    card: '#FFFFFF',
    cardHighlight: '#F8F8FF',
    border: '#E8E8FF',
    borderLight: '#F0F0FF',

    primary: '#7C6FFF',
    primaryLight: '#9D93FF',
    primaryDark: '#5A4FCC',
    primaryGlow: 'rgba(124, 111, 255, 0.15)',

    secondary: '#FF6B8A',
    secondaryLight: '#FF8FAA',
    secondaryGlow: 'rgba(255, 107, 138, 0.15)',

    accent: '#FFB830',
    accentGlow: 'rgba(255, 184, 48, 0.15)',

    success: '#00C48C',
    successLight: '#33D4A8',
    successGlow: 'rgba(0, 196, 140, 0.15)',

    danger: '#FF4757',
    dangerLight: '#FF6B78',
    dangerGlow: 'rgba(255, 71, 87, 0.15)',

    warning: '#FFA502',
    warningGlow: 'rgba(255, 165, 2, 0.15)',

    info: '#4ECDC4',

    text: '#1A1C2E',
    textSecondary: '#6B7080',
    textMuted: '#A0A3B1',
    textInverse: '#FFFFFF',

    gradient: {
      primary: ['#7C6FFF', '#FF6B8A'] as [string, string],
      income: ['#00D9A0', '#00B8D9'] as [string, string],
      expense: ['#FF4757', '#FF6B8A'] as [string, string],
      card1: ['#7C6FFF', '#9D93FF'] as [string, string],
      card2: ['#FF6B8A', '#FFB830'] as [string, string],
      card3: ['#00D9A0', '#4ECDC4'] as [string, string],
      balance: ['#7C6FFF', '#9D93FF'] as [string, string],
      dark: ['#F5F5FF', '#EEEEFF'] as [string, string],
    },

    tab: {
      active: '#7C6FFF',
      inactive: '#A0A3B1',
      background: '#FFFFFF',
    },

    overlay: 'rgba(0, 0, 0, 0.5)',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(124, 111, 255, 0.2)',
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
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primary: {
    shadowColor: '#7C6FFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
};
