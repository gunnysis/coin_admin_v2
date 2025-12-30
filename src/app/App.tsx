import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Typography } from '../components/ui/Typography';
import { COLORS, SPACING } from '../constants/theme';
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

export default function App() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedMonthCost | null>(null);
  const queryClient = useQueryClient();

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
  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.EXPENSES });
    await refetch();
    setRefreshing(false);
  };

  // 삭제 핸들러
  const handleDelete = (id: number) => {
    deleteExpense.mutate(id);
  };

  // 추가 버튼 핸들러
  const handleAddButtonPress = () => {
    setEditingItem(null);
    setIsModalVisible(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setEditingItem(null);
  };

  // 데이터 추가 핸들러
  const handleAddExpense = async (data: AddExpenseFormData) => {
    await addExpense.mutateAsync(data);
  };

  // 데이터 수정 핸들러
  const handleUpdateExpense = async (data: AddExpenseFormData & { id: number }) => {
    await updateExpense.mutateAsync(data);
  };

  // 수정 버튼 핸들러
  const handleEdit = (item: FixedMonthCost) => {
    setEditingItem(item);
    setIsModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar style="dark" />

      {/* 헤더 */}
      <View style={styles.header}>
        <Typography variant="h2" color="textPrimary" align="center">
          월 고정비 관리
        </Typography>
      </View>

      {/* 이번 달 고정비 총액 카드 */}
      <TotalAmountCard
        totalAmount={totalAmount}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
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
      />

      {/* 하단 추가 버튼 */}
      <AddButton
        onPress={handleAddButtonPress}
        disabled={addExpense.isPending}
      />

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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
