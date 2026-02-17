import React from 'react';
import { ScrollView, View } from 'react-native';
import { Typography } from '../../../components/ui/Typography';
import { BackupRestoreSection } from './BackupRestoreSection';

interface SettingsScreenProps {
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-4 pt-6 pb-3 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <Typography variant="h4" weight="semibold">
          설정
        </Typography>
        <Typography
          variant="body2"
          color="primary"
          weight="semibold"
          onPress={onClose}
          accessibilityRole="button"
        >
          닫기
        </Typography>
      </View>
      <ScrollView
        className="px-4 py-4"
        contentContainerStyle={{ gap: 16, paddingBottom: 32 }}
      >
        <BackupRestoreSection />
      </ScrollView>
    </View>
  );
};

