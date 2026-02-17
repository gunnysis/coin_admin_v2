import type { FixedMonthCost, VariableMonthExpense } from '../../types/expenses';

export interface BackupMeta {
  schemaVersion: number;
  appVersion: string;
  createdAt: string;
  platform: 'android' | 'ios' | 'web';
}

export interface BackupDatabaseSection {
  fixedExpenses: FixedMonthCost[];
  variableExpenses: VariableMonthExpense[];
}

export interface BackupSettingsSection {
  defaultCurrency: 'KRW' | 'USD';
}

export interface BackupSnapshot {
  meta: BackupMeta;
  database: BackupDatabaseSection;
  settings: BackupSettingsSection;
}
