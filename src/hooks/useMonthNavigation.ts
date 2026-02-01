import { useCallback, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import {
  getCurrentMonth,
  getPreviousMonth,
  getNextMonth,
  compareMonths,
} from '../utils/date';
import { useHaptics } from './useHaptics';

/**
 * 월 네비게이션 커스텀 훅
 * 
 * 월 선택, 이전/다음 달 이동 등의 네비게이션 로직을 제공합니다.
 * 햅틱 피드백과 함께 부드러운 사용자 경험을 제공합니다.
 */
export const useMonthNavigation = () => {
  const { selectedVariableMonth, setSelectedVariableMonth } = useAppContext();
  const { triggerHaptic } = useHaptics();
  const currentMonth = useMemo(() => getCurrentMonth(), []);

  // 이전 달로 이동
  const goToPreviousMonth = useCallback(() => {
    const prevMonth = getPreviousMonth(selectedVariableMonth);
    setSelectedVariableMonth(prevMonth);
    triggerHaptic('light');
  }, [selectedVariableMonth, setSelectedVariableMonth, triggerHaptic]);

  // 다음 달로 이동
  const goToNextMonth = useCallback(() => {
    const nextMonth = getNextMonth(selectedVariableMonth);
    setSelectedVariableMonth(nextMonth);
    triggerHaptic('light');
  }, [selectedVariableMonth, setSelectedVariableMonth, triggerHaptic]);

  // 현재 달로 이동
  const goToCurrentMonth = useCallback(() => {
    setSelectedVariableMonth(currentMonth);
    triggerHaptic('success');
  }, [currentMonth, setSelectedVariableMonth, triggerHaptic]);

  // 네비게이션 가능 여부
  const canGoPrevious = useMemo(() => {
    // 항상 이전 달로 이동 가능 (데이터가 없으면 빈 목록 표시)
    // 필요시 특정 날짜 이전으로 제한할 수 있음
    // 예: 앱 시작일 이전으로는 이동 불가 등
    return true;
  }, []);

  const canGoNext = useMemo(() => {
    // 미래 달로의 이동은 제한하지 않음
    // 필요시 현재 달 이후 N개월까지만 제한할 수 있음
    // 예: compareMonths(selectedVariableMonth, getNextMonth(currentMonth)) <= 0
    return true;
  }, []);

  const isCurrentMonth = useMemo(() => {
    return selectedVariableMonth === currentMonth;
  }, [selectedVariableMonth, currentMonth]);

  return {
    selectedMonth: selectedVariableMonth,
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToCurrentMonth,
    canGoPrevious,
    canGoNext,
    isCurrentMonth,
  };
};
