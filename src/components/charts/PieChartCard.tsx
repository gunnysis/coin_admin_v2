import React from 'react';
import { View, StyleSheet } from 'react-native';
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

export const PieChartCard: React.FC<PieChartCardProps> = ({
  labels,
  data,
  colors,
  width,
  height,
}) => {
  const pieChartData = labels.map((label, index) => ({
    name: label,
    amount: data[index],
    color: colors[index % colors.length] || CHART_COLORS.GRAY,
    legendFontColor: CHART_COLORS.GRAY_DARK,
    legendFontSize: 11,
  }));

  return (
    <View style={styles.card}>
      <Typography variant="h3" color="textPrimary" style={styles.title}>
        항목별 분포
      </Typography>
      <PieChart
        data={pieChartData}
        width={width}
        height={height}
        chartConfig={CHART_BASE_CONFIG}
        accessor="amount"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
        absolute
      />
      <View style={styles.legendContainer}>
        {labels.map((label, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                { backgroundColor: colors[index % colors.length] || CHART_COLORS.GRAY },
              ]}
            />
                  <Typography variant="caption" color="textSecondary" style={styles.legendText} numberOfLines={1}>
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
  legendContainer: {
    marginTop: CHART_CONFIG.LEGEND_MARGIN_TOP,
    paddingTop: CHART_CONFIG.LEGEND_MARGIN_TOP,
    borderTopWidth: 1,
    borderTopColor: CHART_COLORS.BORDER_DARK,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CHART_CONFIG.LEGEND_ITEM_MARGIN_BOTTOM,
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
