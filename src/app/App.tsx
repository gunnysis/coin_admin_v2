import React, { useMemo, useCallback, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gear } from 'phosphor-react-native';
import { useAppExpenseData } from '../hooks/useAppExpenseData';
import { useAppContext } from '../contexts/AppContext';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getContainerStyle, getResponsivePadding } from '../utils/responsive';
import { SPACING, COLORS, SHADOWS, ICON_SIZES } from '../constants/theme';
import { Typography } from '../components/ui/Typography';
import { PhoneLayout } from '../components/layouts/PhoneLayout';
import { TabletPortraitLayout } from '../components/layouts/TabletPortraitLayout';
import { TabletLandscapeLayout } from '../components/layouts/TabletLandscapeLayout';
import { TABLET_COLUMN_WIDTHS } from '../constants/responsive';
import { SettingsScreen } from '../features/settings/components/SettingsScreen';

/**
 * 메인 App 컴포넌트
 * 레이아웃 선택과 데이터 훅 조합만 담당
 */
export default function App() {
  const [showSettings, setShowSettings] = useState(false);
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

  // 헤더 컴포넌트 (앱 크롬: white + border, 설정 버튼 44pt 터치 영역)
  const renderHeader = useCallback(
    () => (
      <View
        className="bg-white border-b border-slate-200"
        style={SHADOWS.sm}
        accessibilityRole="header"
      >
        <View
          className="flex-row items-center justify-between"
          style={{
            paddingHorizontal: headerPadding,
            paddingTop: device.isTablet ? SPACING['2xl'] : SPACING.xl,
            paddingBottom: device.isTablet ? SPACING.base : SPACING.md,
          }}
        >
          <Typography variant="h2" color="textPrimary" align="left">
            월 지출 관리
          </Typography>
          <Pressable
            onPress={() => setShowSettings(true)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: SPACING.sm,
              minHeight: 44,
              minWidth: 44,
              justifyContent: 'center',
              paddingHorizontal: SPACING.sm,
              paddingVertical: SPACING.sm,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="설정"
          >
            <Gear size={ICON_SIZES.base} color={COLORS.primary} weight="regular" />
            <Typography variant="body2" color="primary" weight="semibold">
              설정
            </Typography>
          </Pressable>
        </View>
      </View>
    ),
    [headerPadding, device],
  );

  if (showSettings) {
    return <SettingsScreen onClose={() => setShowSettings(false)} />;
  }

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
