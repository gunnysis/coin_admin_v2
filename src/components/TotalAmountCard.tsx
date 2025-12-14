import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formatCurrency } from '../utils/format';
import { INCREASE_RATE } from '../constants';

interface TotalAmountCardProps {
  totalAmount: number;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const TotalAmountCard: React.FC<TotalAmountCardProps> = ({
  totalAmount,
  isExpanded = false,
  onToggleExpand,
}) => {
  return (
    <View className="mx-4 mb-6">
      <View className="bg-white rounded-2xl p-5 shadow-sm">
        <Text className="text-base font-semibold text-gray-700 mb-3">월 고정비 현황</Text>
        <Text className="text-4xl font-bold text-gray-800 mb-3">
          {formatCurrency(totalAmount)}
        </Text>
        <View className="flex-row items-center justify-between">
          <View className="bg-green-500 rounded-full px-3 py-1">
            <Text className="text-white text-sm font-medium">+{INCREASE_RATE}%</Text>
          </View>
          {onToggleExpand && (
            <TouchableOpacity
              onPress={onToggleExpand}
              className="items-center justify-center"
            >
              <Text className="text-gray-400 text-lg">{isExpanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
