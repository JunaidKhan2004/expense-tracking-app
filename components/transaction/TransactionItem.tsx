import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../../hooks/useTheme';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Transaction } from '../../types';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { Radius, FontSize, Spacing } from '../../constants/theme';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (t: Transaction) => void;
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
  showDate?: boolean;
}

export function TransactionItem({ transaction, onPress, onEdit, onDelete, showDate = false }: TransactionItemProps) {
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

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [-20, 0, 0],
    });
    return (
      <TouchableOpacity 
        onPress={() => onEdit?.(transaction)}
        style={[styles.leftAction, { backgroundColor: colors.primaryGlow }]}
      >
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <Ionicons name="pencil-outline" size={24} color={colors.primary} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 0, 20],
    });
    return (
      <TouchableOpacity 
        onPress={() => {
          Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete?.(transaction.id) }
          ]);
        }}
        style={[styles.rightAction, { backgroundColor: colors.dangerGlow }]}
      >
        <Animated.View style={{ transform: [{ translateX: trans }] }}>
          <Ionicons name="trash-outline" size={24} color={colors.danger} />
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderLeftActions={onEdit ? renderLeftActions : undefined}
      renderRightActions={onDelete ? renderRightActions : undefined}
      friction={2}
      leftThreshold={40}
      rightThreshold={40}
    >
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
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Swipeable>
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
  leftAction: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    paddingLeft: 20,
    maxWidth: 80,
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    paddingRight: 20,
    maxWidth: 80,
  },
});
