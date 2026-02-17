import { validateAmount, validateName, validateExpenseForm } from '../validation';

jest.mock('../date', () => ({
  isValidDateFormat: (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s),
}));

describe('validateName', () => {
  it('returns invalid when empty', () => {
    expect(validateName('').isValid).toBe(false);
    expect(validateName('   ').isValid).toBe(false);
  });

  it('returns valid when non-empty', () => {
    expect(validateName('월세').isValid).toBe(true);
  });
});

describe('validateAmount', () => {
  it('returns invalid when empty', () => {
    const r = validateAmount('');
    expect(r.isValid).toBe(false);
    expect(r.errorMessage).toContain('금액');
  });

  it('returns invalid when zero or negative', () => {
    expect(validateAmount('0').isValid).toBe(false);
    expect(validateAmount('-100').isValid).toBe(false);
  });

  it('returns invalid when not a number', () => {
    expect(validateAmount('abc').isValid).toBe(false);
  });

  it('returns valid for positive number string', () => {
    expect(validateAmount('50000').isValid).toBe(true);
    expect(validateAmount('1').isValid).toBe(true);
  });
});

describe('validateExpenseForm', () => {
  it('fails when name is empty', () => {
    const r = validateExpenseForm('', '1000', '2025-01-15');
    expect(r.isValid).toBe(false);
  });

  it('fails when amount is invalid', () => {
    const r = validateExpenseForm('월세', '', '2025-01-15');
    expect(r.isValid).toBe(false);
  });

  it('fails when startDate format is invalid', () => {
    const r = validateExpenseForm('월세', '1000', 'invalid');
    expect(r.isValid).toBe(false);
  });

  it('passes when all fields valid', () => {
    const r = validateExpenseForm('월세', '100000', '2025-01-15');
    expect(r.isValid).toBe(true);
  });
});
