import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AddExpenseFormData, FixedMonthCost } from '../types';
import { validateExpenseForm } from '../utils/validation';
import { DATE_FORMAT_PLACEHOLDER } from '../constants';
import { formatDateToString, getTodayDateString } from '../utils/date';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (data: AddExpenseFormData) => Promise<void>;
  onUpdate?: (data: AddExpenseFormData & { id: number }) => Promise<void>;
  editingItem?: FixedMonthCost | null;
  isPending?: boolean;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  onAdd,
  onUpdate,
  editingItem,
  isPending = false,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isEditMode = !!editingItem;

  useEffect(() => {
    if (!visible) {
      // 모달이 닫힐 때 폼 초기화
      setName('');
      setAmount('');
      setStartDate('');
      setSelectedDate(new Date());
      setShowDatePicker(false);
    } else if (editingItem) {
      // 수정 모드: 기존 데이터로 폼 채우기
      setName(editingItem.name);
      setAmount(editingItem.amount.toString());
      setStartDate(editingItem.start_date);
      const date = new Date(editingItem.start_date);
      setSelectedDate(date);
    } else {
      // 추가 모드: 오늘 날짜를 기본값으로 설정
      const today = new Date();
      setSelectedDate(today);
      setStartDate(getTodayDateString());
    }
  }, [visible, editingItem]);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'dismissed') {
        return;
      }
    }
    
    if (date) {
      setSelectedDate(date);
      setStartDate(formatDateToString(date));
    }
    
    if (Platform.OS === 'ios') {
      // iOS에서는 사용자가 확인 버튼을 눌러야 닫힘
    }
  };

  const openDatePicker = () => {
    if (!isPending) {
      setShowDatePicker(true);
    }
  };

  const closeDatePicker = () => {
    setShowDatePicker(false);
    // 선택된 날짜를 최종적으로 반영
    if (selectedDate) {
      setStartDate(formatDateToString(selectedDate));
    }
  };

  const handleSubmit = async () => {
    const validation = validateExpenseForm(name, amount, startDate);
    
    if (!validation.isValid) {
      Alert.alert('오류', validation.errorMessage);
      return;
    }

    try {
      const formData = {
        name: name.trim(),
        amount: Number(amount),
        start_date: startDate.trim(),
      };

      if (isEditMode && editingItem && onUpdate) {
        await onUpdate({
          ...formData,
          id: editingItem.id,
        });
        Alert.alert('성공', '데이터가 수정되었습니다.');
      } else {
        await onAdd(formData);
        Alert.alert('성공', '데이터가 추가되었습니다.');
      }
      onClose();
    } catch (error) {
      Alert.alert(
        '오류',
        isEditMode ? '데이터 수정에 실패했습니다.' : '데이터 추가에 실패했습니다.'
      );
      console.error(isEditMode ? 'Update expense error:' : 'Add expense error:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6 pb-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-800">
              {isEditMode ? '항목 수정' : '새 항목 추가'}
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isPending}>
              <Text className="text-gray-400 text-2xl">✕</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-700 mb-2">이름</Text>
            <TextInput
              className="bg-gray-100 rounded-lg p-4 text-base text-gray-800"
              placeholder="예: 월세, 관리비"
              value={name}
              onChangeText={setName}
              autoFocus
              editable={!isPending}
            />
          </View>

          <View className="mb-4">
            <Text className="text-base font-semibold text-gray-700 mb-2">금액 (원)</Text>
            <TextInput
              className="bg-gray-100 rounded-lg p-4 text-base text-gray-800"
              placeholder="예: 500000"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              editable={!isPending}
            />
          </View>

          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-700 mb-2">
              시작일 ({DATE_FORMAT_PLACEHOLDER})
            </Text>
            <TouchableOpacity
              onPress={openDatePicker}
              disabled={isPending}
              activeOpacity={0.7}
              className={`bg-gray-100 rounded-lg p-4 flex-row items-center justify-between ${
                isPending ? 'opacity-50' : ''
              }`}
            >
              <Text
                className={`text-base font-medium ${
                  startDate ? 'text-gray-800' : 'text-gray-400'
                }`}
              >
                {startDate || '날짜를 선택하세요'}
              </Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 text-lg mr-2">📅</Text>
                {startDate && (
                  <Text className="text-gray-400 text-sm">수정</Text>
                )}
              </View>
            </TouchableOpacity>
            
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

            {showDatePicker && Platform.OS === 'ios' && (
              <View className="mt-4 bg-gray-50 rounded-lg p-4">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-base font-semibold text-gray-800">
                    날짜 선택
                  </Text>
                  <TouchableOpacity
                    onPress={closeDatePicker}
                    className="bg-blue-500 px-4 py-2 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-sm">확인</Text>
                  </TouchableOpacity>
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

          <TouchableOpacity
            onPress={handleSubmit}
            className={`rounded-lg p-4 items-center ${
              isEditMode ? 'bg-yellow-500' : 'bg-blue-500'
            } ${isPending ? 'opacity-50' : ''}`}
            disabled={isPending}
            activeOpacity={0.8}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {isEditMode ? '수정' : '추가'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
