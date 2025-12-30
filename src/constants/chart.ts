/**
 * 차트 관련 상수 정의
 */

// 차트 크기
export const CHART_CONFIG = {
  HEIGHT: 260,
  CARD_PADDING: 16,
  CARD_MARGIN: 16,
  CARD_BORDER_RADIUS: 16,
  TITLE_MARGIN_BOTTOM: 12,
  LEGEND_MARGIN_TOP: 12,
  LEGEND_ITEM_MARGIN_BOTTOM: 8,
  INDICATOR_SIZE: 8,
  INDICATOR_ACTIVE_WIDTH: 24,
  INDICATOR_GAP: 8,
} as const;

// 차트 색상 팔레트
export const CHART_COLORS = {
  PRIMARY: '#3b82f6', // blue-500
  SECONDARY: '#10b981', // green-500
  TERTIARY: '#f59e0b', // amber-500
  DANGER: '#ef4444', // red-500
  PURPLE: '#8b5cf6', // purple-500
  PINK: '#ec4899', // pink-500
  CYAN: '#06b6d4', // cyan-500
  LIME: '#84cc16', // lime-500
  ORANGE: '#f97316', // orange-500
  INDIGO: '#6366f1', // indigo-500
  GRAY: '#9ca3af', // gray-400
  GRAY_LIGHT: '#d1d5db', // gray-300
  GRAY_DARK: '#6b7280', // gray-500
  GRAY_DARKER: '#374151', // gray-700
  BACKGROUND: '#ffffff',
  BORDER: '#f3f4f6',
  BORDER_DARK: '#e5e7eb',
} as const;

// 파이 차트 색상 배열
export const PIE_CHART_COLORS = [
  CHART_COLORS.PRIMARY,
  CHART_COLORS.SECONDARY,
  CHART_COLORS.TERTIARY,
  CHART_COLORS.DANGER,
  CHART_COLORS.PURPLE,
  CHART_COLORS.PINK,
  CHART_COLORS.CYAN,
  CHART_COLORS.LIME,
  CHART_COLORS.ORANGE,
  CHART_COLORS.INDIGO,
] as const;

// 차트 설정
export const CHART_BASE_CONFIG = {
  backgroundColor: CHART_COLORS.BACKGROUND,
  backgroundGradientFrom: CHART_COLORS.BACKGROUND,
  backgroundGradientTo: CHART_COLORS.BACKGROUND,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: {
    borderRadius: CHART_CONFIG.CARD_BORDER_RADIUS,
  },
  propsForBackgroundLines: {
    strokeDasharray: '',
    stroke: CHART_COLORS.BORDER_DARK,
    strokeWidth: 1,
  },
} as const;

// 텍스트 길이 제한
export const TEXT_LIMITS = {
  BAR_CHART_LABEL: 10,
  PIE_CHART_LABEL: 12,
} as const;

// 스크롤 설정
export const SCROLL_CONFIG = {
  THROTTLE: 16,
  DECELERATION_RATE: 'fast' as const,
} as const;
