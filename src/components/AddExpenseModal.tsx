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
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AddExpenseFormData, FixedMonthCost } from '../types';
import { validateExpenseForm } from '../utils/validation';
import { DATE_FORMAT_PLACEHOLDER } from '../constants';
import { formatDateToString, getTodayDateString } from '../utils/date';
import { Typography } from './ui/Typography';
import { InputField } from './ui/InputField';
import { Button } from './ui/Button';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

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
const MAX_MODAL_HEIGHT = '90%';

// 금액 포맷팅 유틸리티
const formatAmount = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/[^0-9]/g, '');
  if (!numbers) return '';
  
  // 천 단위 구분자 추가
  return Number(numbers).toLocaleString('ko-KR');
};

// 포맷된 금액을 숫자로 변환
const parseAmount = (formattedValue: string): string => {
  return formattedValue.replace(/[^0-9]/g, '');
};

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
  const nameInputRef = useRef<TextInput>(null);
  const amountInputRef = useRef<TextInput>(null);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    amount?: string;
    startDate?: string;
  }>({});

  const isEditMode = useMemo(() => !!editingItem, [editingItem]);

  // 폼 초기화
  useEffect(() => {
    if (!visible) {
      // 모달이 닫힐 때 폼 초기화
      setName('');
      setAmount('');
      setFormattedAmount('');
      setStartDate('');
      setSelectedDate(new Date());
      setShowDatePicker(false);
      setValidationErrors({});
      Keyboard.dismiss();
    } else if (editingItem) {
      // 수정 모드: 기존 데이터로 폼 채우기
      setName(editingItem.name);
      const amountStr = editingItem.amount.toString();
      setAmount(amountStr);
      setFormattedAmount(formatAmount(amountStr));
      setStartDate(editingItem.start_date);
      const date = new Date(editingItem.start_date);
      setSelectedDate(date);
      setValidationErrors({});
    } else {
      // 추가 모드: 오늘 날짜를 기본값으로 설정
      const today = new Date();
      setSelectedDate(today);
      const todayStr = getTodayDateString();
      setStartDate(todayStr);
      setValidationErrors({});
      
      // 모달이 열릴 때 이름 입력 필드에 포커스 (약간의 지연 후)
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, MODAL_ANIMATION_DURATION);
    }
  }, [visible, editingItem]);

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

  // 금액 변경 핸들러
  const handleAmountChange = useCallback((text: string) => {
    const numbers = parseAmount(text);
    setAmount(numbers);
    const formatted = formatAmount(numbers);
    setFormattedAmount(formatted);
    validateField('amount', formatted);
  }, [validateField]);

  // 제출 핸들러
  const handleSubmit = useCallback(async () => {
    // 최종 유효성 검사
    const validation = validateExpenseForm(name, amount, startDate);
    
    if (!validation.isValid) {
      Alert.alert(
        '입력 오류',
        validation.errorMessage || '입력 정보를 확인해주세요.',
        [{ text: '확인', style: 'default' }]
      );
      return;
    }

    try {
      const formData: AddExpenseFormData = {
        name: name.trim(),
        amount: Number(amount),
        start_date: startDate.trim(),
      };

      if (isEditMode && editingItem && onUpdate) {
        await onUpdate({
          ...formData,
          id: editingItem.id,
        });
      } else {
        await onAdd(formData);
      }
      
      // 성공 시 모달 닫기 (Alert는 상위 컴포넌트에서 처리)
      onClose();
    } catch (error) {
      Alert.alert(
        '오류 발생',
        isEditMode 
          ? '월 고정비 수정에 실패했습니다.\n다시 시도해주세요.' 
          : '월 고정비 추가에 실패했습니다.\n다시 시도해주세요.',
        [{ text: '확인', style: 'default' }]
      );
      console.error(isEditMode ? 'Update expense error:' : 'Add expense error:', error);
    }
  }, [name, amount, startDate, isEditMode, editingItem, onAdd, onUpdate, onClose]);

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

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={KEYBOARD_AVOIDING_OFFSET}
      >
        <Pressable
          style={styles.backdrop}
          onPress={handleBackdropPress}
          accessible={false}
        >
          <Pressable
            style={styles.modalContentWrapper}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={[
                styles.modalContent,
                {
                  paddingBottom: Math.max(insets.bottom, SPACING.base),
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
                bounces={false}
              >
                {/* 헤더 */}
                <View style={styles.header}>
                  <Typography variant="h2" color="textPrimary" accessibilityRole="header">
                    {isEditMode ? '월 고정비 수정' : '월 고정비 추가'}
                  </Typography>
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={isPending}
                    style={styles.closeButton}
                    accessibilityLabel="닫기"
                    accessibilityRole="button"
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

                {/* 금액 입력 필드 */}
                <InputField
                  ref={amountInputRef}
                  label="금액 (원)"
                  placeholder="예: 500,000"
                  value={formattedAmount}
                  onChangeText={handleAmountChange}
                  error={validationErrors.amount}
                  helperText="천 단위 구분자가 자동으로 추가됩니다"
                  keyboardType="numeric"
                  editable={!isPending}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  accessibilityLabel="금액 입력"
                  accessibilityHint="월 고정비 금액을 숫자로 입력하세요"
                />

                {/* 날짜 선택 필드 */}
                <View style={styles.dateFieldContainer}>
                  <Typography variant="label" color="textSecondary" style={styles.dateLabel}>
                    결제일 ({DATE_FORMAT_PLACEHOLDER})
                  </Typography>
                  <TouchableOpacity
                    onPress={openDatePicker}
                    disabled={isPending}
                    activeOpacity={0.7}
                    style={[
                      styles.datePickerButton,
                      validationErrors.startDate && styles.datePickerButtonError,
                      isPending && styles.datePickerButtonDisabled,
                    ]}
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
                    <View style={styles.datePickerIcon}>
                      <Typography variant="body" color="textSecondary">
                        📅
                      </Typography>
                      {startDate && (
                        <Typography variant="caption" color="textTertiary" style={styles.dateModifyText}>
                          수정
                        </Typography>
                      )}
                    </View>
                  </TouchableOpacity>
                  
                  {validationErrors.startDate && (
                    <Typography variant="caption" color="danger" style={styles.dateErrorText}>
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
                    <View style={styles.iosDatePickerContainer}>
                      <View style={styles.datePickerHeader}>
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

                {/* 제출 버튼 */}
                <Button
                  variant={isEditMode ? 'secondary' : 'primary'}
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isPending || !isFormValid}
                  loading={isPending}
                  style={styles.submitButton}
                  accessibilityLabel={isEditMode ? '수정하기' : '추가하기'}
                  accessibilityState={{ disabled: isPending || !isFormValid }}
                >
                  {isEditMode ? '수정' : '추가'}
                </Button>
              </ScrollView>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContentWrapper: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: MAX_MODAL_HEIGHT,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  dateFieldContainer: {
    marginBottom: SPACING.xl,
  },
  dateLabel: {
    marginBottom: SPACING.xs,
  },
  datePickerButton: {
    backgroundColor: COLORS.gray100,
    borderRadius: RADIUS.base,
    padding: SPACING.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 56,
  },
  datePickerButtonError: {
    borderColor: COLORS.danger,
  },
  datePickerButtonDisabled: {
    opacity: 0.5,
  },
  datePickerIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dateModifyText: {
    marginLeft: SPACING.xs,
  },
  dateErrorText: {
    marginTop: SPACING.xs,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.base,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.base,
  },
  submitButton: {
    marginTop: SPACING.sm,
  },
  iosDatePickerContainer: {
    marginTop: SPACING.base,
    backgroundColor: COLORS.gray50,
    borderRadius: RADIUS.base,
    padding: SPACING.base,
  },
});
