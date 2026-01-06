import React, { useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInitDatabase } from '../hooks/useExpenses';
import { useExpensesPaginated, useTotalAmount } from '../hooks/useExpenses';
import { useVariableExpensesPaginated, useVariableExpensesTotal } from '../hooks/useVariableExpenses';
import { FixedMonthCost, VariableMonthExpense } from '../types';
import { useExpenseHandlers } from '../hooks/useExpenseHandlers';
import { useVariableExpenseHandlers } from '../hooks/useVariableExpenseHandlers';
import { useAppContext } from '../contexts/AppContext';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getContainerStyle, getResponsivePadding, getResponsiveMaxWidth } from '../utils/responsive';
import { SPACING } from '../constants/theme';
import { Typography } from '../components/ui/Typography';
import { PhoneLayout } from '../components/layouts/PhoneLayout';
import { TabletPortraitLayout } from '../components/layouts/TabletPortraitLayout';
import { TabletLandscapeLayout } from '../components/layouts/TabletLandscapeLayout';
import { TABLET_COLUMN_WIDTHS } from '../constants/responsive';

/**
 * 메인 App 컴포넌트
 * 레이아웃 선택과 데이터 페칭만 담당
 */
export default function App() {
  const insets = useSafeAreaInsets();
  const device = useDeviceDimensions();
  const {
    activeTab,
    isFixedRefreshing,
    isVariableRefreshing,
    setFixedRefreshing,
    setVariableRefreshing,
  } = useAppContext();

  // 반응형 스타일 계산
  const containerStyle = useMemo(() => getContainerStyle(device), [device]);
  const responsivePadding = useMemo(() => getResponsivePadding(device), [device]);

  // 태블릿 레이아웃 스타일 계산
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

    const leftColumnStyle: { maxWidth?: number; marginRight: number } = {
      marginRight: gap,
    };
    if (isLarge) {
      leftColumnStyle.maxWidth = TABLET_COLUMN_WIDTHS.LEFT.LARGE;
    } else if (isMedium) {
      leftColumnStyle.maxWidth = TABLET_COLUMN_WIDTHS.LEFT.MEDIUM;
    } else {
      leftColumnStyle.maxWidth = TABLET_COLUMN_WIDTHS.LEFT.DEFAULT;
    }

    const rightColumnStyle: { minWidth?: number } = {};
    if (isLarge) {
      rightColumnStyle.minWidth = TABLET_COLUMN_WIDTHS.RIGHT.LARGE;
    } else if (isMedium) {
      rightColumnStyle.minWidth = TABLET_COLUMN_WIDTHS.RIGHT.MEDIUM;
    } else {
      rightColumnStyle.minWidth = TABLET_COLUMN_WIDTHS.RIGHT.DEFAULT;
    }

    return {
      grid: { paddingHorizontal: horizontalPadding },
      leftColumn: leftColumnStyle,
      rightColumn: rightColumnStyle,
    };
  }, [device]);

  // 데이터베이스 초기화
  const { isLoading: isInitLoading } = useInitDatabase();

  // 고정비 데이터
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useExpensesPaginated();
  const { data: totalAmount = 0 } = useTotalAmount();
  const expenses = data?.pages.flatMap((page: { data: FixedMonthCost[] }) => page.data) ?? [];
  const {
    handleRefresh: handleFixedRefresh,
    isDeleting: fixedIsDeleting,
  } = useExpenseHandlers();

  // 유동비 데이터
  const {
    data: variableData,
    fetchNextPage: fetchVariableNextPage,
    hasNextPage: hasVariableNextPage,
    isFetchingNextPage: isFetchingVariableNextPage,
    isLoading: isVariableLoading,
  } = useVariableExpensesPaginated();
  const { data: variableTotalAmount = 0 } = useVariableExpensesTotal();
  const variableExpenses = variableData?.pages.flatMap((page: { data: VariableMonthExpense[] }) => page.data) ?? [];
  const {
    handleRefresh: handleVariableRefresh,
    isDeleting: variableIsDeleting,
  } = useVariableExpenseHandlers();

  // Pull-to-refresh 핸들러
  const onFixedRefresh = useCallback(async () => {
    setFixedRefreshing(true);
    try {
      await handleFixedRefresh();
    } catch (error) {
      // 에러는 이미 핸들러에서 처리됨
    } finally {
      setFixedRefreshing(false);
    }
  }, [handleFixedRefresh, setFixedRefreshing]);

  const onVariableRefresh = useCallback(async () => {
    setVariableRefreshing(true);
    try {
      await handleVariableRefresh();
    } catch (error) {
      // 에러는 이미 핸들러에서 처리됨
    } finally {
      setVariableRefreshing(false);
    }
  }, [handleVariableRefresh, setVariableRefreshing]);

  // 헤더 패딩 계산
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

  // 레이아웃 선택
  if (device.isTablet) {
    if (device.isLandscape) {
      // 태블릿 가로 모드
      return (
        <TabletLandscapeLayout
          device={device}
          containerStyle={containerStyle}
          bottomInset={insets.bottom}
          tabletLayoutStyles={tabletLayoutStyles}
          fixedExpenses={expenses}
          fixedTotalAmount={totalAmount}
          fixedIsLoading={isLoading}
          fixedIsInitLoading={isInitLoading}
          fixedRefreshing={isFixedRefreshing}
          fixedHasNextPage={hasNextPage ?? false}
          fixedIsFetchingNextPage={isFetchingNextPage}
          fixedIsDeleting={fixedIsDeleting}
          onFixedRefresh={onFixedRefresh}
          onFixedLoadMore={() => fetchNextPage()}
          variableExpenses={variableExpenses}
          variableIsLoading={isVariableLoading}
          variableRefreshing={isVariableRefreshing}
          variableHasNextPage={hasVariableNextPage ?? false}
          variableIsFetchingNextPage={isFetchingVariableNextPage}
          variableIsDeleting={variableIsDeleting}
          onVariableRefresh={onVariableRefresh}
          onVariableLoadMore={() => fetchVariableNextPage()}
          renderHeader={renderHeader}
        />
      );
    } else {
      // 태블릿 세로 모드
      return (
        <TabletPortraitLayout
          device={device}
          containerStyle={containerStyle}
          bottomInset={insets.bottom}
          fixedExpenses={expenses}
          fixedTotalAmount={totalAmount}
          fixedIsLoading={isLoading}
          fixedIsInitLoading={isInitLoading}
          fixedRefreshing={isFixedRefreshing}
          fixedHasNextPage={hasNextPage ?? false}
          fixedIsFetchingNextPage={isFetchingNextPage}
          fixedIsDeleting={fixedIsDeleting}
          onFixedRefresh={onFixedRefresh}
          onFixedLoadMore={() => fetchNextPage()}
          variableExpenses={variableExpenses}
          variableIsLoading={isVariableLoading}
          variableRefreshing={isVariableRefreshing}
          variableHasNextPage={hasVariableNextPage ?? false}
          variableIsFetchingNextPage={isFetchingVariableNextPage}
          variableIsDeleting={variableIsDeleting}
          onVariableRefresh={onVariableRefresh}
          onVariableLoadMore={() => fetchVariableNextPage()}
          renderHeader={renderHeader}
        />
      );
    }
  }

  // 폰 레이아웃
  return (
    <PhoneLayout
      device={device}
      containerStyle={containerStyle}
      bottomInset={insets.bottom}
      fixedExpenses={expenses}
      fixedTotalAmount={totalAmount}
      fixedIsLoading={isLoading}
      fixedIsInitLoading={isInitLoading}
      fixedRefreshing={isFixedRefreshing}
      fixedHasNextPage={hasNextPage ?? false}
      fixedIsFetchingNextPage={isFetchingNextPage}
      fixedIsDeleting={fixedIsDeleting}
      onFixedRefresh={onFixedRefresh}
      onFixedLoadMore={() => fetchNextPage()}
      variableExpenses={variableExpenses}
      variableTotalAmount={variableTotalAmount}
      variableIsLoading={isVariableLoading}
      variableRefreshing={isVariableRefreshing}
      variableHasNextPage={hasVariableNextPage ?? false}
      variableIsFetchingNextPage={isFetchingVariableNextPage}
      variableIsDeleting={variableIsDeleting}
      onVariableRefresh={onVariableRefresh}
      onVariableLoadMore={() => fetchVariableNextPage()}
      renderHeader={renderHeader}
    />
  );
}
