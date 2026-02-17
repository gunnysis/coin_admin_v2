import { useState, useCallback, useEffect } from 'react';
import { formatAmount, parseAmount, usdToKrw } from '../utils/amount';
import type { AmountCurrency } from '../types';

export type { AmountCurrency };

export interface UseAmountWithCurrencyOptions {
  /** 수정 모드일 때 기존 금액(원). 있으면 통화를 원으로 고정하고 금액 초기화 */
  initialAmountKrw?: number;
  /** 모달/폼 표시 여부. true일 때만 initialAmountKrw 반영 */
  visible?: boolean;
}

/**
 * 금액 입력 + 원/달러 선택 공통 로직.
 * 고정비/유동비 모달에서 중복 제거용.
 */
export function useAmountWithCurrency(options: UseAmountWithCurrencyOptions = {}) {
  const { initialAmountKrw, visible = true } = options;

  const [amount, setAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [amountCurrency, setAmountCurrency] = useState<AmountCurrency>('KRW');

  const isEditMode = initialAmountKrw != null && initialAmountKrw > 0;

  useEffect(() => {
    if (!visible) {
      setAmount('');
      setFormattedAmount('');
      setAmountCurrency('KRW');
      return;
    }
    if (isEditMode && initialAmountKrw != null) {
      const amountStr = String(initialAmountKrw);
      setAmount(amountStr);
      setFormattedAmount(formatAmount(amountStr));
      setAmountCurrency('KRW');
    }
  }, [visible, isEditMode, initialAmountKrw]);

  const handleAmountChange = useCallback((text: string) => {
    const numbers = parseAmount(text);
    setAmount(numbers);
    setFormattedAmount(formatAmount(numbers));
  }, []);

  /** 제출 시 저장할 원화 금액. USD일 때는 rate 필수 */
  const getAmountInKrw = useCallback(
    (usdToKrwRate: number): number => {
      const num = Number(amount);
      if (amountCurrency === 'KRW') return num;
      return usdToKrw(num, usdToKrwRate);
    },
    [amount, amountCurrency]
  );

  return {
    amount,
    formattedAmount,
    amountCurrency,
    setAmountCurrency,
    handleAmountChange,
    getAmountInKrw,
    isEditMode,
  };
}
