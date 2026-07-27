import React, { useMemo } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X } from 'phosphor-react-native';
import { useDeviceDimensions } from '../../../hooks/useDeviceDimensions';
import { getResponsivePadding } from '../../../utils/responsive';
import { SPACING, COLORS, ICON_SIZES, RADIUS } from '../../../constants/theme';
import { Typography } from '../../../components/ui/Typography';
import { useTheme } from '../../../contexts/ThemeContext';
import type { ThemeMode } from '../../../contexts/ThemeContext';
import { BackupRestoreSection } from './BackupRestoreSection';

interface SettingsScreenProps {
  onClose: () => void;
}

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
  { value: 'system', label: '시스템' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onClose }) => {
  const device = useDeviceDimensions();
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();
  const headerPadding = useMemo(
    () => getResponsivePadding(device, SPACING.base),
    [device],
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View
        className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-row items-center justify-between"
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
        contentContainerStyle={{ gap: SPACING.lg, paddingBottom: SPACING['2xl'] + insets.bottom }}
      >
        <View style={{ backgroundColor: colors.surface, borderRadius: RADIUS.card, padding: SPACING.base, borderWidth: 1, borderColor: colors.borderLight }}>
          <Typography variant="label" color="textSecondary" className="mb-2">
            테마
          </Typography>
          <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
            {THEME_OPTIONS.map(({ value, label }) => (
              <Pressable
                key={value}
                onPress={() => setThemeMode(value)}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: SPACING.sm,
                  paddingHorizontal: SPACING.md,
                  borderRadius: RADIUS.button,
                  backgroundColor: themeMode === value ? COLORS.primary : colors.gray100,
                  opacity: pressed ? 0.9 : 1,
                })}
                accessibilityRole="button"
                accessibilityLabel={`테마 ${label}`}
                accessibilityState={{ selected: themeMode === value }}
              >
                <Typography
                  variant="caption"
                  weight="medium"
                  style={{ color: themeMode === value ? COLORS.textInverse : colors.textSecondary, textAlign: 'center' }}
                >
                  {label}
                </Typography>
              </Pressable>
            ))}
          </View>
        </View>
        <BackupRestoreSection />
      </ScrollView>
    </SafeAreaView>
  );
};

