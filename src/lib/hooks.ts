/**
 * React Hooks 유틸리티
 */

import { useEffect, useRef } from 'react';

/**
 * 이전 값과 비교하여 변경 시 콜백 실행
 */
export const useDidUpdate = (
  callback: () => void,
  deps: React.DependencyList
): void => {
  const hasMounted = useRef(false);

  useEffect(() => {
    if (hasMounted.current) {
      callback();
    } else {
      hasMounted.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};

/**
 * 컴포넌트 언마운트 시 실행
 */
export const useWillUnmount = (callback: () => void): void => {
  useEffect(() => {
    return callback;
  }, [callback]);
};

/**
 * 인터벌 실행 훅
 */
export const useInterval = (
  callback: () => void,
  delay: number | null
): void => {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => {
        savedCallback.current?.();
      }, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

