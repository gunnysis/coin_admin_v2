/**
 * 백업/복구 서비스: 스냅샷 생성, 어댑터를 통한 저장/로드, schemaVersion 검증, DB 트랜잭션 복구.
 */
import { Platform } from 'react-native';
import { getDatabase } from '../../database/db';
import type { FixedMonthCost, VariableMonthExpense } from '../../types/expenses';
import { logger } from '../logger';
import { BACKUP_SCHEMA_VERSION, getBackupAppVersion } from './constants';
import type { BackupLocation, IBackupStorageAdapter } from './storageAdapter';
import type { BackupSnapshot } from './types';

export const createCurrentSnapshot = async (): Promise<BackupSnapshot> => {
  const db = await getDatabase();

  const fixedExpenses = (await db.getAllAsync(
    'SELECT * FROM fixed_month_costs ORDER BY id',
  )) as FixedMonthCost[];

  const variableExpenses = (await db.getAllAsync(
    'SELECT * FROM variable_month_expenses ORDER BY id',
  )) as VariableMonthExpense[];

  const platform = Platform.OS as 'android' | 'ios' | 'web';

  return {
    meta: {
      schemaVersion: BACKUP_SCHEMA_VERSION,
      appVersion: getBackupAppVersion(),
      createdAt: new Date().toISOString(),
      platform,
    },
    database: {
      fixedExpenses,
      variableExpenses,
    },
    settings: {
      defaultCurrency: 'KRW',
    },
  };
};

export const exportBackup = async (
  adapter: IBackupStorageAdapter,
): Promise<BackupLocation> => {
  const snapshot = await createCurrentSnapshot();
  const location = await adapter.save(snapshot);

  logger.info('Backup exported', {
    scope: 'backup',
    action: 'export',
    location: location.name,
  });

  return location;
};

export const restoreBackup = async (
  adapter: IBackupStorageAdapter,
  location: BackupLocation,
): Promise<void> => {
  const snapshot = await adapter.load(location);

  if (snapshot.meta.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `호환되지 않는 백업 버전입니다 (v${snapshot.meta.schemaVersion}). 현재 앱은 v${BACKUP_SCHEMA_VERSION}만 지원합니다.`,
    );
  }

  const db = await getDatabase();

  await db.execAsync('BEGIN TRANSACTION');
  try {
    await db.execAsync('DELETE FROM fixed_month_costs');
    await db.execAsync('DELETE FROM variable_month_expenses');

    for (const row of snapshot.database.fixedExpenses) {
      await db.runAsync(
        'INSERT INTO fixed_month_costs (id, created_at, amount, name, start_date) VALUES (?, ?, ?, ?, ?)',
        [row.id, row.created_at, row.amount, row.name, row.start_date],
      );
    }

    for (const row of snapshot.database.variableExpenses) {
      await db.runAsync(
        'INSERT INTO variable_month_expenses (id, created_at, amount, name, spent_date, category, memo) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          row.id,
          row.created_at,
          row.amount,
          row.name,
          row.spent_date,
          row.category ?? null,
          row.memo ?? null,
        ],
      );
    }

    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }

  logger.info('Backup restored', {
    scope: 'backup',
    action: 'restore',
    location: location.name,
    fixedCount: snapshot.database.fixedExpenses.length,
    variableCount: snapshot.database.variableExpenses.length,
  });
};
