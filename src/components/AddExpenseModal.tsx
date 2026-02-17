import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  Pressable,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AddExpenseFormData, FixedMonthCost } from '../types';
import { validateExpenseForm } from '../utils/validation';
import { DATE_FORMAT_PLACEHOLDER } from '../constants';
import { formatDateToString, getTodayDateString } from '../utils/date';
import { formatAmount, parseAmount } from '../utils/amount';
import { formatError, logError } from '../utils/errorHandler';
import { Typography } from './ui/Typography';
import { InputField } from './ui/InputField';
import { Button } from './ui/Button';
import { AmountInputSection } from './ui/AmountInputSection';
import { SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { useAmountWithCurrency } from '../hooks/useAmountWithCurrency';
import { getResponsivePadding } from '../utils/responsive';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: AddExpenseFormData) => Promise<void>;
  onUpdate?: (data: AddExpenseFormData & { id: number }) => Promise<void>;
  editingItem?: FixedMonthCost | null;
  isPending?: boolean;
}

// 상수 정의
const MODAL_ANIMATION_DURATION = 300;
const KEYBOARD_AVOIDING_OFFSET = Platform.OS === 'ios' ? 0 : 20;

/**
 * AddExpenseModal 컴포넌트
 * 
 * 월 고정비 항목을 추가/수정하는 모달 컴포넌트
 * - 안드로이드/iOS 모두 호환
 * - 키보드 처리 최적화
 * - 실시간 유효성 검사
 * - 접근성 지원
 */
