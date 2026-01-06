import { QueryClient } from '@tanstack/react-query';

/**
 * React Query 클라이언트 설정
 * 최신 React Query v5 패턴 적용
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 캐시 설정
        staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
        gcTime: 1000 * 60 * 10, // 10분간 캐시 유지 (이전 cacheTime)
        
        // 재시도 설정
        retry: (failureCount, error) => {
          // 네트워크 에러가 아닌 경우 재시도하지 않음
          if (error instanceof Error && error.message.includes('database')) {
            return failureCount < 1;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // 리페치 설정
        refetchOnWindowFocus: false, // React Native에서는 불필요
        refetchOnReconnect: true,
        refetchOnMount: true,
        
        // 에러 처리
        throwOnError: false, // 컴포넌트에서 에러 처리
      },
      mutations: {
        // Mutation 기본 설정
        retry: 1,
        retryDelay: 1000,
        
        // 에러 처리
        throwOnError: false,
      },
    },
  });
};

