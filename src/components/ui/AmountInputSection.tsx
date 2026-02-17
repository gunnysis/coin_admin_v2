import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, TextInput, Keyboard, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CurrencyKrw, CurrencyDollar } from 'phosphor-react-native';
import { Typography } from './Typography';
import { ExchangeRateHint } from './ExchangeRateHint';
import { InputField } from './InputField';
import { SPACING, COLORS, RADIUS, TYPOGRAPHY, ICON_SIZES } from '../../constants/theme';
import type { AmountCurrency } from '../../types';

const CHIP_RIPPLE_UNSELECTED = 'rgba(59, 130, 246, 0.12)';
const CHIP_RIPPLE_SELECTED = 'rgba(255, 255, 255, 0.3)';
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
 * 금액 입력 섹션: 입력 필드 + 원/달러 칩(둘 다 노출) + 환율 안내.
 * 기본은 원(KRW), 필요할 때만 달러(USD) 선택. 원 전용(CurrencyKrw)·달러 전용(CurrencyDollar) SVG 아이콘 사용.
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
          : '저장 시 현재 환율로 원화 변환됩니다',
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
          ? `${amountHintContext}을 원으로 입력하세요. 달러로 입력하려면 달러 칩을 탭하세요.`
          : `${amountHintContext}을 달러로 입력하면 원으로 변환되어 저장됩니다. 원화로 입력하려면 원 칩을 탭하세요.`,
      [isKrw, amountHintContext]
    );

    const disabledStyle = currencySelectorDisabled;
    const krwSelected = isKrw;
    const usdSelected = !isKrw;

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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm }}>
          {/* 원 칩 (왼쪽, 기본 선택) */}
          <Pressable
            onPress={switchToKrw}
            disabled={currencySelectorDisabled}
            android_ripple={{ color: krwSelected ? CHIP_RIPPLE_SELECTED : CHIP_RIPPLE_UNSELECTED }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              minHeight: MIN_TOUCH_TARGET,
              borderRadius: RADIUS.sm,
              backgroundColor: disabledStyle ? COLORS.gray200 : krwSelected ? COLORS.primary : COLORS.gray100,
              opacity: pressed ? 0.9 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel={krwSelected ? '원 (선택됨)' : '원'}
            accessibilityHint="탭하면 원화로 금액을 입력합니다."
            accessibilityState={{ disabled: currencySelectorDisabled, selected: krwSelected }}
          >
            <CurrencyKrw
              size={ICON_SIZES.xs}
              color={disabledStyle ? COLORS.textTertiary : krwSelected ? COLORS.textInverse : COLORS.textSecondary}
              style={{ marginRight: SPACING.xs }}
            />
            <Typography
              variant="caption"
              style={{
                color: disabledStyle ? COLORS.textTertiary : krwSelected ? COLORS.textInverse : COLORS.textSecondary,
                fontWeight: TYPOGRAPHY.fontWeight.medium,
              }}
            >
              원
            </Typography>
          </Pressable>

          {/* 달러 칩 (오른쪽) */}
          <Pressable
            onPress={switchToUsd}
            disabled={currencySelectorDisabled}
            android_ripple={{ color: usdSelected ? CHIP_RIPPLE_SELECTED : CHIP_RIPPLE_UNSELECTED }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: SPACING.sm,
              paddingHorizontal: SPACING.md,
              minHeight: MIN_TOUCH_TARGET,
              borderRadius: RADIUS.sm,
              backgroundColor: disabledStyle ? COLORS.gray200 : usdSelected ? COLORS.primary : COLORS.gray100,
              opacity: pressed ? 0.9 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel={usdSelected ? '달러 (선택됨)' : '달러'}
            accessibilityHint="탭하면 달러로 입력합니다. 저장 시 원화로 변환됩니다."
            accessibilityState={{ disabled: currencySelectorDisabled, selected: usdSelected }}
          >
            <CurrencyDollar
              size={ICON_SIZES.xs}
              color={disabledStyle ? COLORS.textTertiary : usdSelected ? COLORS.textInverse : COLORS.textSecondary}
              style={{ marginRight: SPACING.xs }}
            />
            <Typography
              variant="caption"
              style={{
                color: disabledStyle ? COLORS.textTertiary : usdSelected ? COLORS.textInverse : COLORS.textSecondary,
                fontWeight: TYPOGRAPHY.fontWeight.medium,
              }}
            >
              달러
            </Typography>
          </Pressable>
        </View>

        {usdSelected && (
          <View style={{ marginTop: SPACING.xs }}>
            <ExchangeRateHint
              show
              rate={exchangeRate}
              isLoading={exchangeRateLoading}
              isFallback={exchangeRateFallback}
            />
          </View>
        )}
      </View>
    );
  }
);

AmountInputSection.displayName = 'AmountInputSection';
