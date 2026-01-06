/**
 * 결제일 계산 (start_date 기준으로 매월 같은 날)
 * 한 달 내 고정비 관리 앱에서 각 항목의 결제일을 표시
 */
export const getNextPaymentDate = (startDate: string): string => {
  const today = new Date();
  const start = new Date(startDate);
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // 이번 달 결제일
  const thisMonthPayment = new Date(currentYear, currentMonth, start.getDate());

  // 오늘 날짜와 비교
  if (today <= thisMonthPayment) {
    // 아직 이번 달 결제일이 지나지 않음
    return `${String(thisMonthPayment.getMonth() + 1).padStart(2, '0')}-${String(
      thisMonthPayment.getDate()
    ).padStart(2, '0')}`;
  } else {
    // 다음 달 결제일
    const nextMonthPayment = new Date(currentYear, currentMonth + 1, start.getDate());
    return `${String(nextMonthPayment.getMonth() + 1).padStart(2, '0')}-${String(
      nextMonthPayment.getDate()
    ).padStart(2, '0')}`;
  }
};

/**
 * 날짜 형식 유효성 검사 (YYYY-MM-DD)
 */
export const isValidDateFormat = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

/**
 * Date 객체를 YYYY-MM-DD 형식 문자열로 변환
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getTodayDateString = (): string => {
  return formatDateToString(new Date());
};

/**
 * 날짜 문자열을 MM-DD 형식으로 포맷팅
 */
export const formatDateToShort = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  } catch {
    return dateStr;
  }
};

/**
 * 현재 월 문자열 반환 (YYYY-MM)
 */
export const getCurrentMonth = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * 월의 일수 계산
 */
export const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

/**
 * 현재 월의 경과 일수 계산
 */
export const getDaysElapsedInMonth = (): number => {
  const now = new Date();
  return now.getDate();
};

/**
 * 현재 월의 남은 일수 계산
 */
export const getDaysRemainingInMonth = (): number => {
  const now = new Date();
  const daysInMonth = getDaysInMonth(now.getFullYear(), now.getMonth());
  return daysInMonth - now.getDate();
};
