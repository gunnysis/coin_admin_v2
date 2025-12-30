import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { CHART_CONFIG, CHART_BASE_CONFIG, CHART_COLORS } from '../../constants/chart';
import { Typography } from '../ui/Typography';
import { COLORS } from '../../constants/theme';

interface BarChartCardProps {
  labels: string[];
  data: number[];
  width: number;
  height: number;
}

/**
 * BarChartCard 컴포넌트
 * 항목별 금액을 막대 차트로 표시
 */
export const BarChartCard: React.FC<BarChartCardProps> = ({
  labels,
  data,
  width,
  height,
}) => {
  // 카드 내부 padding과 제목 영역을 고려한 실제 차트 크기 계산
  const { chartWidth, chartHeight, containerPaddingBottom, containerPaddingTop } = useMemo(() => {
    const cardPadding = CHART_CONFIG.CARD_PADDING * 2; // 좌우 padding
    const titleHeight = Platform.OS === 'ios' ? 44 : 40;
    const titleMarginBottom = CHART_CONFIG.TITLE_MARGIN_BOTTOM;
    
    // react-native-chart-kit의 BarChart는 y축 레이블을 위해 내부적으로 공간을 사용
    // y축 레이블 공간: 약 40-50px (레이블 텍스트 + 여백)
    // x축 레이블 공간: 약 30-35px (레이블 텍스트 + 여백)
    const yAxisLabelSpace = 50; // y축 레이블을 위한 충분한 공간
    const xAxisLabelSpace = 35; // x축 레이블을 위한 충분한 공간
    const totalLabelSpace = yAxisLabelSpace + xAxisLabelSpace;
    
    // 차트 컨테이너 여백 (차트가 잘리지 않도록)
    const topPadding = 12;
    const bottomPadding = totalLabelSpace; // y축 + x축 레이블 공간
    
    const minChartWidth = Platform.OS === 'ios' ? 220 : 200;
    const minChartHeight = Platform.OS === 'ios' ? 200 : 180;
    
    // 차트 높이 계산: 전체 높이에서 제목, 여백을 제외하되, 차트 자체 높이는 레이블 공간을 제외
    const availableHeight = height - titleHeight - titleMarginBottom - topPadding - bottomPadding;
    
    return {
      chartWidth: Math.max(width - cardPadding, minChartWidth),
      chartHeight: Math.max(availableHeight, minChartHeight),
      containerPaddingBottom: bottomPadding,
      containerPaddingTop: topPadding,
    };
  }, [width, height]);

  return (
    <View style={styles.card}>
      <Typography variant="h3" color="textPrimary" style={styles.title}>
        항목별 금액
      </Typography>
      <View 
        style={[
          styles.chartContainer, 
          { 
            paddingBottom: containerPaddingBottom,
            paddingTop: containerPaddingTop,
          }
        ]}
      >
        <BarChart
          data={{
            labels,
            datasets: [{ data }],
          }}
          width={chartWidth}
          height={chartHeight}
          yAxisLabel=""
          yAxisSuffix="원"
          chartConfig={{
            ...CHART_BASE_CONFIG,
            color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
            barPercentage: 0.6,
          }}
          style={styles.chart}
          showValuesOnTopOfBars
          fromZero
          withInnerLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CHART_COLORS.BACKGROUND,
    borderRadius: CHART_CONFIG.CARD_BORDER_RADIUS,
    padding: CHART_CONFIG.CARD_PADDING,
    paddingBottom: CHART_CONFIG.CARD_PADDING + 8, // 하단 추가 여백
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
    overflow: 'visible', // y축 레이블이 잘리지 않도록
    width: '100%',
  },
  chart: {
    borderRadius: CHART_CONFIG.CARD_BORDER_RADIUS,
    marginVertical: 0,
  },
});
