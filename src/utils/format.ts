/**
 * 금액을 한국 원화 형식으로 포맷팅
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('ko-KR') + '원';
};
