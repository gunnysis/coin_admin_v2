import React, { useCallback, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { Button } from '../../../components/ui/Button';
import { Typography } from '../../../components/ui/Typography';
import { Card } from '../../../components/ui/Card';
import { getTestProps } from '../../../utils/test-utils';
import { SPACING, RADIUS, SHADOWS } from '../../../constants/theme';
import { expenseKeys } from '../../../config/queryKeys';
import { LocalBackupAdapter } from '../../../lib/backup/localBackupAdapter';
import { exportBackup, restoreBackup } from '../../../lib/backup/backupService';
import type { BackupLocation } from '../../../lib/backup/storageAdapter';
import { logger } from '../../../lib/logger';

const localAdapter = new LocalBackupAdapter();

export const BackupRestoreSection: React.FC = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedBackup, setSelectedBackup] = useState<BackupLocation | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleBackup = useCallback(async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await exportBackup(localAdapter);
    } catch (error) {
      logger.error('Backup failed', error, { scope: 'backup/local', action: 'export' });
      setErrorMessage(
        error instanceof Error ? error.message : '백업 중 알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRestore = useCallback(async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        setLoading(false);
        return;
      }

      const asset = result.assets[0];
      const location: BackupLocation = {
        id: asset.uri,
        name: asset.name,
        createdAt: asset.lastModified
          ? new Date(asset.lastModified).toISOString()
          : new Date().toISOString(),
        source: 'local',
      };

      setSelectedBackup(location);
      setShowConfirmModal(true);
    } catch (error) {
      logger.error('Backup file pick failed', error, {
        scope: 'backup/local',
        action: 'pick',
      });
      setErrorMessage(
        error instanceof Error ? error.message : '파일을 선택하는 중 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConfirmRestore = useCallback(async () => {
    if (!selectedBackup) return;
    setShowConfirmModal(false);
    const toRestore = selectedBackup;
    setSelectedBackup(null);
    setLoading(true);
    setErrorMessage(null);
    try {
      await restoreBackup(localAdapter, toRestore);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.fixed.all() }),
        queryClient.invalidateQueries({ queryKey: expenseKeys.variable.all() }),
      ]);
    } catch (error) {
      logger.error('Restore failed', error, {
        scope: 'backup/local',
        action: 'restore',
      });
      setErrorMessage(
        error instanceof Error ? error.message : '복구 중 알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  }, [selectedBackup, queryClient]);

  const closeConfirmModal = useCallback(() => {
    setShowConfirmModal(false);
    setSelectedBackup(null);
  }, []);

  return (
    <Card padding="base" className="gap-3">
      <Typography variant="h4" weight="semibold">
        백업/복구
      </Typography>
      <Typography variant="body2" color="textSecondary">
        백업 파일을 기기에 저장하거나 다른 앱으로 공유할 수 있습니다. 복구 시 기존 데이터는
        선택한 백업으로 완전히 덮어씌워집니다.
      </Typography>

      <View className="flex-row gap-3 mt-2">
        <Button
          {...getTestProps('backup-button')}
          size="sm"
          onPress={handleBackup}
          disabled={loading}
        >
          백업하기
        </Button>
        <Button
          {...getTestProps('restore-button')}
          size="sm"
          variant="outline"
          onPress={handleRestore}
          disabled={loading}
        >
          복구하기
        </Button>
      </View>

      {errorMessage ? (
        <Typography
          variant="caption"
          color="danger"
          accessibilityRole="alert"
          {...getTestProps('backup-error-message')}
        >
          {errorMessage}
        </Typography>
      ) : null}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={closeConfirmModal}
      >
        <Pressable
          className="flex-1 bg-black/30 justify-center"
          style={{ paddingHorizontal: SPACING.lg }}
          onPress={closeConfirmModal}
        >
          <Pressable
            className="bg-white"
            style={{
              borderRadius: RADIUS.card,
              padding: SPACING.lg,
              ...SHADOWS.md,
            }}
            onPress={e => e.stopPropagation()}
          >
            <Typography variant="h4" weight="semibold" style={{ marginBottom: SPACING.sm }}>
              이 백업으로 복구할까요?
            </Typography>
            {selectedBackup && (
              <>
                <Typography variant="body">{selectedBackup.name}</Typography>
                <Typography variant="caption" color="textSecondary" style={{ marginTop: SPACING.xs }}>
                  생성일: {selectedBackup.createdAt}
                </Typography>
              </>
            )}
            <Typography variant="body2" color="textSecondary" style={{ marginTop: SPACING.md }}>
              기존 데이터는 모두 삭제되고, 선택한 백업 시점의 상태로 완전히 되돌아갑니다.
            </Typography>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.md, marginTop: SPACING.base }}>
              <Button size="sm" variant="outline" onPress={closeConfirmModal}>
                취소
              </Button>
              <Button
                size="sm"
                variant="danger"
                {...getTestProps('backup-restore-confirm-button')}
                onPress={handleConfirmRestore}
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
