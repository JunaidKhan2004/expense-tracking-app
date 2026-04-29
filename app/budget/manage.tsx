import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { FontSize, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { formatCurrency } from '../../utils/formatters';
import { showToast } from '../../utils/toast';

const { width } = Dimensions.get('window');

export default function ManageBudgetsScreen() {
  const { colors } = useTheme();
  const { categories } = useTransactionStore();
  const { budgets, setBudget, deleteBudget } = useBudgetStore();
  const { settings } = useSettingsStore();

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both');

  const handleDeleteBudget = async () => {
    const budget = budgets.find(b => b.categoryId === selectedCat);
    if (!budget) return;

    try {
      await deleteBudget(budget.id);
      showToast.success('Budget Removed', 'Category limit has been deleted');
      setSelectedCat(null);
      setAmount('');
    } catch (err) {
      showToast.error('Error', 'Failed to delete budget');
    }
  };

  const handleSetBudget = async () => {
    if (!selectedCat || !amount || parseFloat(amount) <= 0) {
      showToast.error('Invalid Input', 'Please select a category and enter an amount');
      return;
    }

    try {
      await setBudget(selectedCat, parseFloat(amount));
      showToast.success('Budget Set', 'Category limit has been updated');
      setSelectedCat(null);
      setAmount('');
    } catch (err) {
      showToast.error('Error', 'Failed to save budget');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Manage Budgets</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SELECT CATEGORY</Text>
            <View style={styles.grid}>
              {expenseCategories.map((cat) => {
                const budget = budgets.find(b => b.categoryId === cat.id);
                const isSelected = selectedCat === cat.id;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setSelectedCat(cat.id);
                      setAmount(budget ? String(budget.amount) : '');
                    }}
                    style={[
                      styles.catCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderWidth: isSelected ? 2 : 1
                      }
                    ]}
                  >
                    <View style={[styles.iconBox, { backgroundColor: `${cat.color}22` }]}>
                      <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                    </View>
                    <Text style={[styles.catName, { color: colors.text }]} numberOfLines={1}>{cat.name}</Text>
                    {budget && (
                      <Text style={[styles.budgetVal, { color: colors.primary }]}>
                        {formatCurrency(budget.amount, settings.currency)}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {selectedCat && (
            <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
              <View style={styles.inputRow}>
                <View style={styles.inputWrapper}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Monthly Limit ({settings.currency})</Text>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    autoFocus
                    placeholder="0.00"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <View style={styles.actionBtns}>
                  {budgets.some(b => b.categoryId === selectedCat) && (
                    <TouchableOpacity onPress={handleDeleteBudget} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={24} color={colors.danger} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setSelectedCat(null)} style={styles.closeBtn}>
                    <Ionicons name="close-circle-outline" size={32} color={colors.textMuted} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSetBudget} style={styles.saveBtn}>
                    <Ionicons name="checkmark-circle" size={44} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.xl },
  backBtn: { marginRight: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: '800' },
  scroll: { paddingHorizontal: Spacing.base, paddingBottom: 40 },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  catCard: { width: (width - Spacing.base * 2 - Spacing.md) / 2, padding: Spacing.md, borderRadius: Radius.xl, gap: 8 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catName: { fontSize: FontSize.sm, fontWeight: '700' },
  budgetVal: { fontSize: FontSize.xs, fontWeight: '600' },
  footer: { padding: Spacing.lg, borderTopWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  inputWrapper: { flex: 1 },
  inputLabel: { fontSize: FontSize.xs, fontWeight: '600', marginBottom: 4 },
  input: { fontSize: FontSize.xl, fontWeight: '800' },
  actionBtns: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FF444415' },
  closeBtn: { padding: 4 },
  saveBtn: { padding: 0 },
});
