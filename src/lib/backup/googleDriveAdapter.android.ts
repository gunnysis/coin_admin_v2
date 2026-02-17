import { BACKUP_SCHEMA_VERSION } from './constants';
import type { AndroidGoogleAuthProvider } from './googleAuthProvider.android';
import type { BackupLocation, IBackupStorageAdapter } from './storageAdapter';
import type { BackupSnapshot } from './types';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

interface GoogleDriveAdapterOptions {
  authProvider: AndroidGoogleAuthProvider;
  appFolderName?: string;
}

export class GoogleDriveStorageAdapter implements IBackupStorageAdapter {
  source = 'googleDrive' as const;

  private authProvider: AndroidGoogleAuthProvider;
  private appFolderName: string;
  private folderId: string | null = null;

  constructor(options: GoogleDriveAdapterOptions) {
    this.authProvider = options.authProvider;
    this.appFolderName = options.appFolderName ?? 'coin-admin-backups';
  }

  async save(snapshot: BackupSnapshot): Promise<BackupLocation> {
    const token = await this.authProvider.getAccessToken();
    const folderId = await this.getOrCreateAppFolderId(token);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fileName = `coin-admin-backup-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-v${BACKUP_SCHEMA_VERSION}.json`;

    const metadata = {
      name: fileName,
      mimeType: 'application/json',
      parents: [folderId],
    };

    const boundary = '---backup_boundary_' + Date.now();
    const body =
      `--${boundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      `\r\n--${boundary}\r\n` +
      'Content-Type: application/json\r\n\r\n' +
      JSON.stringify(snapshot) +
      `\r\n--${boundary}--`;

    const response = await fetch(
      `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Drive 업로드 실패 (${response.status}): ${errorText}`);
    }

    const file = (await response.json()) as {
      id: string;
      name: string;
      createdTime: string;
    };

    return {
      id: file.id,
      name: file.name,
      createdAt: file.createdTime ?? now.toISOString(),
      source: 'googleDrive',
    };
  }

  async load(location: BackupLocation): Promise<BackupSnapshot> {
    const token = await this.authProvider.getAccessToken();

    const response = await fetch(
      `${DRIVE_API_BASE}/files/${location.id}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Drive에서 백업 파일을 불러오지 못했습니다 (${response.status}): ${errorText}`,
      );
    }

    const snapshot = (await response.json()) as BackupSnapshot;

    if (!snapshot.meta || !snapshot.database) {
      throw new Error('유효하지 않은 백업 파일 형식입니다.');
    }

    return snapshot;
  }

  async listRecent(limit: number = 3): Promise<BackupLocation[]> {
    const token = await this.authProvider.getAccessToken();
    const folderId = await this.getOrCreateAppFolderId(token);

    const query = `'${folderId}' in parents and name contains 'coin-admin-backup-' and mimeType='application/json' and trashed=false`;

    const response = await fetch(
      `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&orderBy=createdTime desc&pageSize=${limit}&fields=files(id,name,createdTime)`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Drive 백업 목록을 가져오지 못했습니다 (${response.status}): ${errorText}`,
      );
    }

    const data = (await response.json()) as {
      files?: Array<{ id: string; name: string; createdTime: string }>;
    };

    return (data.files ?? []).map((file) => ({
      id: file.id,
      name: file.name,
      createdAt: file.createdTime,
      source: 'googleDrive' as const,
    }));
  }

  private async getOrCreateAppFolderId(token: string): Promise<string> {
    if (this.folderId) {
      return this.folderId;
    }

    // 기존 폴더 검색
    const searchQuery = `name='${this.appFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
    const searchResponse = await fetch(
      `${DRIVE_API_BASE}/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name)`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!searchResponse.ok) {
      throw new Error(`Drive 폴더 검색 실패 (${searchResponse.status})`);
    }

    const searchData = (await searchResponse.json()) as {
      files?: Array<{ id: string; name: string }>;
    };

    if (searchData.files && searchData.files.length > 0) {
      this.folderId = searchData.files[0].id;
      return this.folderId;
    }

    // 폴더 새로 생성
    const createResponse = await fetch(`${DRIVE_API_BASE}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: this.appFolderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Drive 폴더 생성 실패 (${createResponse.status})`);
    }

    const folder = (await createResponse.json()) as { id: string };
    this.folderId = folder.id;
    return this.folderId;
  }
}
