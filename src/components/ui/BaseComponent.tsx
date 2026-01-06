import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

/**
 * 기본 컴포넌트 Props 인터페이스
 */
export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityHint?: string;
  style?: ViewStyle | TextStyle | (ViewStyle | TextStyle)[];
  className?: string;
}

/**
 * 컴포넌트 Props 타입 유틸리티
 */
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * ForwardRef 타입 유틸리티
 */
export type ForwardRefComponent<T, P> = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<P> & React.RefAttributes<T>
>;

