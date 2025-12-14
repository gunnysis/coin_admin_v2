export interface FixedMonthCost {
  id: number;
  created_at: string;
  amount: number;
  name: string;
  start_date: string;
}

export interface AddExpenseFormData {
  name: string;
  amount: number;
  start_date: string;
}

export interface InfiniteQueryPage {
  data: FixedMonthCost[];
  nextOffset: number;
  hasMore: boolean;
}

export interface InfiniteQueryData {
  pages: InfiniteQueryPage[];
  pageParams: number[];
}
