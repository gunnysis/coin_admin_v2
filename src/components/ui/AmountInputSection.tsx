import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, TextInput, Keyboard, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from './Typography';
import { InputField } from './InputField';
import { SPACING, COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { getTestProps } from '../../utils/test-utils';
import type { AmountCurrency } from '../../types';

const MIN_TOUCH_TARGET = 44;

export interface AmountInputSectionProps {
  /** 표시할 금액 문자열 (천 단위 포맷 등 상위에서 관리) */
  amount: string;
  currency: AmountCurrency;
  onChangeAmount: (text: string) => void;
  onToggleCurrency: () => void;
  errorMessage?: string;
  isDisabled?: boolean;
  returnKeyType?: 'done' | 'next';
  onSubmitEditing?: () => void;
  /** 접근성 힌트 문맥 (예: "월 고정비 금액") */
  amountHintContext?: string;
}

/**
 * 금액 입력 섹션 (Dumb): 값과 콜백만 받아 표시·입력·통화 전환만 담당.
 * 환율·검증·저장 로직은 상위(훅/모달)에서 처리.
 */
export const AmountInputSection = forwardRef<TextInput, AmountInputSectionProps>(
  (
    {
      amount,
      currency,
      onChangeAmount,
      onToggleCurrency,
      errorMessage,
      isDisabled = false,
      returnKeyType = 'done',
      onSubmitEditing = () => Keyboard.dismiss(),
      amountHintContext = '금액',
    },
    ref
  ) => {
    const isKrw = currency === 'KRW';

    const label = useMemo(() => (isKrw ? '금액 (원)' : '금액 (달러)'), [isKrw]);
    const placeholder = useMemo(() => (isKrw ? '예: 500,000' : '예: 100'), [isKrw]);
    const helperText = useMemo(
      () =>
        isKrw
          ? '천 단위 구분자가 자동으로 추가됩니다'
          : '저장 시 원화로 변환되어 저장됩니다',
      [isKrw]
    );

    const handleToggle = useCallback(() => {
      if (isDisabled) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* noop */
      }
      onToggleCurrency();
    }, [onToggleCurrency, isDisabled]);

    const accessibilityHint = useMemo(
      () =>
        isKrw
          ? `${amountHintContext}을 원으로 입력하세요. 달러로 입력하려면 아래 달러로 입력을 탭하세요.`
          : `${amountHintContext}을 달러로 입력하면 원으로 변환되어 저장됩니다. 원화로 입력하려면 원으로 입력을 탭하세요.`,
      [isKrw, amountHintContext]
    );

    const linkColor = isDisabled ? COLORS.textTertiary : COLORS.primary;

    return (
      <View
        style={{
          backgroundColor: COLORS.gray50,
          borderRadius: RADIUS.base,
          padding: SPACING.base,
          marginBottom: SPACING.base,
        }}
      >
        <InputField
          ref={ref}
          label={label}
          placeholder={placeholder}
          value={amount}
          onChangeText={onChangeAmount}
          error={errorMessage}
          helperText={helperText}
          keyboardType="numeric"
          editable={!isDisabled}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel="금액 입력"
          accessibilityHint={accessibilityHint}
          {...getTestProps('amount-input')}
        />

        <Pressable
          onPress={handleToggle}
          disabled={isDisabled}
          hitSlop={{ top: SPACING.sm, bottom: SPACING.sm, left: SPACING.sm, right: SPACING.sm }}
          {...getTestProps('currency-toggle')}
          style={({ pressed }) => ({
            marginTop: SPACING.sm,
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.sm,
            minHeight: MIN_TOUCH_TARGET,
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel={isKrw ? '달러로 입력' : '원으로 입력'}
          accessibilityHint={
            isKrw
              ? '탭하면 달러 금액을 입력할 수 있습니다. 저장 시 원화로 변환됩니다.'
              : '탭하면 원화 금액을 직접 입력할 수 있습니다.'
          }
          accessibilityState={{ disabled: isDisabled }}
        >
          <Typography
            variant="caption"
            style={{
              color: linkColor,
              fontWeight: TYPOGRAPHY.fontWeight.medium,
            }}
          >
            {isKrw ? '달러로 입력' : '원으로 입력'}
          </Typography>
        </Pressable>
      </View>
    );
  }
);

AmountInputSection.displayName = 'AmountInputSection';
