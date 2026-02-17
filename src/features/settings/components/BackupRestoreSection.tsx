import React, { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Typography } from '../../../components/ui/Typography';
import { Card } from '../../../components/ui/Card';
import { getTestProps } from '../../../utils/test-utils';
import { AndroidGoogleAuthProvider } from '../../../lib/backup/googleAuthProvider.android';
import { GoogleDriveStorageAdapter } from '../../../lib/backup/googleDriveAdapter.android';
import { exportBackup, restoreBackup } from '../../../lib/backup/backupService';
import type { BackupLocation } from '../../../lib/backup/storageAdapter';
import { logger } from '../../../lib/logger';

export const BackupRestoreSection: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupLocation[]>([]);
  const [selectedBackup, setSelectedBackup] = useState<BackupLocation | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleBackup = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const authProvider = new AndroidGoogleAuthProvider();
      const adapter = new GoogleDriveStorageAdapter({ authProvider });
      await exportBackup(adapter);
    } catch (error) {
      logger.error('Backup failed', error, { scope: 'backup/drive', action: 'export' });
      setErrorMessage(
        error instanceof Error ? error.message : '백업 중 알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreLatest = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const authProvider = new AndroidGoogleAuthProvider();
      const adapter = new GoogleDriveStorageAdapter({ authProvider });
      const locations = await adapter.listRecent?.(3);

      if (!locations || locations.length === 0) {
        setErrorMessage('복구할 수 있는 백업이 없습니다.');
        return;
      }

      setBackups(locations);
      setShowListModal(true);
    } catch (error) {
      logger.error('Backup list fetch failed', error, {
        scope: 'backup/drive',
        action: 'list',
      });
      setErrorMessage(
        error instanceof Error ? error.message : '복구 중 알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="base" className="gap-3">
      <Typography variant="h4" weight="semibold">
        백업/복구
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Google Drive에 백업을 저장하고, 필요할 때 복구할 수 있습니다. 복구 시 기존 데이터는
        백업 시점의 상태로 완전히 덮어쓰여요.
      </Typography>

      <View className="flex-row gap-3 mt-2">
        <Button
          {...getTestProps('backup-drive-button')}
          size="sm"
          onPress={handleBackup}
          disabled={loading}
        >
          Drive로 백업
        </Button>
        <Button
          {...getTestProps('restore-drive-button')}
          size="sm"
          variant="outline"
          onPress={handleRestoreLatest}
          disabled={loading}
        >
          Drive에서 복구
        </Button>
      </View>

      {errorMessage ? (
        <Typography
          variant="caption"
          color="error"
          accessibilityRole="alert"
          {...getTestProps('backup-error-message')}
        >
          {errorMessage}
        </Typography>
      ) : null}

      {/* 백업 선택 모달 */}
      <Modal
        visible={showListModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowListModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/30 justify-center px-6"
          onPress={() => setShowListModal(false)}
        >
          <Pressable
            className="bg-white rounded-2xl p-4"
            onPress={e => e.stopPropagation()}
          >
            <Typography variant="h4" weight="semibold" className="mb-2">
              복구할 백업 선택
            </Typography>
            {backups.map((backup, index) => (
              <Pressable
                key={backup.id}
                className="py-2"
                onPress={() => {
                  setSelectedBackup(backup);
                  setShowListModal(false);
                  setShowConfirmModal(true);
                }}
                {...getTestProps(`backup-item-${index}`)}
              >
                <Typography variant="body">
                  {backup.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {backup.createdAt}
                </Typography>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* 복구 확인 모달 */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/30 justify-center px-6"
          onPress={() => setShowConfirmModal(false)}
        >
          <Pressable
            className="bg-white rounded-2xl p-4"
            onPress={e => e.stopPropagation()}
          >
            <Typography variant="h4" weight="semibold" className="mb-2">
              이 백업으로 복구할까요?
            </Typography>
            {selectedBackup && (
              <>
                <Typography variant="body">
                  {selectedBackup.name}
                </Typography>
                <Typography variant="caption" color="textSecondary" className="mt-1">
                  생성일: {selectedBackup.createdAt}
                </Typography>
              </>
            )}
            <Typography variant="body2" color="textSecondary" className="mt-3">
              기존 데이터는 모두 삭제되고, 선택한 백업 시점의 상태로 완전히 되돌아갑니다.
            </Typography>
            <View className="flex-row justify-end gap-3 mt-4">
              <Button
                size="sm"
                variant="outline"
                onPress={() => setShowConfirmModal(false)}
              >
                취소
              </Button>
              <Button
                size="sm"
                {...getTestProps('backup-restore-confirm-button')}
                onPress={async () => {
                  if (!selectedBackup) return;
                  setShowConfirmModal(false);
                  setLoading(true);
                  setErrorMessage(null);
                  try {
                    const authProvider = new AndroidGoogleAuthProvider();
                    const adapter = new GoogleDriveStorageAdapter({ authProvider });
                    await restoreBackup(adapter, selectedBackup);
                  } catch (error) {
                    logger.error('Restore failed', error, {
                      scope: 'backup/drive',
                      action: 'restore',
                    });
                    setErrorMessage(
                      error instanceof Error
                        ? error.message
                        : '복구 중 알 수 없는 오류가 발생했습니다.',
                    );
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                복구
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Card>
  );
};

