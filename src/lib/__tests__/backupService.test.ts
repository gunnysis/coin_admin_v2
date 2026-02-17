import { exportBackup, restoreBackup, createCurrentSnapshot } from '../backup/backupService';
import type { BackupSnapshot } from '../backup/types';
import type { IBackupStorageAdapter, BackupLocation } from '../backup/storageAdapter';

jest.mock('../../database/db', () => ({
  getDatabase: async () => ({
    getAllAsync: jest.fn().mockResolvedValue([]),
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue(undefined),
  }),
}));

jest.mock('../backup/constants', () => ({
  BACKUP_SCHEMA_VERSION: 1,
  getBackupAppVersion: () => 'test-version',
}));

describe('backupService', () => {
  it('exportBackup calls adapter.save with snapshot', async () => {
    const save = jest.fn(async (snapshot: BackupSnapshot) => {
      return {
        id: 'id1',
        name: 'name1',
        createdAt: snapshot.meta.createdAt,
        source: 'googleDrive',
      } as BackupLocation;
    });

    const adapter: IBackupStorageAdapter = {
      source: 'googleDrive',
      save,
      load: jest.fn(),
    };

    const location = await exportBackup(adapter);

    expect(save).toHaveBeenCalledTimes(1);
    expect(location.id).toBe('id1');
  });

  it('restoreBackup throws on incompatible schemaVersion', async () => {
    const adapter: IBackupStorageAdapter = {
      source: 'googleDrive',
      save: jest.fn(),
      load: jest.fn(async () => ({
        meta: {
          schemaVersion: 999,
          appVersion: 'x',
          createdAt: new Date().toISOString(),
          platform: 'android',
        },
        database: { fixedExpenses: [], variableExpenses: [] },
        settings: { defaultCurrency: 'KRW' },
      })),
    };

    await expect(
      restoreBackup(adapter, {
        id: 'id',
        name: 'name',
        createdAt: new Date().toISOString(),
        source: 'googleDrive',
      }),
    ).rejects.toThrow(/호환되지 않는 백업/);
  });

  it('createCurrentSnapshot returns snapshot with meta and sections', async () => {
    const snapshot = await createCurrentSnapshot();

    expect(snapshot.meta.schemaVersion).toBe(1);
    expect(snapshot.database.fixedExpenses).toBeDefined();
    expect(snapshot.database.variableExpenses).toBeDefined();
    expect(snapshot.settings.defaultCurrency).toBe('KRW');
  });
});

