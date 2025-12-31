import { useState, useEffect, useMemo } from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { BREAKPOINTS } from '../constants/responsive';

/**
 * 디바이스 타입 정의
 */
export type DeviceType = 'phone' | 'tablet' | 'desktop';

/**
 * 화면 방향 정의
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * 태블릿 크기 타입
 */
export type TabletSize = 'small' | 'medium' | 'large';

/**
 * 화면 크기 및 디바이스 정보
 */
export interface DeviceDimensions {
  width: number;
  height: number;
  deviceType: DeviceType;
  orientation: Orientation;
  isTablet: boolean;
  isPhone: boolean;
  isLandscape: boolean;
  isPortrait: boolean;
  // 태블릿 크기 분류
  isSmallTablet: boolean; // 600-840dp
  isMediumTablet: boolean; // 840-1200dp
  isLargeTablet: boolean; // 1200dp 이상
  tabletSize?: TabletSize; // 태블릿인 경우 크기 정보
}

/**
 * 디바이스 타입 판별 함수
 */
const getDeviceType = (width: number, height: number): DeviceType => {
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  
  // 태블릿 기준: 최소 너비가 600dp 이상
  if (minDimension >= BREAKPOINTS.TABLET_MIN) {
    return 'tablet';
  }
  
  // 데스크톱 기준: 너비가 1200dp 이상
  if (maxDimension >= BREAKPOINTS.DESKTOP_MIN) {
    return 'desktop';
  }
  
  return 'phone';
};

/**
 * 화면 방향 판별 함수
 */
const getOrientation = (width: number, height: number): Orientation => {
  return width > height ? 'landscape' : 'portrait';
};

/**
 * 태블릿 크기 판별 함수
 */
const getTabletSize = (minDimension: number): TabletSize | undefined => {
  if (minDimension >= BREAKPOINTS.TABLET_MEDIUM_MAX) {
    return 'large';
  }
  if (minDimension >= BREAKPOINTS.TABLET_SMALL_MAX) {
    return 'medium';
  }
  if (minDimension >= BREAKPOINTS.TABLET_MIN) {
    return 'small';
  }
  return undefined;
};

/**
 * 디바이스 정보 생성 함수 (중복 코드 제거)
 */
const createDeviceDimensions = (width: number, height: number): DeviceDimensions => {
  const minDimension = Math.min(width, height);
  const deviceType = getDeviceType(width, height);
  const orientation = getOrientation(width, height);
  const isTablet = deviceType === 'tablet';
  const tabletSize = getTabletSize(minDimension);
  
  return {
    width,
    height,
    deviceType,
    orientation,
    isTablet,
    isPhone: deviceType === 'phone',
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    isSmallTablet: tabletSize === 'small',
    isMediumTablet: tabletSize === 'medium',
    isLargeTablet: tabletSize === 'large',
    tabletSize,
  };
};

/**
 * 화면 크기 감지 및 디바이스 정보를 제공하는 훅
 * 
 * @example
 * ```tsx
 * const { width, height, isTablet, isLandscape } = useDeviceDimensions();
 * 
 * if (isTablet && isLandscape) {
 *   // 태블릿 가로 모드 레이아웃
 * }
 * ```
 */
export const useDeviceDimensions = (): DeviceDimensions => {
  const initialDimensions = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    return createDeviceDimensions(width, height);
  }, []);

  const [dimensions, setDimensions] = useState<DeviceDimensions>(initialDimensions);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      const { width, height } = window;
      setDimensions(createDeviceDimensions(width, height));
    });

    return () => {
      if (subscription && 'remove' in subscription) {
        subscription.remove();
      }
    };
  }, []);

  return dimensions;
};

/**
 * 반응형 값 계산 유틸리티
 * 디바이스 타입과 방향에 따라 다른 값을 반환
 */
export const useResponsiveValue = <T,>(
  phone: T,
  tablet?: T,
  tabletLandscape?: T
): T => {
  const { isTablet, isLandscape } = useDeviceDimensions();
  
  if (isTablet && isLandscape && tabletLandscape !== undefined) {
    return tabletLandscape;
  }
  
  if (isTablet && tablet !== undefined) {
    return tablet;
  }
  
  return phone;
};

/**
 * 반응형 스타일 계산 유틸리티
 */
export const useResponsiveStyle = <T,>(
  phoneStyle: T,
  tabletStyle?: T,
  tabletLandscapeStyle?: T
): T => {
  return useResponsiveValue(phoneStyle, tabletStyle, tabletLandscapeStyle);
};

