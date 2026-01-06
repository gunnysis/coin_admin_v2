import { useRef } from 'react';

/**
 * 첫 렌더링 여부 확인 훅
 */
export const useIsFirstRender = (): boolean => {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;
    return true;
  }

  return false;
};

