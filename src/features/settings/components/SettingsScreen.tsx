import React, { useMemo } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X } from 'phosphor-react-native';
import { useDeviceDimensions } from '../../../hooks/useDeviceDimensions';
import { getResponsivePadding } from '../../../utils/responsive';
import { SPACING, COLORS, ICON_SIZES } from '../../../constants/theme';
import { Typography } from '../../../components/ui/Typography';
import { BackupRestoreSection } from './BackupRestoreSection';

interface SettingsScreenProps {
  onClose: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const device = useDeviceDimensions();
  const headerPadding = useMemo(
    () => getResponsivePadding(device, SPACING.base),
    [device],
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View
        className="bg-white border-b border-slate-200 flex-row items-center justify-between"
        style={{
          paddingHorizontal: headerPadding,
          paddingVertical: SPACING.md,
        }}
      >
        <Typography variant="h4" weight="semibold">
          설정
        </Typography>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: SPACING.sm,
            minHeight: 44,
            minWidth: 44,
            justifyContent: 'center',
            paddingHorizontal: SPACING.sm,
            paddingVertical: SPACING.sm,
            opacity: pressed ? 0.7 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        >
          <X size={ICON_SIZES.base} color={COLORS.primary} weight="regular" />
          <Typography variant="body2" color="primary" weight="semibold">
            닫기
          </Typography>
        </Pressable>
      </View>
      <ScrollView
        style={{ paddingHorizontal: headerPadding, paddingVertical: SPACING.base }}
        contentContainerStyle={{ gap: SPACING.lg, paddingBottom: SPACING['2xl'] }}
      >
        <BackupRestoreSection />
      </ScrollView>
    </SafeAreaView>
  );
};

