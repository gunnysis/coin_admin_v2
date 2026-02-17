import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Typography } from './Typography';
import { SPACING, COLORS } from '../../constants/theme';

interface ExchangeRateHintProps {
  /** USD 선택 시에만 표시 */
  show: boolean;
  /** 현재 환율 (원) */
  rate: number;
  /** 환율 로딩 중 */
  isLoading?: boolean;
  /** fallback 사용 중이면 "기본 환율" 표시 */
  isFallback?: boolean;
}

/**
 * 달러 선택 시 표시하는 환율 안내.
 * - 로딩: "환율 불러오는 중..."
 * - 완료: "1 USD ≈ 1,350원" (또는 기본 환율 안내)
 */
export function ExchangeRateHint({
  show,
  rate,
  isLoading = false,
  isFallback = false,
}: ExchangeRateHintProps) {
  if (!show) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SPACING.sm, gap: SPACING.sm }}>
      {isLoading ? (
        <>
          <ActivityIndicator size="small" color={COLORS.gray500} />
          <Typography variant="caption" color="textTertiary">
            환율 불러오는 중…
          </Typography>
        </>
      ) : (
        <Typography variant="caption" color="textTertiary">
          1 USD ≈ {rate.toLocaleString('ko-KR')}원
          {isFallback && ' (기본 환율)'}
        </Typography>
      )}
    </View>
  );
}
