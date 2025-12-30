import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CHART_CONFIG, CHART_COLORS } from '../../constants/chart';

interface PageIndicatorProps {
  count: number;
  currentPage: number;
}

export const PageIndicator: React.FC<PageIndicatorProps> = ({
  count,
  currentPage,
}) => {
  if (count <= 1) {
    return null;
  }

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.indicator,
            currentPage === index && styles.indicatorActive,
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: CHART_CONFIG.LEGEND_MARGIN_TOP,
    gap: CHART_CONFIG.INDICATOR_GAP,
  },
  indicator: {
    width: CHART_CONFIG.INDICATOR_SIZE,
    height: CHART_CONFIG.INDICATOR_SIZE,
    borderRadius: CHART_CONFIG.INDICATOR_SIZE / 2,
    backgroundColor: CHART_COLORS.GRAY_LIGHT,
  },
  indicatorActive: {
    width: CHART_CONFIG.INDICATOR_ACTIVE_WIDTH,
    backgroundColor: CHART_COLORS.PRIMARY,
  },
});
