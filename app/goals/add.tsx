import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SelectionModal } from '../../components/ui/SelectionModal';
import { FontSize, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useGoalStore } from '../../store/useGoalStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { showToast } from '../../utils/toast';

const GOAL_ICONS = [
  { id: 'car', label: 'Car', icon: 'car-outline' },
  { id: 'home', label: 'Home', icon: 'home-outline' },
  { id: 'airplane', label: 'Travel', icon: 'airplane-outline' },
  { id: 'gift', label: 'Gift', icon: 'gift-outline' },
  { id: 'laptop', label: 'Gadget', icon: 'laptop-outline' },
  { id: 'school', label: 'Education', icon: 'school-outline' },
  { id: 'briefcase', label: 'Work', icon: 'briefcase-outline' },
  { id: 'heart', label: 'Health', icon: 'heart-outline' },
  { id: 'cafe', label: 'Lifestyle', icon: 'cafe-outline' },
  { id: 'bicycle', label: 'Sports', icon: 'bicycle-outline' },
];

const GOAL_COLORS = [
  { id: '#4F46E5', label: 'Indigo', icon: 'stop', iconColor: '#4F46E5' },
  { id: '#06B6D4', label: 'Cyan', icon: 'stop', iconColor: '#06B6D4' },
  { id: '#10B981', label: 'Emerald', icon: 'stop', iconColor: '#10B981' },
  { id: '#F59E0B', label: 'Amber', icon: 'stop', iconColor: '#F59E0B' },
  { id: '#EF4444', label: 'Red', icon: 'stop', iconColor: '#EF4444' },
  { id: '#8B5CF6', label: 'Violet', icon: 'stop', iconColor: '#8B5CF6' },
  { id: '#EC4899', label: 'Pink', icon: 'stop', iconColor: '#EC4899' },
  { id: '#F97316', label: 'Orange', icon: 'stop', iconColor: '#F97316' },
];

export default function AddGoalScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { goals, addGoal, updateGoal } = useGoalStore();
  const { settings } = useSettingsStore();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('flag-outline');
  const [color, setColor] = useState('#4F46E5');
  
  const [isIconModalVisible, setIsIconModalVisible] = useState(false);
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const goal = goals.find(g => g.id === id);
      if (goal) {
        setName(goal.name);
        setTargetAmount(goal.targetAmount.toString());
        setCurrentAmount(goal.currentAmount.toString());
        setDeadline(goal.deadline ?? '');
        setIcon(goal.icon);
        setColor(goal.color);
      }
    }
  }, [id]);

  const handleSave = async () => {
    if (!name.trim()) return showToast.error('Missing Name', 'Please enter a goal name');

    const target = Number(targetAmount);
    const current = Number(currentAmount) || 0;

    if (!targetAmount || isNaN(target) || target <= 0)
      return showToast.error('Invalid Amount', 'Please enter a valid target amount');
    if (current < 0)
      return showToast.error('Invalid Savings', 'Initial savings cannot be negative');
    if (current > target)
      return showToast.error('Invalid Savings', 'Initial savings cannot exceed the target amount');
    if (deadline && isNaN(new Date(deadline).getTime()))
      return showToast.error('Invalid Date', 'Please enter a valid deadline date (YYYY-MM-DD)');

    setIsSubmitting(true);
    try {
      const goalData = {
        name: name.trim(),
        targetAmount: target,
        currentAmount: current,
        deadline: deadline.trim() || undefined,
        icon,
        color,
      };

      if (id) {
        await updateGoal(id, goalData);
        showToast.success('Goal Updated', 'Your changes have been saved');
      } else {
        await addGoal(goalData);
        showToast.success('Goal Created', 'Start saving for your dream!');
      }
      router.back();
    } catch (err) {
      showToast.error('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {id ? 'Edit Goal' : 'New Financial Goal'}
        </Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + Spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Visual Preview */}
          <View style={styles.preview}>
            <View style={[styles.iconBox, { backgroundColor: `${color}22` }]}>
              <Ionicons name={icon as any} size={40} color={color} />
            </View>
            <Text style={[styles.previewName, { color: colors.text }]}>
              {name || 'Goal Name'}
            </Text>
            <Text style={[styles.previewSub, { color: colors.textSecondary }]}>
              Target: {settings.currency} {targetAmount || '0'}
            </Text>
          </View>

          <Input
            label="Goal Name"
            placeholder="e.g. New Macbook Pro"
            value={name}
            onChangeText={setName}
            leftIcon="flag-outline"
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Input
                label="Target Amount"
                placeholder="0.00"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="numeric"
                leftIcon="cash-outline"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Input
                label="Initial Savings"
                placeholder="0.00"
                value={currentAmount}
                onChangeText={setCurrentAmount}
                keyboardType="numeric"
                leftIcon="wallet-outline"
              />
            </View>
          </View>

          <Input
            label="Deadline (Optional)"
            placeholder="YYYY-MM-DD"
            value={deadline}
            onChangeText={setDeadline}
            leftIcon="calendar-outline"
          />

          <View style={styles.selectors}>
            <TouchableOpacity
              style={[styles.selector, { borderColor: colors.border }]}
              onPress={() => setIsIconModalVisible(true)}
            >
              <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>Icon</Text>
              <View style={styles.selectorValue}>
                <Ionicons name={icon as any} size={20} color={colors.text} />
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.selector, { borderColor: colors.border }]}
              onPress={() => setIsColorModalVisible(true)}
            >
              <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>Color</Text>
              <View style={styles.selectorValue}>
                <View style={[styles.colorDot, { backgroundColor: color }]} />
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Button 
          title={id ? "Save Changes" : "Create Goal"} 
          onPress={handleSave}
          loading={isSubmitting}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>

      {/* Modals */}
      <SelectionModal
        visible={isIconModalVisible}
        onClose={() => setIsIconModalVisible(false)}
        title="Select Icon"
        options={GOAL_ICONS}
        onSelect={(opt) => setIcon(opt.icon!)}
        selectedValue={GOAL_ICONS.find(i => i.icon === icon)?.id}
      />

      <SelectionModal
        visible={isColorModalVisible}
        onClose={() => setIsColorModalVisible(false)}
        title="Select Color"
        options={GOAL_COLORS}
        onSelect={(opt) => setColor(opt.id)}
        selectedValue={color}
      />
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
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
  },
  form: {
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
    gap: Spacing.md,
  },
  preview: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  previewName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    marginBottom: 4,
  },
  previewSub: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  selectors: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  selector: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  selectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  colorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
