import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { EXCHANGE_RATE } from '../config/constants';
import { exchangeRateKeys } from '../config/queryKeys';

const ONE_HOUR_MS = 1000 * 60 * 60;

type ExchangeRateResponse = {
  rates: { KRW: number };
};

async function fetchUsdToKrwRate(signal?: AbortSignal): Promise<number> {
  const res = await fetch(EXCHANGE_RATE.API_URL, { signal });
  if (!res.ok) throw new Error('환율 조회 실패');
  const data: ExchangeRateResponse = await res.json();
  const rate = data?.rates?.KRW;
  if (typeof rate !== 'number' || rate <= 0) throw new Error('환율 데이터 형식 오류');
  return rate;
}

/**
 * USD → KRW 실시간 환율 훅 (React Query v5 + AbortSignal).
 * - 언마운트/중복 요청 시 fetch 자동 취소
 * - 실패 시 fallback 환율 반환, 1시간 캐시
 */
export function useExchangeRate(): {
  rate: number;
  isLoading: boolean;
  error: Error | null;
  isFallback: boolean;
} {
  const query = useQuery({
    queryKey: exchangeRateKeys.all(),
    queryFn: ({ signal }) => fetchUsdToKrwRate(signal),
    staleTime: ONE_HOUR_MS,
    gcTime: ONE_HOUR_MS,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    placeholderData: EXCHANGE_RATE.USD_KRW_FALLBACK,
  });

  return useMemo(
    () => ({
      rate: query.data ?? EXCHANGE_RATE.USD_KRW_FALLBACK,
      isLoading: query.isLoading,
      error: query.error instanceof Error ? query.error : null,
      isFallback: query.isError || query.data == null,
    }),
    [query.data, query.isLoading, query.isError, query.error]
  );
}
