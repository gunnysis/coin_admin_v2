import React, { useEffect, useRef, useMemo } from 'react';
import { View, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from './ui/Typography';
import { SPACING, COLORS } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsivePadding } from '../utils/responsive';
import { getTestProps } from '../utils/test-utils';

export type TabType = 'fixed' | 'variable';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const TabNavigation = React.memo<TabNavigationProps>(({
  activeTab,
  onTabChange,
}) => {
  const device = useDeviceDimensions();
  const responsivePadding = getResponsivePadding(device, SPACING.base);
  // Initialize with fixed values, update via useEffect
  const indicatorAnim = useRef(new Animated.Value(0)).current;
  const fixedOpacity = useRef(new Animated.Value(1)).current;
  const variableOpacity = useRef(new Animated.Value(0.6)).current;
  // Store interpolate result in ref - initialize immediately to avoid undefined
  // useRef initializer runs only once, so this is safe
  const indicatorTranslateXRef = useRef(
    indicatorAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    })
  );

  useEffect(() => {
    const toValue = activeTab === 'fixed' ? 0 : 1;
    
    Animated.parallel([
      Animated.spring(indicatorAnim, {
        toValue,
        useNativeDriver: true,
        tension: 300,
        friction: 30,
      }),
      Animated.timing(fixedOpacity, {
        toValue: activeTab === 'fixed' ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(variableOpacity, {
        toValue: activeTab === 'variable' ? 1 : 0.6,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [activeTab, indicatorAnim, fixedOpacity, variableOpacity]);

  const handleTabPress = (tab: TabType) => {
    if (tab !== activeTab) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onTabChange(tab);
    }
  };

  return (
    <View 
      className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 relative"
      style={{ paddingHorizontal: responsivePadding }}
    >
      <View className="flex-row relative" style={{ paddingVertical: SPACING.base }}>
        <TouchableOpacity
          onPress={() => handleTabPress('fixed')}
          className="flex-1 items-center justify-center"
          style={{ minHeight: 44 }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="고정비 탭"
          accessibilityState={{ selected: activeTab === 'fixed' }}
          {...getTestProps('tab-fixed')}
        >
          <Animated.View style={{ opacity: fixedOpacity }}>
            <Typography
              variant="body"
              color={activeTab === 'fixed' ? 'primary' : 'textSecondary'}
              weight={activeTab === 'fixed' ? 'semibold' : 'normal'}
            >
              고정비
            </Typography>
          </Animated.View>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => handleTabPress('variable')}
          className="flex-1 items-center justify-center"
          style={{ minHeight: 44 }}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="유동비 탭"
          accessibilityState={{ selected: activeTab === 'variable' }}
          {...getTestProps('tab-variable')}
        >
          <Animated.View style={{ opacity: variableOpacity }}>
            <Typography
              variant="body"
              color={activeTab === 'variable' ? 'primary' : 'textSecondary'}
              weight={activeTab === 'variable' ? 'semibold' : 'normal'}
            >
              유동비
            </Typography>
          </Animated.View>
        </TouchableOpacity>
      </View>
      
      {/* 애니메이션 인디케이터 */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 0,
          left: responsivePadding,
          width: '50%',
          height: 3,
          backgroundColor: COLORS.primary,
          transform: [{ translateX: indicatorTranslateXRef.current }],
        }}
      />
    </View>
  );
});

