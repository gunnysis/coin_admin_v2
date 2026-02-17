import React from 'react';
import { Text, TextProps } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { useDeviceDimensions } from '../../hooks/useDeviceDimensions';
import { getResponsiveFontSize } from '../../utils/responsive';

type ColorKey =
  | 'textPrimary'
  | 'textSecondary'
  | 'textTertiary'
  | 'textInverse'
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'expense'
  | 'income'
  | 'warning'
  | 'success'
  | keyof typeof COLORS;

interface TypographyProps extends TextProps {
  /** Display(총액 등) / Heading / Body / Caption */
  variant?: 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'body2' | 'caption' | 'label';
  color?: ColorKey;
  weight?: keyof typeof TYPOGRAPHY.fontWeight;
  align?: 'left' | 'center' | 'right';
  /** 금액 등 숫자 가독성: tabular-nums 적용 */
  tabularNums?: boolean;
}

export const Typography = React.memo<TypographyProps>(({
  variant = 'body',
  color = 'textPrimary',
  weight,
  align = 'left',
  tabularNums = false,
  style,
  children,
  ...props
}) => {
  const device = useDeviceDimensions();

  const variantStyles = React.useMemo(() => {
    const baseDisplay = 32;
    const baseH1 = TYPOGRAPHY.fontSize['4xl'];
    const baseH2 = TYPOGRAPHY.fontSize['3xl'];
    const baseH3 = TYPOGRAPHY.fontSize['2xl'];
    const baseBody = TYPOGRAPHY.fontSize.base;
    const baseBody2 = TYPOGRAPHY.fontSize.sm;
    const baseCaption = TYPOGRAPHY.fontSize.xs;
    const baseLabel = TYPOGRAPHY.fontSize.sm;

    return {
      display: {
        fontSize: getResponsiveFontSize(device, baseDisplay),
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        lineHeight: getResponsiveFontSize(device, baseDisplay) * TYPOGRAPHY.lineHeight.tight,
      },
      h1: {
        fontSize: getResponsiveFontSize(device, baseH1),
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        lineHeight: getResponsiveFontSize(device, baseH1) * TYPOGRAPHY.lineHeight.tight,
      },
      h2: {
        fontSize: getResponsiveFontSize(device, baseH2),
        fontWeight: TYPOGRAPHY.fontWeight.bold,
        lineHeight: getResponsiveFontSize(device, baseH2) * TYPOGRAPHY.lineHeight.tight,
      },
      h3: {
        fontSize: getResponsiveFontSize(device, baseH3),
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        lineHeight: getResponsiveFontSize(device, baseH3) * TYPOGRAPHY.lineHeight.normal,
      },
      body: {
        fontSize: getResponsiveFontSize(device, baseBody),
        fontWeight: TYPOGRAPHY.fontWeight.normal,
        lineHeight: getResponsiveFontSize(device, baseBody) * TYPOGRAPHY.lineHeight.normal,
      },
      body2: {
        fontSize: getResponsiveFontSize(device, baseBody2),
        fontWeight: TYPOGRAPHY.fontWeight.normal,
        lineHeight: getResponsiveFontSize(device, baseBody2) * TYPOGRAPHY.lineHeight.normal,
      },
      caption: {
        fontSize: getResponsiveFontSize(device, baseCaption),
        fontWeight: TYPOGRAPHY.fontWeight.medium,
        lineHeight: getResponsiveFontSize(device, baseCaption) * TYPOGRAPHY.lineHeight.normal,
      },
      label: {
        fontSize: getResponsiveFontSize(device, baseLabel),
        fontWeight: TYPOGRAPHY.fontWeight.semibold,
        lineHeight: getResponsiveFontSize(device, baseLabel) * TYPOGRAPHY.lineHeight.normal,
      },
    };
  }, [device]);

  const colorValue = COLORS[color as keyof typeof COLORS] ?? COLORS.textPrimary;

  return (
    <Text
      style={[
        variantStyles[variant],
        { color: colorValue, textAlign: align },
        weight && { fontWeight: TYPOGRAPHY.fontWeight[weight] },
        tabularNums && { fontVariant: ['tabular-nums'] },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
});
