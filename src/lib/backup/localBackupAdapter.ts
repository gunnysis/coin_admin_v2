import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
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
 * 로컬 파일 기반 백업 어댑터 (expo-file-system 신규 File/Paths API).
 * - save: 네이티브는 document 디렉터리에 저장 후 공유 시트, 웹은 Blob 다운로드.
 * - load: file:// URI에서 JSON 읽어 스냅샷 반환.
 *   Document Picker가 copyToCacheDirectory: true로 호출되므로 네이티브에서는 항상 file://가 전달된다.
 * - copy()/text() 등은 SDK 56에서 비동기 전환되므로 처음부터 await 호출로 작성.
 */
export class LocalBackupAdapter implements IBackupStorageAdapter {
  source = 'local' as const;

  async save(snapshot: BackupSnapshot): Promise<BackupLocation> {
    const fileName = formatBackupFilename();

    if (Platform.OS === 'web') {
      return saveBackupOnWeb(snapshot, fileName);
    }

    // documentDirectory 사용 시 Android에서 공유가 더 안정적임 (cache는 일부 기기에서 공유 실패)
    const file = new File(Paths.document, fileName);

    try {
      if (!file.exists) {
        file.create();
      }
      await file.write(JSON.stringify(snapshot));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('Backup file write failed', err, { scope: 'backup/local', action: 'save', detail: msg });
      throw new Error(`백업 파일 저장 실패: ${msg}`);
    }

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      logger.warn('Sharing not available', { scope: 'backup/local', action: 'save' });
      return {
        id: file.uri,
        name: fileName,
        createdAt: snapshot.meta.createdAt,
        source: 'local',
      };
    }

    try {
      // 일부 Android에서 shareAsync 직후 호출 시 실패하는 이슈 완화
      await new Promise(resolve => setTimeout(resolve, 300));
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        dialogTitle: '백업 파일 저장',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      logger.error('Backup share failed', err, { scope: 'backup/local', action: 'share', detail: msg });
      throw new Error(`공유 창을 열 수 없습니다. 파일은 앱 내부에 저장되었습니다. (${msg})`);
    }

    return {
      id: file.uri,
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
      // 신규 File API는 file:// URI만 보장한다. Document Picker가 copyToCacheDirectory: true로
      // 캐시에 복사한 file://를 반환하므로 정상 흐름에서는 도달하지 않는 방어 분기.
      logger.error('Unsupported backup URI scheme', undefined, {
        scope: 'backup/local',
        action: 'load',
        detail: location.id.split(':')[0],
      });
      throw new Error('이 위치의 백업 파일은 직접 읽을 수 없습니다. 파일 선택 창에서 백업 파일을 다시 선택해 주세요.');
    } else {
      try {
        content = await new File(location.id).text();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error('Backup file read failed', err, { scope: 'backup/local', action: 'load', detail: msg });
        throw new Error(`백업 파일을 읽을 수 없습니다: ${msg}`);
      }
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
