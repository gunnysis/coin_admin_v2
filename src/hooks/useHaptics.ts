import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * 햅틱 피드백 훅
 */
export const useHaptics = () => {
  const triggerHaptic = useCallback((type: HapticType = 'light') => {
    try {
      switch (type) {
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      // 햅틱이 지원되지 않는 기기에서는 무시
      if (__DEV__) {
        console.warn('Haptic feedback not available:', error);
      }
    }
  }, []);

  return { triggerHaptic };
};

