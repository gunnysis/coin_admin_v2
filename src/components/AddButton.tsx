import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Typography } from './ui/Typography';
import { SPACING } from '../constants/theme';

interface AddButtonProps {
  onPress: () => void;
  disabled?: boolean;
  bottomInset?: number;
}

export const AddButton: React.FC<AddButtonProps> = ({ 
  onPress, 
  disabled = false,
  bottomInset = 0,
}) => {
  // 하단 바를 고려한 버튼 위치 계산
  // 하단 여백 = SafeArea 하단 여백 + 추가 여백 (플랫폼별)
  const additionalBottomPadding = Platform.OS === 'ios' ? SPACING.xl : SPACING.lg;
  const bottomPosition = bottomInset + additionalBottomPadding;

  return (
    <View 
      className="absolute left-0 right-0 items-center z-10"
      style={{ bottom: bottomPosition }}
    >
      <TouchableOpacity
        onPress={onPress}
        className={`
          w-14 h-14 rounded-full bg-white border-2 
          items-center justify-center shadow-lg
          ${disabled ? 'opacity-50 border-gray-400' : 'border-blue-500'}
        `}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityLabel="고정비 추가"
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        <Typography 
          variant="h1" 
          color="primary" 
          weight="light" 
          className="leading-10"
        >
          +
        </Typography>
      </TouchableOpacity>
    </View>
  );
};
