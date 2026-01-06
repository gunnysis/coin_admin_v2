import { useRef, useCallback } from 'react';
import { TIMING } from '../config/constants';

/**
 * 스로틀 훅
 * 함수 호출을 일정 시간 간격으로 제한
 */
export const useThrottle = <T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number = TIMING.THROTTLE
): T => {
  const lastRun = useRef<number>(Date.now());

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

