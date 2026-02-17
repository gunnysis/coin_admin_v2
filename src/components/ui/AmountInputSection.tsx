import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, TextInput, Keyboard, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Typography } from './Typography';
import { InputField } from './InputField';
import { SPACING, COLORS, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import type { AmountCurrency } from '../../types';

const MIN_TOUCH_TARGET = 44;

export interface AmountInputSectionProps {
  amountCurrency: AmountCurrency;
  onCurrencyChange: (c: AmountCurrency) => void;
  formattedAmount: string;
  onAmountChange: (text: string) => void;
  error?: string;
  disabled?: boolean;
  currencySelectorDisabled?: boolean;
  exchangeRate?: number;
  exchangeRateLoading?: boolean;
  exchangeRateFallback?: boolean;
  returnKeyType?: 'done' | 'next';
  onSubmitEditing?: () => void;
  amountHintContext?: string;
  /** 통화 전환 직후 호출 (예: 금액 필드 포커스) */
  onAfterCurrencyChange?: () => void;
}

/**
 * 금액 입력 섹션: 입력 필드가 주인공, 통화 전환은 단일 링크로 보조.
 * 기본은 원(KRW). 달러 입력 시 "달러로 입력" 한 번 탭 후 금액 입력. 환율은 화면에 표시하지 않고 저장 시에만 원화 변환에 사용.
 */
export const AmountInputSection = forwardRef<TextInput, AmountInputSectionProps>(
  (
    {
      amountCurrency,
      onCurrencyChange,
      formattedAmount,
      onAmountChange,
      error,
      disabled = false,
      currencySelectorDisabled = false,
      exchangeRate = 0,
      exchangeRateLoading = false,
      exchangeRateFallback = false,
      returnKeyType = 'done',
      onSubmitEditing = () => Keyboard.dismiss(),
      amountHintContext = '금액',
      onAfterCurrencyChange,
    },
    ref
  ) => {
    const isKrw = amountCurrency === 'KRW';

    const label = useMemo(() => (isKrw ? '금액 (원)' : '금액 (달러)'), [isKrw]);
    const placeholder = useMemo(() => (isKrw ? '예: 500,000' : '예: 100'), [isKrw]);
    const helperText = useMemo(
      () =>
        isKrw
          ? '천 단위 구분자가 자동으로 추가됩니다'
          : '저장 시 원화로 변환되어 저장됩니다',
      [isKrw]
    );

    const focusAmountAfterChange = useCallback(() => {
      if (onAfterCurrencyChange) setTimeout(onAfterCurrencyChange, 0);
    }, [onAfterCurrencyChange]);

    const switchToKrw = useCallback(() => {
      if (currencySelectorDisabled) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* noop */
      }
      onCurrencyChange('KRW');
      focusAmountAfterChange();
    }, [onCurrencyChange, currencySelectorDisabled, focusAmountAfterChange]);

    const switchToUsd = useCallback(() => {
      if (currencySelectorDisabled) return;
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {
        /* noop */
      }
      onCurrencyChange('USD');
      focusAmountAfterChange();
    }, [onCurrencyChange, currencySelectorDisabled, focusAmountAfterChange]);

    const accessibilityHint = useMemo(
      () =>
        isKrw
          ? `${amountHintContext}을 원으로 입력하세요. 달러로 입력하려면 아래 달러로 입력을 탭하세요.`
          : `${amountHintContext}을 달러로 입력하면 원으로 변환되어 저장됩니다. 원화로 입력하려면 원으로 입력을 탭하세요.`,
      [isKrw, amountHintContext]
    );

    const linkColor = currencySelectorDisabled ? COLORS.textTertiary : COLORS.primary;

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
          value={formattedAmount}
          onChangeText={onAmountChange}
          error={error}
          helperText={helperText}
          keyboardType="numeric"
          editable={!disabled}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel="금액 입력"
          accessibilityHint={accessibilityHint}
        />

        <Pressable
          onPress={isKrw ? switchToUsd : switchToKrw}
          disabled={currencySelectorDisabled}
          style={({ pressed }) => ({
            marginTop: SPACING.sm,
            paddingVertical: SPACING.sm,
            paddingHorizontal: SPACING.xs,
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
          accessibilityState={{ disabled: currencySelectorDisabled }}
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
