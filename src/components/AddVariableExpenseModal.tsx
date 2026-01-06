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
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AddVariableExpenseFormData, VariableMonthExpense } from '../types';
import { validateExpenseForm } from '../utils/validation';
import { DATE_FORMAT_PLACEHOLDER } from '../constants';
import { formatDateToString, getTodayDateString } from '../utils/date';
import { formatAmount, parseAmount } from '../utils/amount';
import { formatError, logError } from '../utils/errorHandler';
import { Typography } from './ui/Typography';
import { InputField } from './ui/InputField';
import { Button } from './ui/Button';
import { SPACING } from '../constants/theme';
import { useDeviceDimensions } from '../hooks/useDeviceDimensions';
import { getResponsivePadding } from '../utils/responsive';

interface AddVariableExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: AddVariableExpenseFormData) => Promise<void>;
  onUpdate?: (data: AddVariableExpenseFormData & { id: number }) => Promise<void>;
  editingItem?: VariableMonthExpense | null;
  isPending?: boolean;
}

// 상수 정의
const MODAL_ANIMATION_DURATION = 300;
const KEYBOARD_AVOIDING_OFFSET = Platform.OS === 'ios' ? 0 : 20;

/**
 * AddVariableExpenseModal 컴포넌트
 * 
 * 월 유동비 항목을 추가/수정하는 모달 컴포넌트
 * - 메모 입력 기능
 * - 최신 UX/UI 패턴 적용
 */
