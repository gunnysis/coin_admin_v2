import React, { useState, useMemo, useCallback } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Typography } from '../components/ui/Typography';
import { SPACING } from '../constants/theme';
import {
  useInitDatabase,
  useExpensesPaginated,
  useTotalAmount,
  useDeleteExpense,
  useAddExpense,
  useUpdateExpense,
} from '../hooks/useExpenses';
import { TotalAmountCard } from '../components/TotalAmountCard';
import { ExpenseList } from '../components/ExpenseList';
import { AddButton } from '../components/AddButton';
import { AddExpenseModal } from '../components/AddExpenseModal';
import { AddExpenseFormData, FixedMonthCost } from '../types';
import { QUERY_KEYS } from '../constants';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getContainerStyle, getResponsivePadding, getResponsiveMaxWidth, getResponsiveValue } from '../utils/responsive';
import { TABLET_COLUMN_WIDTHS } from '../constants/responsive';

export default function App() {
  const insets = useSafeAreaInsets();
  const device = useDeviceDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedMonthCost | null>(null);
  const queryClient = useQueryClient();
  
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
    const isSmall = device.isSmallTablet;
    
    // 간격 계산
    const gap = isLarge ? SPACING['2xl'] : isMedium ? SPACING.xl : SPACING.lg;
    const horizontalPadding = isLarge ? SPACING['2xl'] : isMedium ? SPACING.xl : SPACING.lg;
    
    // 왼쪽 컬럼 스타일
    const leftColumnStyle: any = {
      marginRight: gap,
    };
    if (isLarge) {
      leftColumnStyle.maxWidth = TABLET_COLUMN_WIDTHS.LEFT.LARGE;
    } else if (isMedium) {
      leftColumnStyle.maxWidth = TABLET_COLUMN_WIDTHS.LEFT.MEDIUM;
    } else {
      leftColumnStyle.maxWidth = TABLET_COLUMN_WIDTHS.LEFT.DEFAULT;
    }
    
    // 오른쪽 컬럼 스타일
    const rightColumnStyle: any = {};
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

  // 페이지네이션 데이터
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useExpensesPaginated();

  // 총액
  const { data: totalAmount = 0 } = useTotalAmount();

  // 삭제 mutation
  const deleteExpense = useDeleteExpense();

  // 추가 mutation
  const addExpense = useAddExpense();

  // 수정 mutation
  const updateExpense = useUpdateExpense();

  // 모든 페이지의 데이터를 하나의 배열로 합치기
  const expenses = data?.pages.flatMap((page) => page.data) ?? [];

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES });
      await refetch();
    } catch (error) {
      if (__DEV__) {
        console.error('새로고침 중 오류:', error);
      }
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, refetch]);

  // 삭제 핸들러
  const handleDelete = useCallback((id: number) => {
    deleteExpense.mutate(id, {
      onError: (error) => {
        if (__DEV__) {
          console.error('삭제 실패:', error);
        }
      },
    });
  }, [deleteExpense]);

  // 추가 버튼 핸들러
  const handleAddButtonPress = useCallback(() => {
    setEditingItem(null);
    setIsModalVisible(true);
  }, []);

  // 모달 닫기
  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setEditingItem(null);
  }, []);

  // 데이터 추가 핸들러
  const handleAddExpense = useCallback(async (data: AddExpenseFormData) => {
    try {
      await addExpense.mutateAsync(data);
    } catch (error) {
      if (__DEV__) {
        console.error('추가 실패:', error);
      }
      throw error; // 모달에서 에러 처리하도록 재throw
    }
  }, [addExpense]);

  // 데이터 수정 핸들러
  const handleUpdateExpense = useCallback(async (data: AddExpenseFormData & { id: number }) => {
    try {
      await updateExpense.mutateAsync(data);
    } catch (error) {
      if (__DEV__) {
        console.error('수정 실패:', error);
      }
      throw error; // 모달에서 에러 처리하도록 재throw
    }
  }, [updateExpense]);

  // 수정 버튼 핸들러
  const handleEdit = useCallback((item: FixedMonthCost) => {
    setEditingItem(item);
    setIsModalVisible(true);
  }, []);

  // 토글 확장 핸들러
  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // 헤더 패딩 계산
  const headerPadding = useMemo(() => 
    device.isTablet 
      ? (device.isLargeTablet ? SPACING['2xl'] : device.isMediumTablet ? SPACING.xl : SPACING.lg)
      : responsivePadding
  , [device, responsivePadding]);
  
  // 헤더 컴포넌트 (useCallback으로 최적화)
  const renderHeader = useCallback(() => (
    <View 
      className="items-center bg-gray-50" 
      style={{ 
        paddingHorizontal: headerPadding,
        paddingTop: device.isTablet ? SPACING['2xl'] : SPACING.xl,
        paddingBottom: device.isTablet ? SPACING.xl : SPACING.lg,
      }}
      accessibilityRole="header"
    >
      <Typography variant="h2" color="textPrimary" align="center" accessibilityRole="header">
        월 고정비 관리
      </Typography>
    </View>
  ), [headerPadding, device]);

  // 태블릿 레이아웃 (가로/세로 모두)
  if (device.isTablet) {
    // 태블릿 가로 모드: 2컬럼 레이아웃
    if (device.isLandscape) {
      return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
          <StatusBar style="dark" />
          
          <View className="flex-1" style={containerStyle}>
            {renderHeader()}

            {/* 태블릿 가로 모드: 2컬럼 레이아웃 */}
            <View className="flex-1 flex-row" style={tabletLayoutStyles.grid}>
              {/* 왼쪽: 총액 카드 */}
              <View className="flex-1" style={tabletLayoutStyles.leftColumn}>
                <TotalAmountCard
                  totalAmount={totalAmount}
                  isExpanded={isExpanded}
                  onToggleExpand={handleToggleExpand}
                  expenses={expenses}
                />
              </View>

              {/* 오른쪽: 목록 */}
              <View className="flex-1" style={tabletLayoutStyles.rightColumn}>
                <ExpenseList
                  expenses={expenses}
                  isLoading={isLoading}
                  isInitLoading={isInitLoading}
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  onLoadMore={() => fetchNextPage()}
                  isDeleting={deleteExpense.isPending}
                  bottomInset={insets.bottom}
                  isTabletLandscape={true}
                />
              </View>
            </View>

            {/* 하단 추가 버튼 */}
            <AddButton
              onPress={handleAddButtonPress}
              disabled={addExpense.isPending}
              bottomInset={insets.bottom}
            />
          </View>

          {/* 추가/수정 모달 */}
          <AddExpenseModal
            visible={isModalVisible}
            onClose={handleCloseModal}
            onAdd={handleAddExpense}
            onUpdate={handleUpdateExpense}
            editingItem={editingItem}
            isPending={addExpense.isPending || updateExpense.isPending}
          />
        </SafeAreaView>
      );
    }

    // 태블릿 세로 모드: 중앙 정렬된 최적 너비 레이아웃
    const tabletMaxWidth = getResponsiveMaxWidth(device) || 1000;
    const tabletPadding = getResponsiveValue(device, responsivePadding, device.isLargeTablet ? SPACING['2xl'] : device.isMediumTablet ? SPACING.xl : SPACING.lg);
    
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
        <StatusBar style="dark" />

        <View className="flex-1" style={containerStyle}>
          {renderHeader()}

          {/* 태블릿 세로 모드: 중앙 정렬된 컨테이너 */}
          <View 
            className="flex-1"
            style={{
              maxWidth: tabletMaxWidth,
              alignSelf: 'center',
              width: '100%',
              paddingHorizontal: tabletPadding,
            }}
          >
            {/* 상단: 총액 카드 (전체 너비) */}
            <TotalAmountCard
              totalAmount={totalAmount}
              isExpanded={isExpanded}
              onToggleExpand={handleToggleExpand}
              expenses={expenses}
            />

            {/* 하단: 항목 목록 (전체 너비) */}
            <ExpenseList
              expenses={expenses}
              isLoading={isLoading}
              isInitLoading={isInitLoading}
              refreshing={refreshing}
              onRefresh={onRefresh}
              onDelete={handleDelete}
              onEdit={handleEdit}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              isDeleting={deleteExpense.isPending}
              bottomInset={insets.bottom}
              isTabletLandscape={false}
            />
          </View>

          {/* 하단 추가 버튼 */}
          <AddButton
            onPress={handleAddButtonPress}
            disabled={addExpense.isPending}
            bottomInset={insets.bottom}
          />
        </View>

        {/* 추가/수정 모달 */}
        <AddExpenseModal
          visible={isModalVisible}
          onClose={handleCloseModal}
          onAdd={handleAddExpense}
          onUpdate={handleUpdateExpense}
          editingItem={editingItem}
          isPending={addExpense.isPending || updateExpense.isPending}
        />
      </SafeAreaView>
    );
  }

  // 폰 레이아웃
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      <View className="flex-1" style={containerStyle}>
        {renderHeader()}

        {/* 이번 달 고정비 총액 카드 */}
        <TotalAmountCard
          totalAmount={totalAmount}
          isExpanded={isExpanded}
          onToggleExpand={handleToggleExpand}
          expenses={expenses}
        />

        {/* 월 고정비 항목 목록 */}
        <ExpenseList
          expenses={expenses}
          isLoading={isLoading}
          isInitLoading={isInitLoading}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onDelete={handleDelete}
          onEdit={handleEdit}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={() => fetchNextPage()}
          isDeleting={deleteExpense.isPending}
          bottomInset={insets.bottom}
          isTabletLandscape={false}
        />

        {/* 하단 추가 버튼 */}
        <AddButton
          onPress={handleAddButtonPress}
          disabled={addExpense.isPending}
          bottomInset={insets.bottom}
        />
      </View>

      {/* 추가/수정 모달 */}
      <AddExpenseModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onAdd={handleAddExpense}
        onUpdate={handleUpdateExpense}
        editingItem={editingItem}
        isPending={addExpense.isPending || updateExpense.isPending}
      />
    </SafeAreaView>
  );
}
