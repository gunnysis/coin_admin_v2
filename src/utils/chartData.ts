import { FixedMonthCost } from '../types';
import { TEXT_LIMITS, PIE_CHART_COLORS } from '../constants/chart';

export interface ChartData {
  labels: string[];
  data: number[];
}

export interface CategoryChartData extends ChartData {
  colors: string[];
}

/**
 * 텍스트를 지정된 길이로 자르기
 */
const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * 항목별 집계 데이터 생성 (바 차트용)
 * 각 고정비 항목의 금액을 표시
 */
export const getItemData = (expenses: FixedMonthCost[]): ChartData => {
  if (expenses.length === 0) {
    return { labels: [], data: [] };
  }

  // 금액 기준으로 내림차순 정렬
  const sorted = [...expenses].sort((a, b) => b.amount - a.amount);

  const labels: string[] = [];
  const data: number[] = [];

  sorted.forEach((expense) => {
    labels.push(truncateText(expense.name, TEXT_LIMITS.BAR_CHART_LABEL));
    data.push(expense.amount);
  });

  return { labels, data };
};

/**
 * 항목별 분포 데이터 생성 (파이 차트용)
 * 각 고정비 항목의 비율을 표시
 */
export const getCategoryData = (expenses: FixedMonthCost[]): CategoryChartData => {
  if (expenses.length === 0) {
    return { labels: [], data: [], colors: [] };
  }

  // 금액 기준으로 내림차순 정렬
  const sorted = [...expenses].sort((a, b) => b.amount - a.amount);

  const labels: string[] = [];
  const data: number[] = [];

  sorted.forEach((expense) => {
    labels.push(truncateText(expense.name, TEXT_LIMITS.PIE_CHART_LABEL));
    data.push(expense.amount);
  });

  return {
    labels,
    data,
    colors: [...PIE_CHART_COLORS], // 색상 배열 복사
  };
};
