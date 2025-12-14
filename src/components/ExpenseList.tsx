import React from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { FixedMonthCost } from '../types';
import { ExpenseItem } from './ExpenseItem';

interface ExpenseListProps {
  expenses: FixedMonthCost[];
  isLoading?: boolean;
  isInitLoading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onDelete: (id: number) => void;
  onEdit?: (item: FixedMonthCost) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
  isDeleting?: boolean;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  isLoading = false,
  isInitLoading = false,
  refreshing = false,
  onRefresh,
  onDelete,
  onEdit,
  hasNextPage = false,
  isFetchingNextPage = false,
  onLoadMore,
  isDeleting = false,
}) => {
  const renderItem = ({ item }: { item: FixedMonthCost }) => (
    <ExpenseItem
      item={item}
      onDelete={onDelete}
      onEdit={onEdit}
      isDeleting={isDeleting}
    />
  );

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4 items-center">
          <ActivityIndicator size="small" color="#666" />
        </View>
      );
    }

    if (hasNextPage && onLoadMore) {
      return (
        <View className="py-4 items-center">
          <TouchableOpacity
            onPress={onLoadMore}
            className="bg-blue-500 rounded-lg px-6 py-3 active:bg-blue-600"
            disabled={isFetchingNextPage}
          >
            <Text className="text-white font-semibold text-base">더 보기</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (expenses.length > 0) {
      return (
        <View className="py-4 items-center">
          <Text className="text-gray-400 text-sm">모든 데이터를 불러왔습니다</Text>
        </View>
      );
    }

    return null;
  };

  const renderEmpty = () => {
    if (isLoading || isInitLoading) {
      return (
        <View className="py-20 items-center">
          <ActivityIndicator size="large" color="#666" />
          <Text className="text-gray-500 mt-4">데이터를 불러오는 중...</Text>
        </View>
      );
    }
    return (
      <View className="py-20 items-center">
        <Text className="text-gray-500">데이터가 없습니다.</Text>
      </View>
    );
  };

  return (
    <View className="flex-1">
      <Text className="text-lg font-semibold text-gray-800 mb-4 mx-4">월 고정비 정보</Text>

      <FlatList
        data={expenses}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={true}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#666" />
          ) : undefined
        }
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
};
