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

/**
 * 월 문자열(YYYY-MM)을 파싱하여 년도와 월 반환
 */
export const parseMonth = (monthStr: string): { year: number; month: number } => {
  const [year, month] = monthStr.split('-').map(Number);
  return { year, month };
};

/**
 * 년도와 월로 월 문자열(YYYY-MM) 생성
 */
export const formatMonth = (year: number, month: number): string => {
  return `${year}-${String(month).padStart(2, '0')}`;
};

/**
 * 이전 월 계산 (YYYY-MM 형식)
 */
export const getPreviousMonth = (monthStr: string): string => {
  const { year, month } = parseMonth(monthStr);
  if (month === 1) {
    return formatMonth(year - 1, 12);
  }
  return formatMonth(year, month - 1);
};

/**
 * 다음 월 계산 (YYYY-MM 형식)
 */
export const getNextMonth = (monthStr: string): string => {
  const { year, month } = parseMonth(monthStr);
  if (month === 12) {
    return formatMonth(year + 1, 1);
  }
  return formatMonth(year, month + 1);
};

/**
 * 월 문자열을 사용자 친화적 형식으로 변환 (예: "2024년 1월")
 */
export const formatMonthToDisplay = (monthStr: string): string => {
  const { year, month } = parseMonth(monthStr);
  return `${year}년 ${month}월`;
};

/**
 * 월 문자열이 유효한지 검증 (YYYY-MM 형식)
 */
export const isValidMonthFormat = (monthStr: string): boolean => {
  const monthRegex = /^\d{4}-\d{2}$/;
  if (!monthRegex.test(monthStr)) {
    return false;
  }
  
  const { year, month } = parseMonth(monthStr);
  return month >= 1 && month <= 12 && year > 0;
};

/**
 * 두 월 문자열 비교 (월1이 월2보다 이전이면 -1, 같으면 0, 이후면 1)
 */
export const compareMonths = (month1: string, month2: string): number => {
  if (month1 < month2) return -1;
  if (month1 > month2) return 1;
  return 0;
};
