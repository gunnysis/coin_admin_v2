import React from 'react';
import { View, StyleSheet } from 'react-native';
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

export const BarChartCard: React.FC<BarChartCardProps> = ({
  labels,
  data,
  width,
  height,
}) => {
  return (
    <View style={styles.card}>
      <Typography variant="h3" color="textPrimary" style={styles.title}>
        항목별 금액
      </Typography>
      <BarChart
        data={{
          labels,
          datasets: [{ data }],
        }}
        width={width}
        height={height}
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
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: CHART_COLORS.BACKGROUND,
    borderRadius: CHART_CONFIG.CARD_BORDER_RADIUS,
    padding: CHART_CONFIG.CARD_PADDING,
    marginRight: CHART_CONFIG.CARD_MARGIN,
    marginLeft: 0,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
  chart: {
    borderRadius: CHART_CONFIG.CARD_BORDER_RADIUS,
  },
});
