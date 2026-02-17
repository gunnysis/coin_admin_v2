import type { BackupSnapshot } from './types';

export interface BackupLocation {
  id: string;
  name: string;
  createdAt: string;
  source: 'local' | 'googleDrive';
}

export interface IBackupStorageAdapter {
  source: 'local' | 'googleDrive';
  save(snapshot: BackupSnapshot): Promise<BackupLocation>;
  load(location: BackupLocation): Promise<BackupSnapshot>;
  listRecent?(limit: number): Promise<BackupLocation[]>;
}
