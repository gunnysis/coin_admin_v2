import { formatAmount, parseAmount, usdToKrw } from '../amount';

describe('formatAmount', () => {
  it('extracts digits and formats with thousand separators', () => {
    expect(formatAmount('500000')).toBe('500,000');
    expect(formatAmount('1234567')).toBe('1,234,567');
  });

  it('strips non-digits before formatting', () => {
    expect(formatAmount('500,000')).toBe('500,000');
    expect(formatAmount('50만원')).toBe('50');
  });

  it('returns empty string for empty or non-numeric input', () => {
    expect(formatAmount('')).toBe('');
    expect(formatAmount('abc')).toBe('');
  });
});

describe('parseAmount', () => {
  it('returns only digits', () => {
    expect(parseAmount('500,000')).toBe('500000');
    expect(parseAmount('1,234,567')).toBe('1234567');
  });

  it('returns empty string when no digits', () => {
    expect(parseAmount('')).toBe('');
    expect(parseAmount('원')).toBe('');
  });
});

describe('usdToKrw', () => {
  it('converts USD to KRW with rounding', () => {
    expect(usdToKrw(100, 1350)).toBe(135000);
    expect(usdToKrw(1, 1400)).toBe(1400);
  });

  it('rounds fractional result to integer', () => {
    expect(usdToKrw(1, 1350.5)).toBe(1351);
    expect(usdToKrw(10, 1350.44)).toBe(13504);
  });
});
