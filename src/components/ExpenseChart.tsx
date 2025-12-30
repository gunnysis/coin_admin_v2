import React, { useMemo, useState, useCallback } from 'react';
import { View, ScrollView, Dimensions, StyleSheet, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
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

// 차트 너비 계산: TotalAmountCard의 mx-4 (16px) + 카드 내부 padding (20px) = 36px
const getChartWidth = () => {
  const screenWidth = Dimensions.get('window').width;
  return screenWidth - 36;
};

export const ExpenseChart: React.FC<ExpenseChartProps> = ({ expenses }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const chartWidth = useMemo(() => getChartWidth(), []);

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
            height={CHART_CONFIG.HEIGHT}
          />
        </View>

        {hasCategoryData && (
          <View style={[styles.chartCard, { width: chartWidth }]}>
            <PieChartCard
              labels={categoryData.labels}
              data={categoryData.data}
              colors={categoryData.colors}
              width={chartWidth}
              height={CHART_CONFIG.HEIGHT}
            />
          </View>
        )}
      </ScrollView>

      <PageIndicator count={chartCount} currentPage={currentPage} />
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
    paddingVertical: 8,
  },
  chartCard: {
    marginRight: CHART_CONFIG.CARD_MARGIN,
  },
});
