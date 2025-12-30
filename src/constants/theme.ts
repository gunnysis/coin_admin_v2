/**
 * 디자인 시스템 - 테마 상수
 */

// 색상 팔레트
export const COLORS = {
  // Primary
  primary: '#3b82f6', // blue-500
  primaryLight: '#60a5fa', // blue-400
  primaryDark: '#2563eb', // blue-600
  
  // Secondary
  secondary: '#10b981', // green-500
  secondaryLight: '#34d399', // green-400
  secondaryDark: '#059669', // green-600
  
  // Accent
  accent: '#f59e0b', // amber-500
  accentLight: '#fbbf24', // amber-400
  accentDark: '#d97706', // amber-600
  
  // Danger
  danger: '#ef4444', // red-500
  dangerLight: '#f87171', // red-400
  dangerDark: '#dc2626', // red-600
  
  // Warning
  warning: '#f59e0b', // amber-500
  warningLight: '#fbbf24', // amber-400
  
  // Success
  success: '#10b981', // green-500
  
  // Neutral Grays
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  // Background
  background: '#f9fafb', // gray-50
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  
  // Text
  textPrimary: '#1f2937', // gray-800
  textSecondary: '#6b7280', // gray-500
  textTertiary: '#9ca3af', // gray-400
  textInverse: '#ffffff',
  
  // Border
  border: '#e5e7eb', // gray-200
  borderLight: '#f3f4f6', // gray-100
  borderDark: '#d1d5db', // gray-300
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
} as const;

// 간격 시스템 (4px 기준)
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

// 타이포그래피
export const TYPOGRAPHY = {
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Font Weights
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Border Radius
export const RADIUS = {
  none: 0,
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

// Shadow Presets
export const SHADOWS = {
  sm: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// 아이콘 크기
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  base: 24,
  lg: 32,
  xl: 40,
} as const;
