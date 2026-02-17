import type { BackupSnapshot } from './types';

/**
 * 백업이 저장된 위치를 나타내는 불변 정보.
 * 로컬: id는 파일 URI, source는 'local'.
 */
export interface BackupLocation {
  id: string;
  name: string;
  createdAt: string;
  source: 'local' | 'googleDrive';
}

/**
 * 백업 저장/로드 추상화. 구현체는 로컬 파일(LocalBackupAdapter) 등.
 * listRecent는 선택(로컬 복구는 파일 선택기 사용 시 생략 가능).
 */
export interface IBackupStorageAdapter {
  source: 'local' | 'googleDrive';
  save(snapshot: BackupSnapshot): Promise<BackupLocation>;
  load(location: BackupLocation): Promise<BackupSnapshot>;
  listRecent?(limit: number): Promise<BackupLocation[]>;
}
