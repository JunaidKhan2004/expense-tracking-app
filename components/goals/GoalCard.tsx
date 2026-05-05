import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Radius, Shadow, Spacing, FontSize } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { SavingGoal } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { ProgressBar } from '../ui/ProgressBar';

interface GoalCardProps {
  goal: SavingGoal;
  onPress: (goal: SavingGoal) => void;
  currency: string;
}

export function GoalCard({ goal, onPress, currency }: GoalCardProps) {
  const { colors } = useTheme();
  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress(goal)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: `${goal.color}22` }]}>
          <Ionicons name={goal.icon as any} size={24} color={goal.color} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.text }]}>{goal.name}</Text>
          <Text style={[styles.remaining, { color: colors.textSecondary }]}>
            {remaining <= 0 ? 'Goal Achieved! 🎉' : `${formatCurrency(remaining, currency)} remaining`}
          </Text>
        </View>
      </View>

      <View style={styles.amounts}>
        <Text style={[styles.current, { color: goal.color }]}>
          {formatCurrency(goal.currentAmount, currency)}
        </Text>
        <Text style={[styles.target, { color: colors.textSecondary }]}>
          of {formatCurrency(goal.targetAmount, currency)}
        </Text>
      </View>

      <ProgressBar progress={percentage} color={goal.color} height={10} />
      
      <View style={styles.footer}>
        <Text style={[styles.percentage, { color: colors.text }]}>
          {Math.round(percentage)}% Complete
        </Text>
        {goal.deadline && (
          <View style={styles.deadline}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
              {new Date(goal.deadline).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  remaining: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  current: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  target: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  percentage: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  deadline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
});
