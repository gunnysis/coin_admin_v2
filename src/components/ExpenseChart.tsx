import React, { useMemo, useState, useCallback } from 'react';
import { View, ScrollView, useWindowDimensions, StyleSheet, NativeScrollEvent, NativeSyntheticEvent, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FixedMonthCost } from '../types';
import { getItemData, getCategoryData } from '../utils/chartData';
import { BarChartCard } from './charts/BarChartCard';
import { PieChartCard } from './charts/PieChartCard';
import { PageIndicator } from './charts/PageIndicator';
import { EmptyChart } from './charts/EmptyChart';
import { CHART_CONFIG, SCROLL_CONFIG } from '../constants/chart';

interface ExpenseChartProps {
  expenses: FixedMonthCost[];
}

/**
 * 차트 너비 계산 함수
 * @param screenWidth - 화면 너비
 * @param horizontalPadding - 좌우 여백 (기본값: 32px)
 * @returns 계산된 차트 너비
 */
const calculateChartWidth = (screenWidth: number, horizontalPadding: number = 32): number => {
  return Math.max(screenWidth - horizontalPadding, 280); // 최소 너비 보장
};

/**
 * 차트 높이 계산 함수
 * @param availableHeight - 사용 가능한 높이
 * @param minHeight - 최소 높이 (기본값: 220px)
 * @param maxHeight - 최대 높이 (기본값: 400px)
 * @returns 계산된 차트 높이
 */
const calculateChartHeight = (
  availableHeight: number,
  minHeight: number = 220,
  maxHeight: number = 400
): number => {
  // 사용 가능한 높이의 60%를 차트 높이로 사용 (최소/최대 제한)
  const calculatedHeight = Math.floor(availableHeight * 0.6);
  return Math.max(minHeight, Math.min(maxHeight, calculatedHeight));
};

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [currentPage, setCurrentPage] = useState(0);

  // 차트 너비 계산 (화면 크기 변경 시 자동 업데이트)
  const chartWidth = useMemo(() => {
    const horizontalPadding = 32; // 양쪽 여백 (16px * 2)
    return calculateChartWidth(screenWidth, horizontalPadding);
  }, [screenWidth]);

  // 차트 높이 계산 (화면 크기 및 SafeArea 변경 시 자동 업데이트)
  const chartHeight = useMemo(() => {
    // 플랫폼별 여백 조정
    const topMargin = insets.top + (Platform.OS === 'ios' ? 20 : 16);
    // 하단 여백: SafeArea + 추가 버튼 공간 + 차트 하단 여백 + 페이지 인디케이터
    const pageIndicatorHeight = 24; // 페이지 인디케이터 높이
    const bottomMargin = insets.bottom + (Platform.OS === 'ios' ? 120 : 100) + pageIndicatorHeight;
    const availableHeight = screenHeight - topMargin - bottomMargin;
    
    // 차트 높이 계산: 범례와 페이지 인디케이터 공간을 고려하여 적절한 크기로
    return calculateChartHeight(availableHeight, 220, 420); // 최소/최대 높이 조정
  }, [screenHeight, insets.top, insets.bottom]);

  const itemData = useMemo(() => getItemData(expenses), [expenses]);
  const categoryData = useMemo(() => getCategoryData(expenses), [expenses]);

  const hasData = expenses.length > 0;
  const hasCategoryData = categoryData.data.length > 0;
  const chartCount = hasCategoryData ? 2 : 1;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / (chartWidth + CHART_CONFIG.CARD_MARGIN));
    setCurrentPage(page);
  }, [chartWidth]);

  if (!hasData) {
    return <EmptyChart />;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={SCROLL_CONFIG.THROTTLE}
        decelerationRate={SCROLL_CONFIG.DECELERATION_RATE}
        snapToInterval={chartWidth + CHART_CONFIG.CARD_MARGIN}
        snapToAlignment="start"
      >
        <View style={[styles.chartCard, { width: chartWidth }]}>
          <BarChartCard
            labels={itemData.labels}
            data={itemData.data}
            width={chartWidth}
            height={chartHeight}
          />
        </View>

        {hasCategoryData && (
          <View style={[styles.chartCard, { width: chartWidth }]}>
            <PieChartCard
              labels={categoryData.labels}
              data={categoryData.data}
              colors={categoryData.colors}
              width={chartWidth}
              height={chartHeight}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.pageIndicatorWrapper}>
        <PageIndicator count={chartCount} currentPage={currentPage} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    paddingVertical: 16, // 상하 여백 증가
    paddingBottom: 24, // 하단 여백 추가로 차트가 잘리지 않도록
  },
  chartCard: {
    marginRight: CHART_CONFIG.CARD_MARGIN,
  },
  pageIndicatorWrapper: {
    paddingTop: 8,
    paddingBottom: 8,
    marginTop: 4,
  },
});
