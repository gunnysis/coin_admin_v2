import React, { useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppExpenseData } from '../hooks/useAppExpenseData';
import { useAppContext } from '../contexts/AppContext';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getContainerStyle, getResponsivePadding } from '../utils/responsive';
import { SPACING } from '../constants/theme';
import { Typography } from '../components/ui/Typography';
import { PhoneLayout } from '../components/layouts/PhoneLayout';
import { TabletPortraitLayout } from '../components/layouts/TabletPortraitLayout';
import { TabletLandscapeLayout } from '../components/layouts/TabletLandscapeLayout';
import { TABLET_COLUMN_WIDTHS } from '../constants/responsive';

/**
 * 메인 App 컴포넌트
 * 레이아웃 선택과 데이터 훅 조합만 담당
 */
export default function App() {
  const insets = useSafeAreaInsets();
  const device = useDeviceDimensions();
  const {
    isFixedRefreshing,
    isVariableRefreshing,
    setFixedRefreshing,
    setVariableRefreshing,
    selectedVariableMonth,
  } = useAppContext();

  const { fixedExpenseData, variableExpenseData } = useAppExpenseData(
    selectedVariableMonth,
    setFixedRefreshing,
    setVariableRefreshing,
    isFixedRefreshing,
    isVariableRefreshing
  );

  const containerStyle = useMemo(() => getContainerStyle(device), [device]);
  const responsivePadding = useMemo(() => getResponsivePadding(device), [device]);

  const tabletLayoutStyles = useMemo(() => {
    if (!device.isTablet || !device.tabletSize) {
      return {
        grid: { paddingHorizontal: SPACING.xl },
        leftColumn: { maxWidth: TABLET_COLUMN_WIDTHS.LEFT.DEFAULT, marginRight: SPACING.xl },
        rightColumn: { minWidth: TABLET_COLUMN_WIDTHS.RIGHT.DEFAULT },
      };
    }
    const isLarge = device.isLargeTablet;
    const isMedium = device.isMediumTablet;
    const gap = isLarge ? SPACING['2xl'] : isMedium ? SPACING.xl : SPACING.lg;
    const horizontalPadding = isLarge ? SPACING['2xl'] : isMedium ? SPACING.xl : SPACING.lg;
    const leftColumnStyle: { maxWidth?: number; marginRight: number } = { marginRight: gap };
    if (isLarge) leftColumnStyle.maxWidth = TABLET_COLUMN_WIDTHS.LEFT.LARGE;
    else if (isMedium) leftColumnStyle.maxWidth = TABLET_COLUMN_WIDTHS.LEFT.MEDIUM;
    else leftColumnStyle.maxWidth = TABLET_COLUMN_WIDTHS.LEFT.DEFAULT;
    const rightColumnStyle: { minWidth?: number } = {};
    if (isLarge) rightColumnStyle.minWidth = TABLET_COLUMN_WIDTHS.RIGHT.LARGE;
    else if (isMedium) rightColumnStyle.minWidth = TABLET_COLUMN_WIDTHS.RIGHT.MEDIUM;
    else rightColumnStyle.minWidth = TABLET_COLUMN_WIDTHS.RIGHT.DEFAULT;
    return {
      grid: { paddingHorizontal: horizontalPadding },
      leftColumn: leftColumnStyle,
      rightColumn: rightColumnStyle,
    };
  }, [device]);

  const headerPadding = useMemo(
    () =>
      device.isTablet
        ? device.isLargeTablet
          ? SPACING['2xl']
          : device.isMediumTablet
            ? SPACING.xl
            : SPACING.lg
        : responsivePadding,
    [device, responsivePadding]
  );

  // 헤더 컴포넌트
  const renderHeader = useCallback(
    () => (
      <View
        className="items-center bg-gray-50"
        style={{
          paddingHorizontal: headerPadding,
          paddingTop: device.isTablet ? SPACING['2xl'] : SPACING.xl,
          paddingBottom: device.isTablet ? SPACING.base : SPACING.md,
        }}
        accessibilityRole="header"
      >
        <Typography variant="h2" color="textPrimary" align="center" accessibilityRole="header">
          월 지출 관리
        </Typography>
      </View>
    ),
    [headerPadding, device]
  );

  if (device.isTablet) {
    if (device.isLandscape) {
      return (
        <TabletLandscapeLayout
          device={device}
          containerStyle={containerStyle}
          bottomInset={insets.bottom}
          tabletLayoutStyles={tabletLayoutStyles}
          fixedExpenseData={fixedExpenseData}
          variableExpenseData={variableExpenseData}
          renderHeader={renderHeader}
        />
      );
    }
    return (
      <TabletPortraitLayout
        device={device}
        containerStyle={containerStyle}
        bottomInset={insets.bottom}
        fixedExpenseData={fixedExpenseData}
        variableExpenseData={variableExpenseData}
        renderHeader={renderHeader}
      />
    );
  }

  return (
    <PhoneLayout
      device={device}
      containerStyle={containerStyle}
      bottomInset={insets.bottom}
      fixedExpenseData={fixedExpenseData}
      variableExpenseData={variableExpenseData}
      renderHeader={renderHeader}
    />
  );
}
