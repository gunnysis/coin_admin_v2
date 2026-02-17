/**
 * 금액 관련 유틸리티 함수
 */

/**
 * 입력된 문자열에서 숫자만 추출하여 천 단위 구분자로 포맷팅
 */
export const formatAmount = (value: string): string => {
  const numbers = value.replace(/[^0-9]/g, '');
  if (!numbers) return '';
  return Number(numbers).toLocaleString('ko-KR');
};

/**
 * 포맷된 금액 문자열을 숫자 문자열로 변환
 */
export const parseAmount = (formattedValue: string): string => {
  return formattedValue.replace(/[^0-9]/g, '');
};

/**
 * 달러 금액을 원화로 변환 (반올림하여 정수 원 반환)
 */
export const usdToKrw = (usdAmount: number, rate: number): number => {
  return Math.round(usdAmount * rate);
};

