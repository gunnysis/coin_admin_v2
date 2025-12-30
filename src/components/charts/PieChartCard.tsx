import React, { useMemo, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, LayoutChangeEvent } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { formatCurrency } from '../../utils/format';
import { CHART_CONFIG, CHART_BASE_CONFIG, CHART_COLORS, PIE_CHART_COLORS } from '../../constants/chart';
import { Typography } from '../ui/Typography';
import { COLORS } from '../../constants/theme';

interface PieChartCardProps {
  labels: string[];
  data: number[];
  colors: string[];
  width: number;
  height: number;
}

/**
 * PieChartCard 컴포넌트
 * 항목별 분포를 파이 차트로 표시
 */
export const PieChartCard: React.FC<PieChartCardProps> = ({
  labels,
  data,
  colors,
  width,
  height,
}) => {
  // 실제 렌더링 크기를 측정하기 위한 상태
  const [titleLayout, setTitleLayout] = useState({ height: 0 });
  const [legendLayout, setLegendLayout] = useState({ height: 0 });
  const [containerLayout, setContainerLayout] = useState({ width: 0, height: 0 });

  // 파이 차트 데이터 생성
  const pieChartData = useMemo(() => 
    labels.map((label, index) => ({
      name: label,
      amount: data[index],
      color: colors[index % colors.length] || CHART_COLORS.GRAY,
      legendFontColor: CHART_COLORS.GRAY_DARK,
      legendFontSize: 11,
    })),
    [labels, data, colors]
  );

  // 레이아웃 측정 핸들러
  const handleTitleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height: measuredHeight } = event.nativeEvent.layout;
    setTitleLayout({ height: measuredHeight });
  }, []);

  const handleLegendLayout = useCallback((event: LayoutChangeEvent) => {
    const { height: measuredHeight } = event.nativeEvent.layout;
    setLegendLayout({ height: measuredHeight });
  }, []);

  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    const { width: measuredWidth, height: measuredHeight } = event.nativeEvent.layout;
    setContainerLayout({ width: measuredWidth, height: measuredHeight });
  }, []);

  // 실제 측정된 크기를 기반으로 차트 크기 계산 (최신 방식: onLayout 기반)
  const { chartWidth, chartHeight } = useMemo(() => {
    // 실제 측정된 레이아웃이 있으면 사용, 없으면 예상값 사용
    const cardPadding = CHART_CONFIG.CARD_PADDING * 2;
    const actualTitleHeight = titleLayout.height || (Platform.OS === 'ios' ? 44 : 40);
    const actualLegendHeight = legendLayout.height || (labels.length * (Platform.OS === 'ios' ? 36 : 34) + 40);
    const actualContainerHeight = containerLayout.height || height;
    
    // 사용 가능한 공간 계산
    const availableHeight = actualContainerHeight - actualTitleHeight - actualLegendHeight - 32; // 여유 공간
    const availableWidth = (containerLayout.width || width) - cardPadding;
    
    // 원형 차트는 정사각형이므로 더 작은 값 사용
    const chartSize = Math.min(availableWidth, availableHeight);
    const minChartSize = Platform.OS === 'ios' ? 150 : 140;
    const maxChartSize = Platform.OS === 'ios' ? 280 : 260;
    
    const finalSize = Math.max(minChartSize, Math.min(maxChartSize, chartSize));
    
    return {
      chartWidth: finalSize,
      chartHeight: finalSize,
    };
  }, [width, height, titleLayout.height, legendLayout.height, containerLayout.width, containerLayout.height, labels.length]);

  return (
    <View 
      style={[styles.card, { width, minHeight: height }]}
      onLayout={handleContainerLayout}
    >
      <View onLayout={handleTitleLayout}>
        <Typography variant="h3" color="textPrimary" style={styles.title}>
          항목별 분포
        </Typography>
      </View>
      
      {/* Flexbox 기반 차트 컨테이너 - 동적 크기 조정 */}
      <View style={styles.chartContainer}>
        {chartWidth > 0 && chartHeight > 0 && (
          <PieChart
            data={pieChartData}
            width={chartWidth}
            height={chartHeight}
            chartConfig={CHART_BASE_CONFIG}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
            absolute
          />
        )}
      </View>
      
      <View style={styles.legendContainer} onLayout={handleLegendLayout}>
        {labels.map((label, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: colors[index % colors.length] || CHART_COLORS.GRAY },
              ]}
            />
            <Typography variant="caption" color="textSecondary" style={styles.legendText} numberOfLines={2}>
              {label}: {formatCurrency(data[index])}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CHART_COLORS.BACKGROUND,
    borderRadius: CHART_CONFIG.CARD_BORDER_RADIUS,
    padding: CHART_CONFIG.CARD_PADDING,
    paddingBottom: CHART_CONFIG.CARD_PADDING + 16, // 하단 추가 여백 (범례 + 페이지 인디케이터 공간)
    marginRight: CHART_CONFIG.CARD_MARGIN,
    marginLeft: 0,
    overflow: 'visible', // 차트가 카드 밖으로 나가도 잘리지 않도록
    // iOS shadow
    ...(Platform.OS === 'ios' && {
      shadowColor: COLORS.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    }),
    // Android elevation
    ...(Platform.OS === 'android' && {
      elevation: 4,
    }),
    borderWidth: 1,
    borderColor: CHART_COLORS.BORDER,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: CHART_COLORS.GRAY_DARKER,
    marginBottom: CHART_CONFIG.TITLE_MARGIN_BOTTOM,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible', // 차트가 잘리지 않도록
    minHeight: 200,
    width: '100%',
  },
  chart: {
    borderRadius: CHART_CONFIG.CARD_BORDER_RADIUS,
  },
  legendContainer: {
    marginTop: CHART_CONFIG.LEGEND_MARGIN_TOP,
    paddingTop: CHART_CONFIG.LEGEND_MARGIN_TOP,
    paddingBottom: 8, // 범례 하단 여백 추가
    borderTopWidth: 1,
    borderTopColor: CHART_COLORS.BORDER_DARK,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CHART_CONFIG.LEGEND_ITEM_MARGIN_BOTTOM,
    minHeight: Platform.OS === 'ios' ? 36 : 34, // 최소 높이 보장
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
  },
});
