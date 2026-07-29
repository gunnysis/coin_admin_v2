import { exportBackup, restoreBackup, createCurrentSnapshot } from '../backup/backupService';
import type { BackupSnapshot } from '../backup/types';
import type { IBackupStorageAdapter, BackupLocation } from '../backup/storageAdapter';

const mockDb = {
  getAllAsync: jest.fn(),
  execAsync: jest.fn(),
  runAsync: jest.fn(),
};

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('../../database/db', () => ({
  getDatabase: async () => mockDb,
}));

jest.mock('../backup/constants', () => ({
  BACKUP_SCHEMA_VERSION: 1,
  getBackupAppVersion: () => 'test-version',
}));

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const makeSnapshot = (overrides: Partial<BackupSnapshot['meta']> = {}): BackupSnapshot => ({
  meta: {
    schemaVersion: 1,
    appVersion: 'x',
    createdAt: new Date().toISOString(),
    platform: 'android',
    ...overrides,
  },
  database: {
    fixedExpenses: [
      { id: 1, created_at: '2026-01-01', amount: 500000, name: '월세', start_date: '2026-01-05' },
    ],
    variableExpenses: [
      { id: 10, created_at: '2026-01-02', amount: 12000, name: '점심', spent_date: '2026-01-02' },
    ],
  },
  settings: { defaultCurrency: 'KRW' },
});

const makeLocation = (): BackupLocation => ({
  id: 'id',
  name: 'name',
  createdAt: new Date().toISOString(),
  source: 'local',
});

beforeEach(() => {
  jest.clearAllMocks();
  mockDb.getAllAsync.mockResolvedValue([]);
  mockDb.execAsync.mockResolvedValue(undefined);
  mockDb.runAsync.mockResolvedValue(undefined);
});

describe('backupService', () => {
  it('exportBackup calls adapter.save with snapshot', async () => {
    const save = jest.fn(async (snapshot: BackupSnapshot) => {
      return {
        id: 'id1',
        name: 'name1',
        createdAt: snapshot.meta.createdAt,
        source: 'local',
      } as BackupLocation;
    });

    const adapter: IBackupStorageAdapter = {
      source: 'local',
      save,
      load: jest.fn(),
    };

    const location = await exportBackup(adapter);

    expect(save).toHaveBeenCalledTimes(1);
    expect(location.id).toBe('id1');
  });

  it('restoreBackup throws on incompatible schemaVersion and touches no DB', async () => {
    const adapter: IBackupStorageAdapter = {
      source: 'local',
      save: jest.fn(),
      load: jest.fn(async () => makeSnapshot({ schemaVersion: 999 })),
    };

    await expect(restoreBackup(adapter, makeLocation())).rejects.toThrow(/호환되지 않는 백업/);
    expect(mockDb.execAsync).not.toHaveBeenCalled();
    expect(mockDb.runAsync).not.toHaveBeenCalled();
  });

  it('createCurrentSnapshot returns snapshot with meta and sections', async () => {
    const snapshot = await createCurrentSnapshot();

    expect(snapshot.meta.schemaVersion).toBe(1);
    expect(snapshot.database.fixedExpenses).toBeDefined();
    expect(snapshot.database.variableExpenses).toBeDefined();
    expect(snapshot.settings.defaultCurrency).toBe('KRW');
  });

  it('restoreBackup replaces both tables in a committed transaction', async () => {
    const adapter: IBackupStorageAdapter = {
      source: 'local',
      save: jest.fn(),
      load: jest.fn(async () => makeSnapshot()),
    };

    await restoreBackup(adapter, makeLocation());

    expect(mockDb.execAsync.mock.calls.map((c) => c[0])).toEqual([
      'BEGIN TRANSACTION',
      'DELETE FROM fixed_month_costs',
      'DELETE FROM variable_month_expenses',
      'COMMIT',
    ]);
    expect(mockDb.runAsync).toHaveBeenCalledTimes(2);
    expect(mockDb.runAsync).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('INSERT INTO fixed_month_costs'),
      [1, '2026-01-01', 500000, '월세', '2026-01-05'],
    );
    // category/memo 미존재 시 null로 저장되어야 함 (undefined 바인딩 방지)
    expect(mockDb.runAsync).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('INSERT INTO variable_month_expenses'),
      [10, '2026-01-02', 12000, '점심', '2026-01-02', null, null],
    );
  });

  it('restoreBackup rolls back and rethrows when an insert fails', async () => {
    mockDb.runAsync.mockRejectedValueOnce(new Error('disk I/O error'));

    const adapter: IBackupStorageAdapter = {
      source: 'local',
      save: jest.fn(),
      load: jest.fn(async () => makeSnapshot()),
    };

    await expect(restoreBackup(adapter, makeLocation())).rejects.toThrow('disk I/O error');

    const execCalls = mockDb.execAsync.mock.calls.map((c) => c[0]);
    expect(execCalls).toContain('ROLLBACK');
    expect(execCalls).not.toContain('COMMIT');
  });
});
