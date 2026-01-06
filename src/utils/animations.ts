/**
 * 애니메이션 유틸리티 함수
 * 재사용 가능한 애니메이션 패턴
 */

import { Animated, LayoutAnimation, LayoutAnimationConfig } from 'react-native';
import { ANIMATION } from '../config/constants';

/**
 * Spring 애니메이션 설정
 */
export interface SpringConfig {
  tension?: number;
  friction?: number;
  useNativeDriver?: boolean;
}

/**
 * Timing 애니메이션 설정
 */
export interface TimingConfig {
  duration?: number;
  delay?: number;
  useNativeDriver?: boolean;
}

/**
 * 회전 애니메이션 생성
 */
export const createRotateAnimation = (
  animValue: Animated.Value,
  toValue: number,
  config: SpringConfig = {}
): Animated.CompositeAnimation => {
  return Animated.spring(animValue, {
    toValue,
    useNativeDriver: true,
    tension: config.tension ?? 200,
    friction: config.friction ?? 10,
    ...config,
  });
};

/**
 * 높이 애니메이션 생성
 */
export const createHeightAnimation = (
  animValue: Animated.Value,
  toValue: number,
  config: TimingConfig = {}
): Animated.CompositeAnimation => {
  return Animated.timing(animValue, {
    toValue,
    duration: config.duration ?? ANIMATION.DURATION.NORMAL,
    delay: config.delay ?? 0,
    useNativeDriver: false,
    ...config,
  });
};

/**
 * Progress Bar 애니메이션 생성
 */
export const createProgressAnimation = (
  animValue: Animated.Value,
  toValue: number,
  config: TimingConfig = {}
): Animated.CompositeAnimation => {
  return Animated.timing(animValue, {
    toValue,
    duration: config.duration ?? 800,
    delay: config.delay ?? 0,
    useNativeDriver: false,
    ...config,
  });
};

/**
 * 레이아웃 애니메이션 설정
 */
export const configureLayoutAnimation = (
  config?: Partial<LayoutAnimationConfig>
): void => {
  LayoutAnimation.configureNext({
    duration: config?.duration ?? ANIMATION.DURATION.NORMAL,
    create: {
      type: LayoutAnimation.Types.easeInEaseOut,
      property: LayoutAnimation.Properties.opacity,
      ...config?.create,
    },
    update: {
      type: LayoutAnimation.Types.easeInEaseOut,
      ...config?.update,
    },
    delete: {
      type: LayoutAnimation.Types.easeInEaseOut,
      ...config?.delete,
    },
  });
};

/**
 * Interpolate 헬퍼 - 타입 안전한 interpolate 생성
 */
export const createInterpolate = <T extends string | number>(
  animValue: Animated.Value,
  inputRange: number[],
  outputRange: T[]
): Animated.AnimatedInterpolation<T> => {
  return animValue.interpolate({
    inputRange,
    outputRange,
  });
};

/**
 * 병렬 애니메이션 실행
 */
export const runParallelAnimations = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.parallel(animations);
};

/**
 * 순차 애니메이션 실행
 */
export const runSequenceAnimations = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

