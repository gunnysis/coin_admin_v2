/**
 * 성능 측정 및 최적화 유틸리티
 */

/**
 * 성능 측정 데코레이터
 */
export const measurePerformance = <T extends (...args: unknown[]) => unknown>(
  fn: T,
  label?: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    if (__DEV__) {
      console.log(`[Performance] ${label || fn.name}: ${(end - start).toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
};

/**
 * 지연 실행 헬퍼
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * 배치 처리 헬퍼
 */
export const batchProcess = async <T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10
): Promise<R[]> => {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  
  return results;
};

