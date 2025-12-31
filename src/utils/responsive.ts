import { DeviceDimensions, TabletSize } from '../hooks/useDeviceDimensions';
import { SPACING } from '../constants/theme';
import {
  BREAKPOINTS,
  PADDING_MULTIPLIERS,
  FONT_SIZE_MULTIPLIERS,
  GRID_COLUMNS,
  MAX_WIDTHS,
  GAP_MULTIPLIER,
} from '../constants/responsive';

/**
 * 반응형 레이아웃 유틸리티 함수들
 */

/**
 * 태블릿 크기 키를 상수 키로 변환
 */
const getTabletSizeKey = (tabletSize: TabletSize): 'LARGE' | 'MEDIUM' | 'SMALL' => {
  switch (tabletSize) {
    case 'large':
      return 'LARGE';
    case 'medium':
      return 'MEDIUM';
    case 'small':
      return 'SMALL';
  }
};

/**
 * 태블릿 여부에 따라 다른 값을 반환
 */
export const getResponsiveValue = <T,>(
  device: DeviceDimensions,
  phoneValue: T,
  tabletValue: T
): T => {
  return device.isTablet ? tabletValue : phoneValue;
};

/**
 * 태블릿 가로/세로 모드에 따라 다른 값을 반환
 */
export const getResponsiveValueByOrientation = <T,>(
  device: DeviceDimensions,
  phoneValue: T,
  tabletPortraitValue: T,
  tabletLandscapeValue: T
): T => {
  if (device.isTablet) {
    return device.isLandscape ? tabletLandscapeValue : tabletPortraitValue;
  }
  return phoneValue;
};

/**
 * 반응형 패딩 계산
 * 태블릿 크기에 따라 다른 패딩 적용
 */
export const getResponsivePadding = (
  device: DeviceDimensions,
  basePadding: number = SPACING.base
): number => {
  if (!device.isTablet || !device.tabletSize) {
    return basePadding;
  }

  const multipliers = device.isLandscape
    ? PADDING_MULTIPLIERS.LANDSCAPE
    : PADDING_MULTIPLIERS.PORTRAIT;

  const multiplier = multipliers[getTabletSizeKey(device.tabletSize)];
  return basePadding * multiplier;
};

/**
 * 반응형 마진 계산
 */
export const getResponsiveMargin = (
  device: DeviceDimensions,
  baseMargin: number = SPACING.base
): number => {
  return getResponsivePadding(device, baseMargin);
};

/**
 * 반응형 폰트 크기 계산
 * 태블릿 크기에 따라 다른 폰트 크기 적용
 */
export const getResponsiveFontSize = (
  device: DeviceDimensions,
  baseSize: number
): number => {
  if (!device.isTablet || !device.tabletSize) {
    return baseSize;
  }

  const multipliers = device.isLandscape
    ? FONT_SIZE_MULTIPLIERS.LANDSCAPE
    : FONT_SIZE_MULTIPLIERS.PORTRAIT;

  const multiplier = multipliers[getTabletSizeKey(device.tabletSize)];
  return baseSize * multiplier;
};

/**
 * 반응형 컬럼 수 계산
 * 태블릿 크기에 따라 다른 컬럼 수 적용
 */
export const getResponsiveColumns = (device: DeviceDimensions): number => {
  if (!device.isTablet || !device.tabletSize) {
    return 1; // 폰: 1열
  }

  const columns = device.isLandscape
    ? GRID_COLUMNS.LANDSCAPE
    : GRID_COLUMNS.PORTRAIT;

  return columns[getTabletSizeKey(device.tabletSize)];
};

/**
 * 반응형 최대 너비 계산
 * 태블릿 크기에 따라 다른 최대 너비 적용
 */
export const getResponsiveMaxWidth = (device: DeviceDimensions): number | undefined => {
  if (!device.isTablet || !device.tabletSize) {
    return undefined; // 폰: 제한 없음
  }

  const maxWidths = device.isLandscape
    ? MAX_WIDTHS.LANDSCAPE
    : MAX_WIDTHS.PORTRAIT;

  return maxWidths[getTabletSizeKey(device.tabletSize)];
};

/**
 * 반응형 그리드 간격 계산
 */
export const getResponsiveGap = (
  device: DeviceDimensions,
  baseGap: number = SPACING.base
): number => {
  return device.isTablet ? baseGap * GAP_MULTIPLIER : baseGap;
};

/**
 * 카드 너비 계산 (그리드 레이아웃용)
 */
export const getCardWidth = (
  device: DeviceDimensions,
  containerWidth: number,
  gap: number = SPACING.base
): number => {
  const columns = getResponsiveColumns(device);
  const totalGap = gap * (columns - 1);
  return (containerWidth - totalGap) / columns;
};

/**
 * 태블릿 최적화된 컨테이너 스타일 계산
 */
export const getContainerStyle = (device: DeviceDimensions): { paddingHorizontal: number; maxWidth?: number; alignSelf?: 'center' } => {
  const maxWidth = getResponsiveMaxWidth(device);
  const padding = getResponsivePadding(device);
  
  const style: { paddingHorizontal: number; maxWidth?: number; alignSelf?: 'center' } = {
    paddingHorizontal: padding,
  };
  
  if (maxWidth) {
    style.maxWidth = maxWidth;
    style.alignSelf = 'center';
  }
  
  return style;
};