export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  onAdd,
  onUpdate,
  editingItem,
  isPending = false,
}) => {
  const insets = useSafeAreaInsets();
  const device = useDeviceDimensions();
  const nameInputRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);
  
  // 반응형 스타일
  const responsivePadding = getResponsivePadding(device, SPACING.xl);

  const { rate: exchangeRate, isLoading: isExchangeRateLoading, isFallback: isExchangeRateFallback } = useExchangeRate();
  const {
    amount,
    formattedAmount,
    amountCurrency,
    setAmountCurrency,
    handleAmountChange: hookHandleAmountChange,
    getAmountInKrw,
    isEditMode: isAmountEditMode,
  } = useAmountWithCurrency({
    initialAmountKrw: editingItem?.amount,
    visible,
  });

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    amount?: string;
    startDate?: string;
  }>({});

  const isEditMode = useMemo(() => !!editingItem, [editingItem]);

  // 폼 초기화 (이름, 날짜, 포커스)
  useEffect(() => {
    if (!visible) {
      setName('');
      setStartDate('');
      setSelectedDate(new Date());
      setShowDatePicker(false);
      setValidationErrors({});
      Keyboard.dismiss();
    } else if (editingItem) {
      setName(editingItem.name);
      setStartDate(editingItem.start_date);
      setSelectedDate(new Date(editingItem.start_date));
      setValidationErrors({});
    } else {
      const today = new Date();
      setSelectedDate(today);
      setStartDate(getTodayDateString());
      setValidationErrors({});
      const focusDelay = device.isTablet ? MODAL_ANIMATION_DURATION + 100 : MODAL_ANIMATION_DURATION;
      setTimeout(() => nameInputRef.current?.focus(), focusDelay);
    }
  }, [visible, editingItem, device.isTablet]);

  // 실시간 유효성 검사
  const validateField = useCallback((field: 'name' | 'amount' | 'startDate', value: string) => {
    const errors = { ...validationErrors };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          errors.name = '이름을 입력해주세요.';
        } else {
          delete errors.name;
        }
        break;
      case 'amount':
        const numValue = parseAmount(value);
        if (!numValue) {
          errors.amount = '금액을 입력해주세요.';
        } else if (Number(numValue) <= 0) {
          errors.amount = '올바른 금액을 입력해주세요.';
        } else {
          delete errors.amount;
        }
        break;
      case 'startDate':
        if (!value.trim()) {
          errors.startDate = '결제일을 선택해주세요.';
        } else {
          delete errors.startDate;
        }
        break;
    }
    
    setValidationErrors(errors);
  }, [validationErrors]);

  // 날짜 변경 핸들러
  const handleDateChange = useCallback((event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'dismissed') {
        return;
      }
    }
    
    if (date) {
      setSelectedDate(date);
      const formattedDate = formatDateToString(date);
      setStartDate(formattedDate);
      validateField('startDate', formattedDate);
    }
  }, [validateField]);

  // 날짜 선택기 열기
  const openDatePicker = useCallback(() => {
    if (!isPending) {
      Keyboard.dismiss();
      setShowDatePicker(true);
    }
  }, [isPending]);

  // 날짜 선택기 닫기
  const closeDatePicker = useCallback(() => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDateToString(selectedDate);
      setStartDate(formattedDate);
      validateField('startDate', formattedDate);
    }
  }, [selectedDate, validateField]);

  // 이름 변경 핸들러
  const handleNameChange = useCallback((text: string) => {
    setName(text);
    validateField('name', text);
  }, [validateField]);

  const handleAmountChange = useCallback(
    (text: string) => {
      hookHandleAmountChange(text);
      const formatted = formatAmount(parseAmount(text));
      validateField('amount', formatted);
    },
    [validateField, hookHandleAmountChange]
  );

  const handleSubmit = useCallback(async () => {
    const validation = validateExpenseForm(name, amount, startDate);
    if (!validation.isValid) {
      Alert.alert('입력 오류', validation.errorMessage || '입력 정보를 확인해주세요.', [
        { text: '확인', style: 'default' },
      ]);
      return;
    }
    if (amountCurrency === 'USD' && isExchangeRateLoading) {
      Alert.alert('안내', '환율을 불러오는 중입니다. 잠시 후 다시 시도해주세요.', [{ text: '확인', style: 'default' }]);
      return;
    }

    try {
      const amountInKrw = getAmountInKrw(exchangeRate);
      const formData: AddExpenseFormData = {
        name: name.trim(),
        amount: amountInKrw,
        start_date: startDate.trim(),
      };

      if (isEditMode && editingItem && onUpdate) {
        await onUpdate({ ...formData, id: editingItem.id });
      } else {
        await onAdd(formData);
      }
      onClose();
    } catch (error) {
      logError(error, isEditMode ? 'UpdateExpense' : 'AddExpense');
      const appError = formatError(error);
      Alert.alert('오류 발생', appError.userMessage, [
        { text: '확인', style: 'default' as const },
        ...(appError.recoverable
          ? [{ text: '다시 시도', style: 'default' as const, onPress: handleSubmit }]
          : []),
      ]);
    }
  }, [
    name,
    amount,
    startDate,
    amountCurrency,
    isExchangeRateLoading,
    getAmountInKrw,
    exchangeRate,
    isEditMode,
    editingItem,
    onAdd,
    onUpdate,
    onClose,
  ]);

  // 모달 배경 클릭 핸들러
  const handleBackdropPress = useCallback(() => {
    if (!isPending) {
      Keyboard.dismiss();
      onClose();
    }
  }, [isPending, onClose]);

  // 모달 닫기 핸들러
  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  // 유효성 검사 통과 여부
  const isFormValid = useMemo(() => {
    return name.trim() && amount && startDate && Object.keys(validationErrors).length === 0;
  }, [name, amount, startDate, validationErrors]);

  // 날짜 표시 텍스트
  const dateDisplayText = useMemo(() => {
    return startDate || '결제일을 선택하세요';
  }, [startDate]);

  // 태블릿에서는 fade 애니메이션 사용 (흔들림 방지)
  const animationType = device.isTablet ? 'fade' : 'slide';
  
  // 태블릿에서는 KeyboardAvoidingView behavior 조정
  const keyboardBehavior = device.isTablet ? undefined : (Platform.OS === 'ios' ? 'padding' : 'height');

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={keyboardBehavior}
        style={{ flex: 1 }}
        keyboardVerticalOffset={device.isTablet ? 0 : KEYBOARD_AVOIDING_OFFSET}
        enabled={!device.isTablet}
      >
        <Pressable
          className="flex-1"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onPress={handleBackdropPress}
          accessible={false}
        >
          <Pressable
            className={`flex-1 ${device.isTablet ? 'justify-center items-center px-6' : 'justify-end'}`}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              className={`bg-white ${device.isTablet ? 'rounded-3xl max-h-[85%] w-[90%]' : 'rounded-t-3xl'} max-h-[90%] w-full`}
              style={{
                paddingBottom: Math.max(insets.bottom, SPACING.base),
                maxWidth: device.isTablet ? 600 : undefined,
              }}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ padding: responsivePadding, paddingBottom: SPACING.base }}
                bounces={false}
              >
                {/* 헤더 */}
                <View className="flex-row items-center justify-between mb-6">
                  <Typography variant="h2" color="textPrimary" accessibilityRole="header">
                    {isEditMode ? '월 고정비 수정' : '월 고정비 추가'}
                  </Typography>
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={isPending}
                    className="p-1"
                    accessibilityLabel="모달 닫기"
                    accessibilityRole="button"
                    accessibilityHint="입력 내용을 저장하지 않고 모달을 닫습니다"
                    accessibilityState={{ disabled: isPending }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Typography variant="h2" color="textTertiary">
                      ✕
                    </Typography>
                  </TouchableOpacity>
                </View>

                {/* 이름 입력 필드 */}
                <InputField
                  ref={nameInputRef}
                  label="이름"
                  placeholder="예: 월세, 관리비"
                  value={name}
                  onChangeText={handleNameChange}
                  error={validationErrors.name}
                  editable={!isPending}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => amountInputRef.current?.focus()}
                  accessibilityLabel="이름 입력"
                  accessibilityHint="월 고정비 항목의 이름을 입력하세요"
                />

                {/* 통화 선택 + 금액 입력 + 환율 안내 */}
                <AmountInputSection
                  ref={amountInputRef}
                  amountCurrency={amountCurrency}
                  onCurrencyChange={setAmountCurrency}
                  formattedAmount={formattedAmount}
                  onAmountChange={handleAmountChange}
                  error={validationErrors.amount}
                  disabled={isPending}
                  currencySelectorDisabled={isPending}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  amountHintContext="월 고정비 금액"
                  onAfterCurrencyChange={() => amountInputRef.current?.focus()}
                />

                {/* 날짜 선택 필드 */}
                <View className="mb-6">
                  <Typography variant="label" color="textSecondary" className="mb-1">
                    결제일 ({DATE_FORMAT_PLACEHOLDER})
                  </Typography>
                  <TouchableOpacity
                    onPress={openDatePicker}
                    disabled={isPending}
                    activeOpacity={0.7}
                    className={`bg-gray-100 rounded-xl p-4 flex-row items-center justify-between border min-h-[56px] ${
                      validationErrors.startDate ? 'border-red-500' : 'border-transparent'
                    } ${isPending ? 'opacity-50' : ''}`}
                    accessibilityLabel="결제일 선택"
                    accessibilityHint="월 고정비 결제일을 선택하세요"
                    accessibilityRole="button"
                  >
                    <Typography
                      variant="body"
                      color={startDate ? 'textPrimary' : 'textTertiary'}
                      weight={startDate ? 'medium' : 'normal'}
                    >
                      {dateDisplayText}
                    </Typography>
                    <View className="flex-row items-center gap-1">
                      <Typography variant="body" color="textSecondary">
                        📅
                      </Typography>
                      {startDate && (
                        <Typography variant="caption" color="textTertiary" className="ml-1">
                          수정
                        </Typography>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  {validationErrors.startDate && (
                    <Typography variant="caption" color="danger" className="mt-1">
                      {validationErrors.startDate}
                    </Typography>
                  )}

                  {/* Android 날짜 선택기 */}
                  {showDatePicker && Platform.OS === 'android' && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      locale="ko-KR"
                    />
                  )}

                  {/* iOS 날짜 선택기 */}
                  {showDatePicker && Platform.OS === 'ios' && (
                    <View className="mt-4 bg-gray-50 rounded-xl p-4">
                      <View className="flex-row items-center justify-between mb-4">
                        <Typography variant="h3" color="textPrimary">
                          날짜 선택
                        </Typography>
                        <Button
                          variant="primary"
                          size="sm"
                          onPress={closeDatePicker}
                        >
                          확인
                        </Button>
                      </View>
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        maximumDate={new Date()}
                        locale="ko-KR"
                        style={{ height: 200 }}
                      />
                    </View>
                  )}

                </View>
              </ScrollView>

              {/* 제출 버튼 - ScrollView 밖으로 이동하여 항상 보이도록 */}
              <View style={{ padding: responsivePadding, paddingTop: SPACING.base }}>
                <Button
                  variant={isEditMode ? 'secondary' : 'primary'}
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isPending || !isFormValid}
                  loading={isPending}
                  accessibilityLabel={isEditMode ? '수정하기' : '추가하기'}
                  accessibilityHint={isEditMode ? '입력한 내용으로 고정비를 수정합니다' : '입력한 내용으로 고정비를 추가합니다'}
                  accessibilityState={{ disabled: isPending || !isFormValid, busy: isPending }}
                >
                  {isEditMode ? '수정' : '추가'}
                </Button>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};
