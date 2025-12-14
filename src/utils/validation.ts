import { DATE_FORMAT_REGEX } from '../constants';
import { isValidDateFormat } from './date';

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

/**
 * 이름 유효성 검사
 */
export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, errorMessage: '이름을 입력해주세요.' };
  }
  return { isValid: true };
};

/**
 * 금액 유효성 검사
 */
export const validateAmount = (amount: string): ValidationResult => {
  if (!amount.trim()) {
    return { isValid: false, errorMessage: '금액을 입력해주세요.' };
  }
  
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, errorMessage: '올바른 금액을 입력해주세요.' };
  }
  
  return { isValid: true };
};

/**
 * 시작일 유효성 검사
 */
export const validateStartDate = (startDate: string): ValidationResult => {
  if (!startDate.trim()) {
    return { isValid: false, errorMessage: '시작일을 입력해주세요. (YYYY-MM-DD 형식)' };
  }
  
  if (!isValidDateFormat(startDate)) {
    return { isValid: false, errorMessage: '날짜 형식이 올바르지 않습니다. (YYYY-MM-DD 형식)' };
  }
  
  return { isValid: true };
};

/**
 * 전체 폼 유효성 검사
 */
export const validateExpenseForm = (
  name: string,
  amount: string,
  startDate: string
): ValidationResult => {
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }

  const amountValidation = validateAmount(amount);
  if (!amountValidation.isValid) {
    return amountValidation;
  }

  const startDateValidation = validateStartDate(startDate);
  if (!startDateValidation.isValid) {
    return startDateValidation;
  }

  return { isValid: true };
};
