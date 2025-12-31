import React from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { Typography } from './ui/Typography';
import { SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsiveValue } from '../utils/responsive';

interface AddButtonProps {
  onPress: () => void;
  disabled?: boolean;
  bottomInset?: number;
}

export const AddButton = React.memo<AddButtonProps>(({ 
  onPress, 
  disabled = false,
  bottomInset = 0,
}) => {
  const device = useDeviceDimensions();
  
  // 반응형 버튼 크기
  const buttonSize = getResponsiveValue(device, 56, device.isTablet ? 64 : 56);
  const borderWidth = getResponsiveValue(device, 2, device.isTablet ? 3 : 2);
  
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
          rounded-full bg-white border-2 
          items-center justify-center shadow-lg
          ${disabled ? 'opacity-50 border-gray-400' : 'border-blue-500'}
        `}
        style={{
          width: buttonSize,
          height: buttonSize,
          borderWidth,
        }}
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
});
