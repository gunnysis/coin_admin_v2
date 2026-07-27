/**
 * 디자인 시스템 - 테마 상수 (Design Improvement Plan 반영)
 * Clean & Focused: 숫자(금액) 가독성·위계 우선
 */

// 색상 팔레트 (의미론적)
export const COLORS = {
  // Primary (Brand) - blue-600
  primary: '#2563eb',
  primaryLight: '#3b82f6',
  primaryDark: '#1d4ed8',

  // Expense (지출/삭제) - rose-500
  expense: '#f43f5e',
  expenseLight: '#fb7185',
  expenseDark: '#e11d48',

  // Income / Positive (절약/수입) - teal-500
  income: '#14b8a6',
  incomeLight: '#2dd4bf',
  incomeDark: '#0d9488',

  // Legacy aliases (호환 — 사용 중인 것만 유지, 미사용 별칭은 2026-07 정리)
  secondary: '#14b8a6', // income
  danger: '#f43f5e', // expense
  success: '#14b8a6', // income
  accentLight: '#fbbf24',
  warning: '#f59e0b',

  // Neutral (slate scale)
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',

  // Background & Surface
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',

  // Text
  textPrimary: '#0f172a',   // slate-900
  textSecondary: '#64748b', // slate-500
  textTertiary: '#94a3b8',  // slate-400
  textInverse: '#ffffff',

  // Border
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderDark: '#cbd5e1',

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',

  // Overlay & Subtle (모달 배경, primary 10% 배지 등 — 단일 소스)
  overlay: 'rgba(0, 0, 0, 0.5)',
  primarySubtle: 'rgba(37, 99, 235, 0.1)', // primary(blue-600) 10%
} as const;

/** 다크 모드용 색상 (배경·표면·텍스트 반전) */
export const COLORS_DARK = {
  ...COLORS,
  background: '#0f172a',
  surface: '#1e293b',
  surfaceElevated: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textTertiary: '#94a3b8',
  border: '#334155',
  borderLight: '#1e293b',
  borderDark: '#475569',
  gray50: '#0f172a',
  gray100: '#1e293b',
  gray200: '#334155',
  gray300: '#475569',
  gray400: '#64748b',
  gray500: '#94a3b8',
  gray600: '#cbd5e1',
  gray700: '#e2e8f0',
  gray800: '#f1f5f9',
  gray900: '#f8fafc',
  overlay: 'rgba(0, 0, 0, 0.6)',
  primarySubtle: 'rgba(59, 130, 246, 0.18)', // primaryLight(blue-500) 18% — 다크 표면 대비 확보
} as const;

// 8pt Grid (4/8 배수)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

// 타이포그래피 (Display / Heading / Body / Caption)
export const TYPOGRAPHY = {
  fontSize: {
    xs: 12,   // Caption
    sm: 14,   // Body small, Label
    base: 16, // Body
    lg: 18,   // Heading small
    xl: 20,
    '2xl': 24, // Heading
    '3xl': 30,
    '4xl': 36, // Display
    '5xl': 48,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Border Radius (Card 16px / Button 12px / Input 8px)
export const RADIUS = {
  none: 0,
  input: 8,   // rounded-lg
  button: 12, // rounded-xl
  card: 16,   // rounded-2xl
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

// Shadow (Flat & Shadow: 옅은 테두리 + shadow-sm)
export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 32,
  xl: 40,
} as const;
