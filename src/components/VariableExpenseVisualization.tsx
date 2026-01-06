import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { VariableMonthExpense } from '../types';
import { SPACING, COLORS } from '../constants/theme';
import { ExpenseGroup } from '../types/variableExpenses';
import { ExpenseGroupCard } from './variable-expenses/ExpenseGroupCard';
import { DateGroupCard } from './variable-expenses/DateGroupCard';
import { ExpenseItemProgress } from './variable-expenses/ExpenseItemProgress';
import { Typography } from './ui/Typography';

interface VariableExpenseVisualizationProps {
  expenses: VariableMonthExpense[];
  totalAmount: number;
}

/**
 * 유동비 시각화 컴포넌트
 * 
 * 지출 데이터를 다양한 방식으로 시각화하여 제공합니다:
 * - 날짜별 그룹화: 날짜별 지출 내역 및 총액 표시
 * - 금액 범위별 분류: 고액/중액/저액 항목으로 분류
 * - 주요 지출 항목: 상위 10개 항목의 비율 표시
 */
export const VariableExpenseVisualization = React.memo<VariableExpenseVisualizationProps>(({
  expenses,
  totalAmount,
}) => {
  // 날짜별 그룹화
  const expensesByDate = useMemo(() => {
    const grouped = new Map<string, VariableMonthExpense[]>();
    
    expenses.forEach((expense) => {
      const date = expense.spent_date;
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date)!.push(expense);
    });

    return Array.from(grouped.entries())
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => b.amount - a.amount),
        total: items.reduce((sum, item) => sum + item.amount, 0),
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  // 금액 범위별 그룹화
  const expenseGroups = useMemo<ExpenseGroup[]>(() => {
    if (expenses.length === 0 || totalAmount === 0) {
      return [];
    }

    const sorted = [...expenses].sort((a, b) => b.amount - a.amount);
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
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10); // 상위 10개만 표시
  }, [expenses, totalAmount]);

  return (
    <ScrollView 
      className="flex-1"
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: SPACING.lg }}
    >
      {/* 금액 범위별 그룹 */}
      {expenseGroups.length > 0 && (
        <View className="mb-4">
          <Typography variant="h4" color="textPrimary" weight="semibold" className="mb-3">
            금액별 분류
          </Typography>
          {expenseGroups.map((group, index) => (
            <ExpenseGroupCard key={group.label} group={group} index={index} />
          ))}
        </View>
      )}

      {/* 날짜별 그룹 */}
      {expensesByDate.length > 0 && (
        <View className="mb-4">
          <Typography variant="h4" color="textPrimary" weight="semibold" className="mb-3">
            날짜별 지출
          </Typography>
          {expensesByDate.slice(0, 7).map(({ date, items, total }) => (
            <DateGroupCard key={date} date={date} items={items} total={total} />
          ))}
        </View>
      )}

      {/* 상위 항목 */}
      {expenseItemsWithRatio.length > 0 && (
        <View>
          <Typography variant="h4" color="textPrimary" weight="semibold" className="mb-3">
            주요 지출 항목
          </Typography>
          {expenseItemsWithRatio.map((item, index) => (
            <ExpenseItemProgress key={item.id} item={item} index={index} />
          ))}
        </View>
      )}

      {expenses.length === 0 && (
        <View className="items-center justify-center py-8">
          <Typography variant="body" color="textTertiary">
            표시할 데이터가 없습니다
          </Typography>
        </View>
      )}
    </ScrollView>
  );
});

