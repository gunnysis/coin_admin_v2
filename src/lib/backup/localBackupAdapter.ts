import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { BACKUP_SCHEMA_VERSION } from './constants';
import type { BackupLocation, IBackupStorageAdapter } from './storageAdapter';
import type { BackupSnapshot } from './types';
import { logger } from '../logger';

const BACKUP_FILENAME_PREFIX = 'coin-admin-backup-';

function formatBackupFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${BACKUP_FILENAME_PREFIX}${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-v${BACKUP_SCHEMA_VERSION}.json`;
}

/** 웹: Blob으로 JSON을 받아 다운로드 링크로 저장 */
function saveBackupOnWeb(snapshot: BackupSnapshot, fileName: string): BackupLocation {
  const blob = new Blob([JSON.stringify(snapshot)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return {
    id: url,
    name: fileName,
    createdAt: snapshot.meta.createdAt,
    source: 'local',
  };
}

/**
 * 로컬 파일 기반 백업 어댑터.
 * - save: 네이티브는 documentDirectory에 저장 후 공유 시트, 웹은 Blob 다운로드.
 * - load: 파일 URI에서 JSON 읽어 스냅샷 반환.
 */
export class LocalBackupAdapter implements IBackupStorageAdapter {
  source = 'local' as const;

  async save(snapshot: BackupSnapshot): Promise<BackupLocation> {
    const fileName = formatBackupFilename();

    if (Platform.OS === 'web') {
      return saveBackupOnWeb(snapshot, fileName);
    }

    // documentDirectory 사용 시 Android에서 공유가 더 안정적임 (cache는 일부 기기에서 공유 실패)
    const dir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
    if (!dir) {
      throw new Error('파일을 저장할 디렉터리를 사용할 수 없습니다. 기기 또는 앱을 재시작한 뒤 다시 시도해 주세요.');
    }
    const fileUri = `${dir}${fileName}`;

    try {
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(snapshot), {
        encoding: FileSystem.EncodingType.UTF8,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('Backup file write failed', err, { scope: 'backup/local', action: 'save', detail: msg });
      throw new Error(`백업 파일 저장 실패: ${msg}`);
    }

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      logger.warn('Sharing not available', { scope: 'backup/local', action: 'save' });
      return {
        id: fileUri,
        name: fileName,
        createdAt: snapshot.meta.createdAt,
        source: 'local',
      };
    }

    try {
      // 일부 Android에서 shareAsync 직후 호출 시 실패하는 이슈 완화
      await new Promise(resolve => setTimeout(resolve, 300));
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: '백업 파일 저장',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('Backup share failed', err, { scope: 'backup/local', action: 'share', detail: msg });
      throw new Error(`공유 창을 열 수 없습니다. 파일은 앱 내부에 저장되었습니다. (${msg})`);
    }

    return {
      id: fileUri,
      name: fileName,
      createdAt: snapshot.meta.createdAt,
      source: 'local',
    };
  }

  async load(location: BackupLocation): Promise<BackupSnapshot> {
    let content: string;
    if (Platform.OS === 'web' && (location.id.startsWith('blob:') || location.id.startsWith('http'))) {
      const res = await fetch(location.id);
      if (!res.ok) throw new Error('백업 파일을 읽을 수 없습니다.');
      content = await res.text();
    } else if (Platform.OS !== 'web' && !location.id.startsWith('file://')) {
      // Android 등에서 Document Picker가 content:// URI를 반환할 수 있음.
      // readAsStringAsync는 file:// 또는 특정 SAF만 지원하므로, content://는 캐시로 복사 후 읽기.
      const dir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
      if (!dir) {
        throw new Error('백업 파일을 읽을 수 있는 디렉터리를 사용할 수 없습니다. 기기 또는 앱을 재시작한 뒤 다시 시도해 주세요.');
      }
      const tempUri = `${dir}coin-admin-restore-temp-${Date.now()}.json`;
      try {
        await FileSystem.copyAsync({ from: location.id, to: tempUri });
        content = await FileSystem.readAsStringAsync(tempUri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } finally {
        try {
          await FileSystem.deleteAsync(tempUri, { idempotent: true });
        } catch {
          // 임시 파일 삭제 실패는 무시
        }
      }
    } else {
      content = await FileSystem.readAsStringAsync(location.id, {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    let snapshot: BackupSnapshot;
    try {
      snapshot = JSON.parse(content) as BackupSnapshot;
    } catch {
      throw new Error('백업 파일 형식이 올바르지 않습니다.');
    }

    if (!snapshot.meta || !snapshot.database) {
      throw new Error('유효하지 않은 백업 파일 형식입니다.');
    }

    return snapshot;
  }
}
