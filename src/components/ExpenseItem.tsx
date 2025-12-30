import React from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { FixedMonthCost } from '../types';
import { formatCurrency } from '../utils/format';
import { getNextPaymentDate } from '../utils/date';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';
import { COLORS, SPACING, RADIUS, SHADOWS, ICON_SIZES } from '../constants/theme';

interface ExpenseItemProps {
  item: FixedMonthCost;
  onDelete: (id: number) => void;
  onEdit?: (item: FixedMonthCost) => void;
  isDeleting?: boolean;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  item,
  onDelete,
  onEdit,
  isDeleting = false,
}) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Card variant="elevated" padding="base" style={styles.card}>
        <View style={styles.content}>
          <View style={styles.info}>
            <Typography variant="h3" color="textPrimary" weight="semibold" style={styles.name}>
              {item.name}
            </Typography>
            <Typography variant="h2" color="primary" weight="bold" style={styles.amount}>
              {formatCurrency(item.amount)}
            </Typography>
            <View style={styles.dateContainer}>
              <Typography variant="caption" color="textTertiary" style={styles.dateIcon}>
                📅
              </Typography>
              <Typography variant="caption" color="textSecondary">
                결제일: {getNextPaymentDate(item.start_date)}
              </Typography>
            </View>
          </View>
          
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(item)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.8}
                style={[styles.actionButton, styles.editButton]}
                accessibilityLabel="수정"
                accessibilityRole="button"
              >
                <Typography variant="body" color="textPrimary">✏️</Typography>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              disabled={isDeleting}
              activeOpacity={0.8}
              style={[
                styles.actionButton,
                styles.deleteButton,
                isDeleting && styles.deleteButtonDisabled,
              ]}
              accessibilityLabel="삭제"
              accessibilityRole="button"
              accessibilityState={{ disabled: isDeleting }}
            >
              <Typography variant="body" color="textInverse" weight="semibold">
                ✕
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
  },
  card: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: SPACING.md,
  },
  name: {
    marginBottom: SPACING.xs,
  },
  amount: {
    marginBottom: SPACING.xs,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  dateIcon: {
    marginRight: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    width: ICON_SIZES.base + SPACING.base,
    height: ICON_SIZES.base + SPACING.base,
    borderRadius: RADIUS.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.base,
  },
  editButton: {
    backgroundColor: COLORS.warningLight,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
  },
  deleteButtonDisabled: {
    backgroundColor: COLORS.gray300,
    opacity: 0.6,
  },
});