export const AddVariableExpenseModal: React.FC<AddVariableExpenseModalProps> = ({
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
  const memoInputRef = useRef<TextInput>(null);
  
  const responsivePadding = getResponsivePadding(device, SPACING.xl);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [formattedAmount, setFormattedAmount] = useState('');
  const [spentDate, setSpentDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [memo, setMemo] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    amount?: string;
    spentDate?: string;
  }>({});

  const isEditMode = useMemo(() => !!editingItem, [editingItem]);

  // #region agent log
  useEffect(() => {
    if (visible) {
      fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVariableExpenseModal.tsx:87',message:'Modal opened',data:{visible,isEditMode,editingItem:editingItem?{id:editingItem.id,name:editingItem.name}:null,hasOnUpdate:!!onUpdate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
  }, [visible, isEditMode, editingItem, onUpdate]);
  // #endregion

  // 폼 초기화
  useEffect(() => {
    if (!visible) {
      setName('');
      setAmount('');
      setFormattedAmount('');
      setSpentDate('');
      setSelectedDate(new Date());
      setShowDatePicker(false);
      setMemo('');
      setValidationErrors({});
      Keyboard.dismiss();
    } else if (editingItem) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVariableExpenseModal.tsx:103',message:'Initializing form with editingItem',data:{editingItemId:editingItem.id,editingItemName:editingItem.name,editingItemAmount:editingItem.amount},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      setName(editingItem.name);
      const amountStr = editingItem.amount.toString();
      setAmount(amountStr);
      setFormattedAmount(formatAmount(amountStr));
      setSpentDate(editingItem.spent_date);
      const date = new Date(editingItem.spent_date);
      setSelectedDate(date);
      setMemo(editingItem.memo || '');
      setValidationErrors({});
    } else {
      const today = new Date();
      setSelectedDate(today);
      const todayStr = getTodayDateString();
      setSpentDate(todayStr);
      setValidationErrors({});
      
      const focusDelay = device.isTablet ? MODAL_ANIMATION_DURATION + 100 : MODAL_ANIMATION_DURATION;
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, focusDelay);
    }
  }, [visible, editingItem, device.isTablet]);

  // 실시간 유효성 검사
  const validateField = useCallback((field: 'name' | 'amount' | 'spentDate', value: string) => {
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
      case 'spentDate':
        if (!value.trim()) {
          errors.spentDate = '지출일을 선택해주세요.';
        } else {
          delete errors.spentDate;
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
      setSpentDate(formattedDate);
      validateField('spentDate', formattedDate);
    }
  }, [validateField]);

  const openDatePicker = useCallback(() => {
    if (!isPending) {
      Keyboard.dismiss();
      setShowDatePicker(true);
    }
  }, [isPending]);

  const closeDatePicker = useCallback(() => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = formatDateToString(selectedDate);
      setSpentDate(formattedDate);
      validateField('spentDate', formattedDate);
    }
  }, [selectedDate, validateField]);

  const handleNameChange = useCallback((text: string) => {
    setName(text);
    validateField('name', text);
  }, [validateField]);

  const handleAmountChange = useCallback((text: string) => {
    const numbers = parseAmount(text);
    setAmount(numbers);
    const formatted = formatAmount(numbers);
    setFormattedAmount(formatted);
    validateField('amount', formatted);
  }, [validateField]);

  // 제출 핸들러
  const handleSubmit = useCallback(async () => {
    const validation = validateExpenseForm(name, amount, spentDate);
    
    if (!validation.isValid) {
      Alert.alert(
        '입력 오류',
        validation.errorMessage || '입력 정보를 확인해주세요.',
        [{ text: '확인', style: 'default' }]
      );
      return;
    }

    try {
      const formData: AddVariableExpenseFormData = {
        name: name.trim(),
        amount: Number(amount),
        spent_date: spentDate.trim(),
        memo: memo.trim() || undefined,
      };

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVariableExpenseModal.tsx:223',message:'handleSubmit called',data:{isEditMode,hasEditingItem:!!editingItem,hasOnUpdate:!!onUpdate,formData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      if (isEditMode && editingItem && onUpdate) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVariableExpenseModal.tsx:226',message:'Calling onUpdate',data:{editingItemId:editingItem.id,formData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        await onUpdate({
          ...formData,
          id: editingItem.id,
        });
      } else {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AddVariableExpenseModal.tsx:232',message:'Calling onAdd instead',data:{reason:!isEditMode?'not edit mode':!editingItem?'no editingItem':!onUpdate?'no onUpdate':'unknown',formData},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        await onAdd(formData);
      }
      
      onClose();
    } catch (error) {
      logError(error, isEditMode ? 'UpdateVariableExpense' : 'AddVariableExpense');
      const appError = formatError(error);
      
      Alert.alert(
        '오류 발생',
        appError.userMessage,
        [
          { text: '확인', style: 'default' as const },
          ...(appError.recoverable ? [{ text: '다시 시도', style: 'default' as const, onPress: handleSubmit }] : []),
        ]
      );
    }
  }, [name, amount, spentDate, memo, isEditMode, editingItem, onAdd, onUpdate, onClose]);

  const handleBackdropPress = useCallback(() => {
    if (!isPending) {
      Keyboard.dismiss();
      onClose();
    }
  }, [isPending, onClose]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const isFormValid = useMemo(() => {
    return name.trim() && amount && spentDate && Object.keys(validationErrors).length === 0;
  }, [name, amount, spentDate, validationErrors]);

  const dateDisplayText = useMemo(() => {
    return spentDate || '지출일을 선택하세요';
  }, [spentDate]);

  const animationType = device.isTablet ? 'fade' : 'slide';
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
                    {isEditMode ? '유동비 수정' : '유동비 추가'}
                  </Typography>
                  <TouchableOpacity
                    onPress={handleClose}
                    disabled={isPending}
                    className="p-1"
                    accessibilityLabel="모달 닫기"
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
                  label="항목명"
                  placeholder="예: 점심 식사, 지하철 요금"
                  value={name}
                  onChangeText={handleNameChange}
                  error={validationErrors.name}
                  editable={!isPending}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => amountInputRef.current?.focus()}
                />

                {/* 금액 입력 필드 */}
                <InputField
                  ref={amountInputRef}
                  label="금액 (원)"
                  placeholder="예: 15,000"
                  value={formattedAmount}
                  onChangeText={handleAmountChange}
                  error={validationErrors.amount}
                  helperText="천 단위 구분자가 자동으로 추가됩니다"
                  keyboardType="numeric"
                  editable={!isPending}
                  returnKeyType="next"
                  onSubmitEditing={() => memoInputRef.current?.focus()}
                />

                {/* 지출일 선택 필드 */}
                <View className="mb-4">
                  <Typography variant="label" color="textSecondary" className="mb-1">
                    지출일 ({DATE_FORMAT_PLACEHOLDER})
                  </Typography>
                  <TouchableOpacity
                    onPress={openDatePicker}
                    disabled={isPending}
                    activeOpacity={0.7}
                    className={`bg-gray-100 rounded-xl p-4 flex-row items-center justify-between border min-h-[56px] ${
                      validationErrors.spentDate ? 'border-red-500' : 'border-transparent'
                    } ${isPending ? 'opacity-50' : ''}`}
                    accessibilityLabel="지출일 선택"
                    accessibilityRole="button"
                  >
                    <Typography
                      variant="body"
                      color={spentDate ? 'textPrimary' : 'textTertiary'}
                      weight={spentDate ? 'medium' : 'normal'}
                    >
                      {dateDisplayText}
                    </Typography>
                    <Typography variant="body" color="textSecondary">
                      📅
                    </Typography>
                  </TouchableOpacity>
                  
                  {validationErrors.spentDate && (
                    <Typography variant="caption" color="danger" className="mt-1">
                      {validationErrors.spentDate}
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

                {/* 메모 입력 필드 */}
                <InputField
                  ref={memoInputRef}
                  label="메모 (선택)"
                  placeholder="추가 정보를 입력하세요"
                  value={memo}
                  onChangeText={setMemo}
                  editable={!isPending}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </ScrollView>

              {/* 제출 버튼 */}
              <View style={{ padding: responsivePadding, paddingTop: SPACING.base }}>
                <Button
                  variant={isEditMode ? 'secondary' : 'primary'}
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isPending || !isFormValid}
                  loading={isPending}
                  accessibilityLabel={isEditMode ? '수정하기' : '추가하기'}
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

