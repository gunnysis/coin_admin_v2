/**
 * 유효성 검사 유틸리티
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  errors?: Record<string, string>;
}

/**
 * 필수 필드 검증
 */
export const validateRequired = (value: string | number | undefined, fieldName: string): string | null => {
  if (value === undefined || value === null || value === '') {
    return `${fieldName}은(는) 필수 항목입니다.`;
  }
  return null;
};

/**
 * 숫자 범위 검증
 */
export const validateRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string
): string | null => {
  if (value < min || value > max) {
    return `${fieldName}은(는) ${min} 이상 ${max} 이하여야 합니다.`;
  }
  return null;
};

/**
 * 문자열 길이 검증
 */
export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string
): string | null => {
  const length = value.trim().length;
  if (length < min || length > max) {
    return `${fieldName}은(는) ${min}자 이상 ${max}자 이하여야 합니다.`;
  }
  return null;
};

/**
 * 이메일 검증
 */
export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return '올바른 이메일 형식이 아닙니다.';
  }
  return null;
};

/**
 * 날짜 형식 검증
 */
export const validateDate = (date: string): string | null => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD)';
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return '유효하지 않은 날짜입니다.';
  }

  return null;
};

/**
 * 여러 검증 규칙 조합
 */
export const combineValidators = (
  ...validators: Array<(value: unknown) => string | null>
): ((value: unknown) => string | null) => {
  return (value: unknown) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    return null;
  };
};

