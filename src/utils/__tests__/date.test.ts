import {
  parseMonth,
  formatMonth,
  getPreviousMonth,
  getNextMonth,
  isValidMonthFormat,
  compareMonths,
  formatMonthToDisplay,
  formatDateToString,
  getTodayDateString,
  isValidDateFormat,
} from '../date';

describe('parseMonth', () => {
  it('parses YYYY-MM string to year and month', () => {
    expect(parseMonth('2024-01')).toEqual({ year: 2024, month: 1 });
    expect(parseMonth('2025-12')).toEqual({ year: 2025, month: 12 });
    expect(parseMonth('2024-06')).toEqual({ year: 2024, month: 6 });
  });
});

describe('formatMonth', () => {
  it('formats year and month to YYYY-MM', () => {
    expect(formatMonth(2024, 1)).toBe('2024-01');
    expect(formatMonth(2025, 12)).toBe('2025-12');
    expect(formatMonth(2024, 6)).toBe('2024-06');
  });
});

describe('getPreviousMonth', () => {
  it('returns previous month in same year', () => {
    expect(getPreviousMonth('2024-06')).toBe('2024-05');
    expect(getPreviousMonth('2024-12')).toBe('2024-11');
  });

  it('returns December of previous year when current is January', () => {
    expect(getPreviousMonth('2024-01')).toBe('2023-12');
  });
});

describe('getNextMonth', () => {
  it('returns next month in same year', () => {
    expect(getNextMonth('2024-05')).toBe('2024-06');
    expect(getNextMonth('2024-01')).toBe('2024-02');
  });

  it('returns January of next year when current is December', () => {
    expect(getNextMonth('2024-12')).toBe('2025-01');
  });
});

describe('isValidMonthFormat', () => {
  it('accepts valid YYYY-MM', () => {
    expect(isValidMonthFormat('2024-01')).toBe(true);
    expect(isValidMonthFormat('2025-12')).toBe(true);
  });

  it('rejects invalid format', () => {
    expect(isValidMonthFormat('2024-1')).toBe(false);
    expect(isValidMonthFormat('24-01')).toBe(false);
    expect(isValidMonthFormat('2024-00')).toBe(false);
    expect(isValidMonthFormat('2024-13')).toBe(false);
  });
});

describe('compareMonths', () => {
  it('returns -1 when first is before second', () => {
    expect(compareMonths('2024-01', '2024-06')).toBe(-1);
    expect(compareMonths('2023-12', '2024-01')).toBe(-1);
  });

  it('returns 1 when first is after second', () => {
    expect(compareMonths('2024-06', '2024-01')).toBe(1);
    expect(compareMonths('2024-01', '2023-12')).toBe(1);
  });

  it('returns 0 when equal', () => {
    expect(compareMonths('2024-06', '2024-06')).toBe(0);
  });
});

describe('formatMonthToDisplay', () => {
  it('formats to Korean display string', () => {
    expect(formatMonthToDisplay('2024-01')).toBe('2024년 1월');
    expect(formatMonthToDisplay('2025-12')).toBe('2025년 12월');
  });
});

describe('formatDateToString', () => {
  it('formats Date to YYYY-MM-DD', () => {
    const d = new Date(2024, 0, 15);
    expect(formatDateToString(d)).toBe('2024-01-15');
  });
});

describe('getTodayDateString', () => {
  it('returns YYYY-MM-DD format', () => {
    const s = getTodayDateString();
    expect(/^\d{4}-\d{2}-\d{2}$/.test(s)).toBe(true);
  });
});

describe('isValidDateFormat', () => {
  it('accepts valid YYYY-MM-DD', () => {
    expect(isValidDateFormat('2024-01-15')).toBe(true);
  });

  it('rejects invalid format', () => {
    expect(isValidDateFormat('2024-1-15')).toBe(false);
    expect(isValidDateFormat('24-01-15')).toBe(false);
  });
});
