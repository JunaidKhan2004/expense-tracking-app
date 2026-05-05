import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useGoalStore } from '../../store/useGoalStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatCurrency } from '../../utils/formatters';
import { showToast } from '../../utils/toast';

export default function GoalDetailScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, contribute, deleteGoal } = useGoalStore();
  const { settings } = useSettingsStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const goal = goals.find(g => g.id === id);

  if (!goal) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Goal not found</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const percentage = (goal.currentAmount / goal.targetAmount) * 100;
  const remaining = goal.targetAmount - goal.currentAmount;

  const handleContribute = async () => {
    if (!amount || Number(amount) <= 0) return;
    setIsSubmitting(true);
    try {
      await contribute(goal.id, Number(amount));
      showToast.success('Saved!', `You've added ${formatCurrency(Number(amount), settings.currency)} to ${goal.name}`);
      setIsModalVisible(false);
      setAmount('');
    } catch (err) {
      showToast.error('Error', 'Failed to update goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteGoal(goal.id);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Goal Details</Text>
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/goals/add', params: { id: goal.id } })}
          style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="create-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.topSection}>
          <View style={[styles.iconBox, { backgroundColor: `${goal.color}` }]}>
            <Ionicons name={goal.icon as any} size={48} color={"white"} />
          </View>
          <Text style={[styles.goalName, { color: colors.text }]}>{goal.name}</Text>
          <Text style={[styles.goalTarget, { color: colors.textSecondary }]}>
            Target: {formatCurrency(goal.targetAmount, settings.currency)}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>Your Progress</Text>
            <Text style={[styles.progressPct, { color: goal.color }]}>{Math.round(percentage)}%</Text>
          </View>

          <ProgressBar progress={percentage} color={goal.color} height={16} />

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrency(goal.currentAmount, settings.currency)}
              </Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Remaining</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatCurrency(Math.max(0, remaining), settings.currency)}
              </Text>
            </View>
          </View>
        </View>

        {remaining > 0 ? (
          <Button
            title="Add Funds"
            onPress={() => setIsModalVisible(true)}
            style={{ marginVertical: Spacing.xl }}
            icon={<Ionicons name="add-circle-outline" size={20} color="#fff" />}
          />
        ) : (
          <View style={[styles.achievedBox, { backgroundColor: `${colors.success}11`, borderColor: colors.success }]}>
            <Ionicons name="trophy" size={32} color={colors.success} />
            <Text style={[styles.achievedTitle, { color: colors.success }]}>Goal Achieved!</Text>
            <Text style={[styles.achievedSub, { color: colors.textSecondary }]}>
              Congratulations! You've successfully saved for this goal.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={[styles.deleteText, { color: colors.danger }]}>Delete Goal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Contribution Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Funds</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              How much would you like to save towards "{goal.name}"?
            </Text>

            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.currencyPrefix, { color: colors.textSecondary }]}>{settings.currency}</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.borderLight }]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={handleContribute}
                disabled={isSubmitting}
              >
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
    paddingBottom: 100,
  },
  topSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconBox: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  goalName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  card: {
    padding: Spacing.xl,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    ...Shadow.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  progressPct: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    height: 30,
    marginHorizontal: Spacing.md,
  },
  achievedBox: {
    padding: Spacing.xl,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  achievedTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginTop: Spacing.md,
    marginBottom: 4,
  },
  achievedSub: {
    fontSize: FontSize.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: Spacing.xxl,
  },
  deleteText: {
    fontSize: FontSize.base,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    padding: Spacing.xl,
    borderRadius: Radius.xxl,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: FontSize.base,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
  },
  currencyPrefix: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalBtn: {
    flex: 1,
    height: 52,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
});
