import { useCallback, useRef } from 'react';
import { Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * 항목 액션 버튼 애니메이션 및 핸들러 훅
 * ExpenseItem과 VariableExpenseItem에서 공통으로 사용
 */
export const useExpenseItemActions = <T extends { id: number }>(
  item: T,
  onEdit?: (item: T) => void,
  onDelete?: (id: number) => void
) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [scaleAnim]);

  const handleEditPress = useCallback(() => {
    if (onEdit) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onEdit(item);
    }
  }, [onEdit, item]);

  const handleDeletePress = useCallback(() => {
    if (onDelete) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onDelete(item.id);
    }
  }, [onDelete, item.id]);

  return {
    scaleAnim,
    handlePressIn,
    handlePressOut,
    handleEditPress,
    handleDeletePress,
  };
};

