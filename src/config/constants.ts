/**
 * 애플리케이션 전역 상수
 */

// 페이지네이션
export const PAGINATION = {
  PAGE_SIZE: 10,
  INITIAL_PAGE: 0,
} as const;

// 날짜 형식
export const DATE_FORMAT = {
  REGEX: /^\d{4}-\d{2}-\d{2}$/,
  PLACEHOLDER: 'YYYY-MM-DD',
  DISPLAY: 'YYYY년 MM월 DD일',
} as const;

// 애니메이션
export const ANIMATION = {
  DURATION: {
    FAST: 200,
    NORMAL: 300,
    SLOW: 500,
  },
  SPRING: {
    TENSION: 300,
    FRICTION: 10,
  },
} as const;

// 디바운스/스로틀
export const TIMING = {
  DEBOUNCE: 300,
  THROTTLE: 100,
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK: '네트워크 연결을 확인해주세요.',
  DATABASE: '데이터베이스 오류가 발생했습니다.',
  VALIDATION: '입력 정보를 확인해주세요.',
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
  ADD: '항목이 추가되었습니다.',
  UPDATE: '항목이 수정되었습니다.',
  DELETE: '항목이 삭제되었습니다.',
} as const;

// 환율 (달러 → 원 변환). API_URL은 EXPO_PUBLIC_EXCHANGE_RATE_URL로 오버라이드 가능
const DEFAULT_EXCHANGE_RATE_URL = 'https://api.frankfurter.app/latest?from=USD&to=KRW';
export const EXCHANGE_RATE = {
  USD_KRW_FALLBACK: 1400,
  API_URL:
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_EXCHANGE_RATE_URL) ||
    DEFAULT_EXCHANGE_RATE_URL,
} as const;

