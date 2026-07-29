import { LocalBackupAdapter } from '../backup/localBackupAdapter';
import type { BackupSnapshot } from '../backup/types';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-file-system', () => {
  const state = {
    exists: true,
    create: jest.fn(),
    write: jest.fn(),
    text: jest.fn(),
    lastUri: '',
  };
  class File {
    uri: string;
    constructor(...parts: string[]) {
      this.uri = parts.join('/');
      state.lastUri = this.uri;
    }
    get exists() {
      return state.exists;
    }
    create() {
      return state.create();
    }
    write(content: string) {
      return state.write(content);
    }
    text() {
      return state.text();
    }
  }
  return { Paths: { document: 'file:///docs' }, File, __state: state };
});

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

jest.mock('../backup/constants', () => ({
  BACKUP_SCHEMA_VERSION: 1,
}));

jest.mock('../logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

const { Platform } = jest.requireMock('react-native') as { Platform: { OS: string } };
const { __state: fileState } = jest.requireMock('expo-file-system') as {
  __state: {
    exists: boolean;
    create: jest.Mock;
    write: jest.Mock;
    text: jest.Mock;
    lastUri: string;
  };
};
const Sharing = jest.requireMock('expo-sharing') as {
  isAvailableAsync: jest.Mock;
  shareAsync: jest.Mock;
};

const snapshot: BackupSnapshot = {
  meta: {
    schemaVersion: 1,
    appVersion: 'x',
    createdAt: '2026-07-29T00:00:00.000Z',
    platform: 'android',
  },
  database: { fixedExpenses: [], variableExpenses: [] },
  settings: { defaultCurrency: 'KRW' },
};

beforeEach(() => {
  jest.clearAllMocks();
  Platform.OS = 'android';
  fileState.exists = true;
  fileState.write.mockResolvedValue(undefined);
  fileState.text.mockResolvedValue(JSON.stringify(snapshot));
  Sharing.isAvailableAsync.mockResolvedValue(true);
  Sharing.shareAsync.mockResolvedValue(undefined);
});

describe('LocalBackupAdapter.save (native)', () => {
  it('writes JSON to the document directory and opens the share sheet', async () => {
    const adapter = new LocalBackupAdapter();
    const location = await adapter.save(snapshot);

    expect(location.name).toMatch(/^coin-admin-backup-\d{8}-\d{6}-v1\.json$/);
    expect(fileState.lastUri.startsWith('file:///docs/')).toBe(true);
    expect(fileState.write).toHaveBeenCalledWith(JSON.stringify(snapshot));
    expect(Sharing.shareAsync).toHaveBeenCalledWith(
      fileState.lastUri,
      expect.objectContaining({ mimeType: 'application/json' }),
    );
    expect(location.id).toBe(fileState.lastUri);
  });

  it('creates the file first when it does not exist yet', async () => {
    fileState.exists = false;
    await new LocalBackupAdapter().save(snapshot);
    expect(fileState.create).toHaveBeenCalledTimes(1);
  });

  it('returns the saved location without sharing when sharing is unavailable', async () => {
    Sharing.isAvailableAsync.mockResolvedValue(false);
    const location = await new LocalBackupAdapter().save(snapshot);
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
    expect(location.id).toBe(fileState.lastUri);
  });

  it('throws a user-facing error when the file write fails', async () => {
    fileState.write.mockRejectedValue(new Error('ENOSPC'));
    await expect(new LocalBackupAdapter().save(snapshot)).rejects.toThrow(/백업 파일 저장 실패/);
    expect(Sharing.shareAsync).not.toHaveBeenCalled();
  });

  it('throws but notes the file was saved when the share sheet fails', async () => {
    Sharing.shareAsync.mockRejectedValue(new Error('activity not found'));
    await expect(new LocalBackupAdapter().save(snapshot)).rejects.toThrow(/공유 창을 열 수 없습니다/);
    expect(fileState.write).toHaveBeenCalled();
  });
});

describe('LocalBackupAdapter.load', () => {
  const location = (id: string) => ({
    id,
    name: 'backup.json',
    createdAt: snapshot.meta.createdAt,
    source: 'local' as const,
  });

  it('reads and parses a file:// URI on native', async () => {
    const loaded = await new LocalBackupAdapter().load(location('file:///cache/backup.json'));
    expect(loaded.meta.schemaVersion).toBe(1);
  });

  it('rejects non-file:// URIs on native (defensive branch)', async () => {
    await expect(
      new LocalBackupAdapter().load(location('content://provider/backup.json')),
    ).rejects.toThrow(/다시 선택/);
  });

  it('throws a user-facing error when the file read fails', async () => {
    fileState.text.mockRejectedValue(new Error('EACCES'));
    await expect(
      new LocalBackupAdapter().load(location('file:///cache/backup.json')),
    ).rejects.toThrow(/백업 파일을 읽을 수 없습니다/);
  });

  it('throws on malformed JSON', async () => {
    fileState.text.mockResolvedValue('not-json');
    await expect(
      new LocalBackupAdapter().load(location('file:///cache/backup.json')),
    ).rejects.toThrow(/형식이 올바르지 않습니다/);
  });

  it('throws when required sections are missing', async () => {
    fileState.text.mockResolvedValue(JSON.stringify({ hello: 'world' }));
    await expect(
      new LocalBackupAdapter().load(location('file:///cache/backup.json')),
    ).rejects.toThrow(/유효하지 않은 백업 파일/);
  });

  it('fetches blob: URIs on web', async () => {
    Platform.OS = 'web';
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(snapshot),
    });
    (globalThis as { fetch?: unknown }).fetch = fetchMock;

    const loaded = await new LocalBackupAdapter().load(location('blob:https://app/abc'));
    expect(fetchMock).toHaveBeenCalledWith('blob:https://app/abc');
    expect(loaded.database.fixedExpenses).toEqual([]);

    delete (globalThis as { fetch?: unknown }).fetch;
  });
});
