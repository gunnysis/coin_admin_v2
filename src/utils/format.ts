/**
 * 금액을 한국 원화 형식으로 포맷팅
 */
export const formatCurrency = (amount: number, showSymbol: boolean = true): string => {
  const formatted = amount.toLocaleString('ko-KR');
  return showSymbol ? `${formatted}원` : formatted;
};

/**
 * 날짜를 한국 형식으로 포맷팅
 */
export const formatDate = (date: Date | string, format: 'full' | 'short' | 'time' = 'full'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  switch (format) {
    case 'full':
      return `${year}년 ${month}월 ${day}일`;
    case 'short':
      return `${month}-${day}`;
    case 'time':
      return `${hours}:${minutes}`;
    default:
      return `${year}-${month}-${day}`;
  }
};
