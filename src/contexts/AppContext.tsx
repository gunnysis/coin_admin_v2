import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { TabType } from '../components/TabNavigation';
import { FixedMonthCost, VariableMonthExpense } from '../types';

/**
 * 앱 전역 상태 관리 Context
 * 모달 상태, 탭 상태 등을 중앙에서 관리
 */
interface AppState {
  activeTab: TabType;
  isExpanded: boolean; // 고정비 차트 확장 상태
  isVariableExpanded: boolean; // 유동비 차트 확장 상태
  // 고정비 모달 상태
  isFixedModalVisible: boolean;
  editingFixedItem: FixedMonthCost | null;
  // 유동비 모달 상태
  isVariableModalVisible: boolean;
  editingVariableItem: VariableMonthExpense | null;
  // 새로고침 상태
  isFixedRefreshing: boolean;
  isVariableRefreshing: boolean;
}

interface AppContextValue extends AppState {
  // 탭 관리
  setActiveTab: (tab: TabType) => void;
  // 확장 상태
  toggleExpand: () => void; // 고정비 차트
  toggleVariableExpanded: () => void; // 유동비 차트
  // 고정비 모달 관리
  openFixedModal: (item?: FixedMonthCost | null) => void;
  closeFixedModal: () => void;
  // 유동비 모달 관리
  openVariableModal: (item?: VariableMonthExpense | null) => void;
  closeVariableModal: () => void;
  // 새로고침 상태 관리
  setFixedRefreshing: (refreshing: boolean) => void;
  setVariableRefreshing: (refreshing: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = React.memo<AppProviderProps>(({ children }) => {
  const [activeTab, setActiveTab] = useState<TabType>('fixed');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVariableExpanded, setIsVariableExpanded] = useState(false);
  const [isFixedModalVisible, setIsFixedModalVisible] = useState(false);
  const [editingFixedItem, setEditingFixedItem] = useState<FixedMonthCost | null>(null);
  const [isVariableModalVisible, setIsVariableModalVisible] = useState(false);
  const [editingVariableItem, setEditingVariableItem] = useState<VariableMonthExpense | null>(null);
  const [isFixedRefreshing, setFixedRefreshing] = useState(false);
  const [isVariableRefreshing, setVariableRefreshing] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const toggleVariableExpanded = useCallback(() => {
    setIsVariableExpanded(prev => !prev);
  }, []);

  const openFixedModal = useCallback((item?: FixedMonthCost | null) => {
    setEditingFixedItem(item ?? null);
    setIsFixedModalVisible(true);
  }, []);

  const closeFixedModal = useCallback(() => {
    setIsFixedModalVisible(false);
    setEditingFixedItem(null);
  }, []);

  const openVariableModal = useCallback((item?: VariableMonthExpense | null) => {
    setEditingVariableItem(item ?? null);
    setIsVariableModalVisible(true);
  }, []);

  const closeVariableModal = useCallback(() => {
    setIsVariableModalVisible(false);
    setEditingVariableItem(null);
  }, []);

  const value: AppContextValue = {
    activeTab,
    isExpanded,
    isVariableExpanded,
    isFixedModalVisible,
    editingFixedItem,
    isVariableModalVisible,
    editingVariableItem,
    isFixedRefreshing,
    isVariableRefreshing,
    setActiveTab,
    toggleExpand,
    toggleVariableExpanded,
    openFixedModal,
    closeFixedModal,
    openVariableModal,
    closeVariableModal,
    setFixedRefreshing,
    setVariableRefreshing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
});

/**
 * AppContext를 사용하는 커스텀 훅
 */
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

