import React, { useMemo, useEffect, useRef } from 'react';
import { View, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { FixedMonthCost } from '../types';
import { formatCurrency } from '../utils/format';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';
import { COLORS } from '../constants/theme';

interface ExpenseVisualizationProps {
  expenses: FixedMonthCost[];
  totalAmount: number;
}

interface ExpenseGroup {
  label: string;
  items: FixedMonthCost[];
  total: number;
  percentage: number;
  color: string;
}

/**
 * 최신 UI/UX 패턴 기반 고정비 시각화 컴포넌트
 * - Progress Bar 기반 비율 표시
 * - 금액 범위별 그룹화
 * - 인터랙티브 애니메이션
 * - 시각적 계층 구조
 */
export const ExpenseVisualization: React.FC<ExpenseVisualizationProps> = ({
  expenses,
  totalAmount,
}) => {
  // 금액 범위별 그룹화 (최신 패턴: 동적 그룹화)
  const expenseGroups = useMemo<ExpenseGroup[]>(() => {
    if (expenses.length === 0 || totalAmount === 0) {
      return [];
    }

    // 금액 기준 내림차순 정렬
    const sorted = [...expenses].sort((a, b) => b.amount - a.amount);

    // 동적 그룹 생성 (총액의 30%, 50%, 20% 기준)
    const highThreshold = totalAmount * 0.3;
    const mediumThreshold = totalAmount * 0.5;

    const groups: ExpenseGroup[] = [
      {
        label: '고액 항목',
        items: [],
        total: 0,
        percentage: 0,
        color: COLORS.danger,
      },
      {
        label: '중액 항목',
        items: [],
        total: 0,
        percentage: 0,
        color: COLORS.warning,
      },
      {
        label: '저액 항목',
        items: [],
        total: 0,
        percentage: 0,
        color: COLORS.primary,
      },
    ];

    sorted.forEach((expense) => {
      if (expense.amount >= highThreshold) {
        groups[0].items.push(expense);
        groups[0].total += expense.amount;
      } else if (expense.amount >= mediumThreshold) {
        groups[1].items.push(expense);
        groups[1].total += expense.amount;
      } else {
        groups[2].items.push(expense);
        groups[2].total += expense.amount;
      }
    });

    // 비율 계산 및 빈 그룹 제거
    return groups
      .map((group) => ({
        ...group,
        percentage: totalAmount > 0 ? (group.total / totalAmount) * 100 : 0,
      }))
      .filter((group) => group.items.length > 0);
  }, [expenses, totalAmount]);

  // 개별 항목별 비율 계산
  const expenseItemsWithRatio = useMemo(() => {
    if (totalAmount === 0) return [];
    return expenses
      .map((expense) => ({
        ...expense,
        percentage: (expense.amount / totalAmount) * 100,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses, totalAmount]);

  if (expenses.length === 0) {
    return (
      <View className="p-8 items-center justify-center">
        <Typography variant="body" color="textTertiary" align="center">
          표시할 데이터가 없습니다
        </Typography>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
    >
      {/* 그룹별 요약 카드 */}
      {expenseGroups.length > 0 && (
        <View className="mb-6">
          <Typography variant="h3" color="textPrimary" className="mb-4 mx-1">
            금액별 그룹
          </Typography>
          {expenseGroups.map((group, index) => (
            <GroupCard key={index} group={group} totalAmount={totalAmount} />
          ))}
        </View>
      )}

      {/* 개별 항목 상세 보기 */}
      <View className="mb-6">
        <Typography variant="h3" color="textPrimary" className="mb-4 mx-1">
          항목별 상세
        </Typography>
        {expenseItemsWithRatio.map((item) => (
          <ExpenseProgressCard
            key={item.id}
            expense={item}
            totalAmount={totalAmount}
          />
        ))}
      </View>
    </ScrollView>
  );
};

/**
 * 그룹 카드 컴포넌트 (애니메이션 포함)
 */
const GroupCard: React.FC<{ group: ExpenseGroup; totalAmount: number }> = ({
  group,
  totalAmount,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: group.percentage / 100,
      useNativeDriver: false,
      tension: 50,
      friction: 7,
    }).start();
  }, [group.percentage]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      className="mb-4"
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Card variant="elevated" padding="md" className="border border-gray-200">
          <View className="mb-4">
            <View
              className="w-1 h-6 rounded mb-1"
              style={{ backgroundColor: group.color }}
            />
            <Typography variant="h3" color="textPrimary" weight="semibold">
              {group.label}
            </Typography>
            <View className="flex-row justify-between items-center mt-1">
              <Typography variant="body" color="textSecondary">
                {group.items.length}개 항목
              </Typography>
              <Typography variant="h3" color="primary" weight="bold">
                {formatCurrency(group.total)}
              </Typography>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mt-2">
            <View className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-sm">
              <Animated.View
                className="h-full rounded-full"
                style={{
                  width: progressWidth,
                  backgroundColor: group.color,
                }}
              />
            </View>
            <Typography variant="caption" color="textTertiary" className="mt-1 text-right">
              {group.percentage.toFixed(1)}%
            </Typography>
          </View>
        </Card>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * 개별 항목 Progress Card (최신 패턴: 인터랙티브 프로그레스 바)
 */
const ExpenseProgressCard: React.FC<{
  expense: FixedMonthCost & { percentage: number };
  totalAmount: number;
}> = ({ expense, totalAmount }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: expense.percentage / 100,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [expense.percentage]);

  // 금액 크기에 따른 색상 결정
  const getColorByAmount = (amount: number, total: number) => {
    const ratio = amount / total;
    if (ratio >= 0.3) return COLORS.danger;
    if (ratio >= 0.15) return COLORS.warning;
    return COLORS.primary;
  };

  const progressColor = getColorByAmount(expense.amount, totalAmount);
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      className="mb-4"
      style={{ opacity: opacityAnim }}
    >
      <Card variant="elevated" padding="md" className="border border-gray-200">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-2">
            <Typography variant="h3" color="textPrimary" weight="semibold" numberOfLines={1}>
              {expense.name}
            </Typography>
            <Typography variant="h2" color="primary" weight="bold">
              {formatCurrency(expense.amount)}
            </Typography>
          </View>
          <View
            className="px-3 py-1 rounded-md min-w-[50px] items-center"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Typography variant="caption" color="textInverse" weight="semibold">
              {expense.percentage.toFixed(1)}%
            </Typography>
          </View>
        </View>

        {/* Progress Bar */}
        <View className="mt-2">
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-sm">
            <Animated.View
              className="h-full rounded-full"
              style={{
                width: progressWidth,
                backgroundColor: progressColor,
              }}
            />
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

