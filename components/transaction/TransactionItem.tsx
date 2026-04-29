import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Transaction } from '../../types';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { Radius, FontSize, Spacing } from '../../constants/theme';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
  showDate?: boolean;
}

export function TransactionItem({ transaction, onPress, onDelete, showDate = false }: TransactionItemProps) {
  const { colors } = useTheme();
  const { categories } = useTransactionStore();
  const { settings } = useSettingsStore();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const category = categories.find((c) => c.id === transaction.categoryId);
  const isIncome = transaction.type === 'income';
  const amountColor = isIncome ? colors.success : colors.danger;
  const amountPrefix = isIncome ? '+' : '-';

  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={() => onPress?.(transaction)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderLight }]}
      >
        {/* Category Icon */}
        <View style={[styles.iconContainer, { backgroundColor: category ? `${category.color}22` : colors.primaryGlow }]}>
          <Ionicons
            name={(category?.icon ?? 'ellipsis-horizontal-circle') as any}
            size={22}
            color={category?.color ?? colors.primary}
          />
          {transaction.isRecurring && (
            <View style={[styles.recurringBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="refresh" size={8} color="#fff" />
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.details}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {transaction.title}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.category, { color: colors.textMuted }]}>
              {category?.name ?? 'Other'}
            </Text>
            {transaction.notes ? (
              <Text style={[styles.dot, { color: colors.textMuted }]}> · </Text>
            ) : null}
            {showDate ? (
              <Text style={[styles.time, { color: colors.textMuted }]}>
                {formatTime(transaction.date)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {amountPrefix}{formatCurrency(transaction.amount, settings.currency)}
          </Text>
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(transaction.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  recurringBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  category: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  dot: {
    fontSize: FontSize.xs,
  },
  time: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  amountSection: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amount: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 2,
  },
});
