import Constants from 'expo-constants';

export const BACKUP_SCHEMA_VERSION = 1;

export const getBackupAppVersion = (): string => {
  return Constants.expoConfig?.version ?? 'unknown';
};
