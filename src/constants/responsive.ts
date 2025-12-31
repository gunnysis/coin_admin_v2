/**
 * 반응형 디자인 상수
 * 태블릿 크기별 브레이크포인트 및 배율 설정
 */

/**
 * 디바이스 크기 브레이크포인트 (dp)
 */
export const BREAKPOINTS = {
  TABLET_MIN: 600,      // 태블릿 최소 크기
  TABLET_SMALL_MAX: 840, // 소형 태블릿 최대 크기
  TABLET_MEDIUM_MAX: 1200, // 중형 태블릿 최대 크기
  DESKTOP_MIN: 1200,    // 데스크톱 최소 크기
} as const;

/**
 * 태블릿 크기별 패딩/마진 배율
 */
export const PADDING_MULTIPLIERS = {
  LANDSCAPE: {
    LARGE: 3.0,   // 대형 태블릿 가로 모드
    MEDIUM: 2.5, // 중형 태블릿 가로 모드
    SMALL: 2.0,  // 소형 태블릿 가로 모드
  },
  PORTRAIT: {
    LARGE: 2.5,  // 대형 태블릿 세로 모드
    MEDIUM: 2.0, // 중형 태블릿 세로 모드
    SMALL: 1.5,  // 소형 태블릿 세로 모드
  },
} as const;

/**
 * 태블릿 크기별 폰트 크기 배율
 */
export const FONT_SIZE_MULTIPLIERS = {
  LANDSCAPE: {
    LARGE: 1.3,  // 대형 태블릿 가로 모드: 30% 증가
    MEDIUM: 1.2, // 중형 태블릿 가로 모드: 20% 증가
    SMALL: 1.15, // 소형 태블릿 가로 모드: 15% 증가
  },
  PORTRAIT: {
    LARGE: 1.25, // 대형 태블릿 세로 모드: 25% 증가
    MEDIUM: 1.15, // 중형 태블릿 세로 모드: 15% 증가
    SMALL: 1.1,  // 소형 태블릿 세로 모드: 10% 증가
  },
} as const;

/**
 * 태블릿 크기별 그리드 컬럼 수
 */
export const GRID_COLUMNS = {
  LANDSCAPE: {
    LARGE: 4,  // 대형 태블릿 가로 모드: 4열
    MEDIUM: 3, // 중형 태블릿 가로 모드: 3열
    SMALL: 2,  // 소형 태블릿 가로 모드: 2열
  },
  PORTRAIT: {
    LARGE: 3,  // 대형 태블릿 세로 모드: 3열
    MEDIUM: 2, // 중형 태블릿 세로 모드: 2열
    SMALL: 2,  // 소형 태블릿 세로 모드: 2열
  },
} as const;

/**
 * 태블릿 크기별 최대 너비 (px)
 */
export const MAX_WIDTHS = {
  LANDSCAPE: {
    LARGE: 1600, // 대형 태블릿 가로 모드
    MEDIUM: 1400, // 중형 태블릿 가로 모드
    SMALL: 1200,  // 소형 태블릿 가로 모드
  },
  PORTRAIT: {
    LARGE: 1100, // 대형 태블릿 세로 모드
    MEDIUM: 950, // 중형 태블릿 세로 모드
    SMALL: 800,   // 소형 태블릿 세로 모드
  },
} as const;

/**
 * 그리드 간격 배율
 */
export const GAP_MULTIPLIER = 1.5;

/**
 * 태블릿 레이아웃 컬럼 너비
 */
export const TABLET_COLUMN_WIDTHS = {
  LEFT: {
    DEFAULT: 450,
    LARGE: 550,
    MEDIUM: 500,
  },
  RIGHT: {
    DEFAULT: 450,
    LARGE: 550,
    MEDIUM: 500,
  },
} as const;

