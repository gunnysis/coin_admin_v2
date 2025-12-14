import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { FixedMonthCost } from '../types';
import { formatCurrency } from '../utils/format';
import { getNextPaymentDate } from '../utils/date';

interface ExpenseItemProps {
  item: FixedMonthCost;
  onDelete: (id: number) => void;
  onEdit?: (item: FixedMonthCost) => void;
  isDeleting?: boolean;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  item,
  onDelete,
  onEdit,
  isDeleting = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm mx-4 border border-gray-100"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 mr-3">
          <Text className="text-base font-semibold text-gray-800 mb-1">{item.name}</Text>
          <Text className="text-lg font-bold text-blue-600 mb-1">
            {formatCurrency(item.amount)}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text className="text-xs text-gray-400 mr-1">📅</Text>
            <Text className="text-xs text-gray-400">
              다음 결제일: {getNextPaymentDate(item.start_date)}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(item)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              activeOpacity={0.8}
              className="bg-yellow-400 rounded-xl p-3 shadow-sm"
              style={{
                shadowColor: '#fbbf24',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              <Text className="text-gray-800 text-lg">✏️</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onDelete(item.id)}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={isDeleting}
            activeOpacity={0.8}
            className={`rounded-xl p-3 shadow-sm ${
              isDeleting ? 'bg-gray-300' : 'bg-red-500'
            }`}
            style={{
              shadowColor: isDeleting ? '#9ca3af' : '#ef4444',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Text className="text-white text-lg font-semibold">✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};
