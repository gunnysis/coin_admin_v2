import { useEffect, useState } from 'react';
import { TIMING } from '../config/constants';

/**
 * 디바운스 훅
 * 입력값이 변경된 후 일정 시간이 지나면 값을 반환
 */
export const useDebounce = <T>(value: T, delay: number = TIMING.DEBOUNCE): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

