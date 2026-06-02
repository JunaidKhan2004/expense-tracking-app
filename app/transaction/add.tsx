import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Animated, TextInput, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useWalletStore } from '../../store/useWalletStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { TransactionType, Transaction } from '../../types';
import { Spacing, FontSize, Radius } from '../../constants/theme';
import { showToast } from '../../utils/toast';
import { useLocalSearchParams } from 'expo-router';

export default function AddTransactionScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id?: string, amount?: string, title?: string, category?: string, scanMode?: string }>();
  const id = params.id;
  const { addTransaction, updateTransaction, transactions, categories } = useTransactionStore();
  const { wallets, adjustBalance } = useWalletStore();
  const { settings } = useSettingsStore();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(wallets[0]?.id ?? '');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEdit = !!id;
  const transactionToEdit = isEdit ? transactions.find(t => t.id === id) : null;

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
    ]).start();

    if (isEdit && transactionToEdit) {
      setType(transactionToEdit.type);
      setAmount(transactionToEdit.amount.toString());
      setTitle(transactionToEdit.title);
      setNotes(transactionToEdit.notes ?? '');
      setSelectedCategory(transactionToEdit.categoryId);
      setSelectedWallet(transactionToEdit.walletId);
      setIsRecurring(transactionToEdit.isRecurring);
    } else if (params.scanMode === 'true') {
      if (params.amount) setAmount(params.amount);
      if (params.title) setTitle(params.title);
      if (params.category) {
        const cat = categories.find(c => c.id === params.category || c.name.toLowerCase() === params.category.toLowerCase());
        if (cat) setSelectedCategory(cat.id);
      }
    }
  }, [isEdit, transactionToEdit, params.scanMode]);

  const filteredCategories = categories.filter((c) => c.type === type || c.type === 'both');

  const MAX_TRANSACTION_AMOUNT = 1_000_000_000;

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || !isFinite(numAmount) || numAmount <= 0) {
      showToast.error('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    if (numAmount > MAX_TRANSACTION_AMOUNT) {
      showToast.error('Amount Too Large', 'Amount cannot exceed 1,000,000,000');
      return;
    }
    if (!title.trim()) { 
      showToast.error('Missing Title', 'Please enter a title'); 
      return; 
    }
    if (!selectedCategory) { 
      showToast.error('No Category', 'Please select a category'); 
      return; 
    }

    setIsSaving(true);
    try {
      if (isEdit && id && transactionToEdit) {
        await updateTransaction(id, {
          type,
          amount: numAmount,
          categoryId: selectedCategory,
          walletId: selectedWallet,
          title: title.trim(),
          notes: notes.trim() || undefined,
          isRecurring,
        });

        // Always reverse the old transaction's effect, then apply the new one.
        // This handles all change combinations: amount, type, or wallet switch.
        const oldReverseType = transactionToEdit.type === 'income' ? 'expense' : 'income';
        await adjustBalance(transactionToEdit.walletId, transactionToEdit.amount, oldReverseType);
        await adjustBalance(selectedWallet, numAmount, type);

        showToast.success('Transaction Updated', 'Changes saved successfully');
      } else {
        await addTransaction({
          type,
          amount: numAmount,
          categoryId: selectedCategory,
          walletId: selectedWallet,
          title: title.trim(),
          notes: notes.trim() || undefined,
          date: new Date().toISOString(),
          isRecurring,
        });

        await adjustBalance(selectedWallet, numAmount, type);
        showToast.success('Transaction Saved', `${type === 'income' ? 'Income' : 'Expense'} added successfully`);
      }
      
      setIsSaving(false);
      router.back();
    } catch (err) {
      showToast.error('Error', 'Failed to save transaction');
      setIsSaving(false);
    }
  };

  const isIncome = type === 'income';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Drag Handle */}
      <View style={[styles.handle, { backgroundColor: colors.border }]} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>{isEdit ? 'Edit Transaction' : 'Add Transaction'}</Text>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                style={{ opacity: isSaving ? 0.6 : 1 }}
              >
                <LinearGradient colors={colors.gradient.primary} style={styles.saveBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                  <Text style={styles.saveBtnText}>{isSaving ? '...' : 'Save'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Type Toggle */}
            <View style={[styles.typeToggle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {(['expense', 'income'] as TransactionType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => { setType(t); setSelectedCategory(''); }}
                  style={styles.typeOption}
                  activeOpacity={0.8}
                >
                  {type === t ? (
                    <LinearGradient
                      colors={t === 'income' ? colors.gradient.income : colors.gradient.expense}
                      style={styles.typeActive}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name={t === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'} size={16} color="#fff" />
                      <Text style={styles.typeActiveText}>{t === 'income' ? 'Income' : 'Expense'}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.typeInactive}>
                      <Ionicons name={t === 'income' ? 'arrow-down-circle-outline' : 'arrow-up-circle-outline'} size={16} color={colors.textMuted} />
                      <Text style={[styles.typeInactiveText, { color: colors.textMuted }]}>{t === 'income' ? 'Income' : 'Expense'}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Amount */}
            <LinearGradient
              colors={isIncome ? colors.gradient.income : colors.gradient.expense}
              style={styles.amountCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.amountLabel}>Amount</Text>
              <View style={styles.amountRow}>
                <Text style={styles.currencySymbol}>
                  {settings.currency === 'USD' ? '$' : settings.currency === 'EUR' ? '€' : settings.currency === 'PKR' ? '₨' : '$'}
                </Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  maxLength={12}
                />
              </View>

              {!isEdit && (
                <TouchableOpacity
                  style={[styles.scanBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  onPress={() => router.push('/transaction/scan')}
                >
                  <Ionicons name="scan" size={14} color="#fff" />
                  <Text style={styles.scanBadgeText}>Scan Receipt</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>

            {/* Title */}
            <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="create-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                value={title}
                onChangeText={setTitle}
                placeholder="Transaction title"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Notes */}
            <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.border, alignItems: 'flex-start' }]}>
              <Ionicons name="document-text-outline" size={18} color={colors.textMuted} style={{ marginTop: 2 }} />
              <TextInput
                style={[styles.fieldInput, { color: colors.text }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes (optional)"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Category */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Category</Text>
            <View style={styles.catGrid}>
              {filteredCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.8}
                    style={[
                      styles.catChip,
                      {
                        backgroundColor: isSelected ? `${cat.color}33` : colors.card,
                        borderColor: isSelected ? cat.color : colors.border,
                      },
                    ]}
                  >
                    <Ionicons name={cat.icon as any} size={16} color={isSelected ? cat.color : colors.textMuted} />
                    <Text style={[styles.catChipText, { color: isSelected ? cat.color : colors.textSecondary }]} numberOfLines={1} ellipsizeMode="tail">
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Wallet */}
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Wallet</Text>
            <View style={styles.walletRow}>
              {wallets.map((w) => (
                <TouchableOpacity
                  key={w.id}
                  onPress={() => setSelectedWallet(w.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.walletChip,
                    {
                      backgroundColor: selectedWallet === w.id ? `${w.color}33` : colors.card,
                      borderColor: selectedWallet === w.id ? w.color : colors.border,
                    },
                  ]}
                >
                  <Ionicons name={w.icon as any} size={16} color={selectedWallet === w.id ? w.color : colors.textMuted} />
                  <Text style={[styles.walletChipText, { color: selectedWallet === w.id ? w.color : colors.textSecondary }]}>{w.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Recurring Toggle */}
            <TouchableOpacity
              onPress={() => setIsRecurring(!isRecurring)}
              style={[styles.recurringRow, { backgroundColor: colors.card, borderColor: isRecurring ? colors.primary : colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.recurringIcon, { backgroundColor: isRecurring ? colors.primaryGlow : colors.border + '44' }]}>
                <Ionicons name="refresh" size={18} color={isRecurring ? colors.primary : colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recurringLabel, { color: colors.text }]}>Recurring Transaction</Text>
                <Text style={[styles.recurringSub, { color: colors.textMuted }]}>Repeats every month automatically</Text>
              </View>
              <View style={[styles.checkBox, { backgroundColor: isRecurring ? colors.primary : 'transparent', borderColor: isRecurring ? colors.primary : colors.border }]}>
                {isRecurring && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          </Animated.View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 16 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.base },
  scroll: { paddingHorizontal: Spacing.base, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  title: { fontSize: FontSize.lg, fontWeight: '800' },
  closeBtn: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  saveBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.full },
  saveBtnText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
  typeToggle: { flexDirection: 'row', borderRadius: Radius.xl, borderWidth: 1, padding: 4, marginBottom: Spacing.xl },
  typeOption: { flex: 1 },
  typeActive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: Radius.lg, padding: Spacing.sm + 2 },
  typeActiveText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
  typeInactive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: Spacing.sm + 2 },
  typeInactiveText: { fontSize: FontSize.sm, fontWeight: '600' },
  amountCard: { borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.xl, alignItems: 'center' },
  amountLabel: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, fontWeight: '600', marginBottom: Spacing.sm },
  amountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  currencySymbol: { color: '#fff', fontSize: 32, fontWeight: '800', opacity: 0.9 },
  amountInput: { color: '#fff', fontSize: 48, fontWeight: '900', minWidth: 120, maxWidth: 220, textAlign: 'center' },
  scanBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, marginTop: Spacing.md },
  scanBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  field: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, marginBottom: Spacing.md },
  fieldInput: { flex: 1, fontSize: FontSize.base },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.3, marginBottom: Spacing.sm, marginTop: 4 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5 },
  catChipText: { fontSize: FontSize.xs, fontWeight: '600', flexShrink: 1 },
  walletRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  walletChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 2, borderRadius: Radius.full, borderWidth: 1.5 },
  walletChipText: { fontSize: FontSize.sm, fontWeight: '600' },
  recurringRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.xl, borderWidth: 1.5, padding: Spacing.md, marginBottom: Spacing.lg },
  recurringIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  recurringLabel: { fontSize: FontSize.base, fontWeight: '600' },
  recurringSub: { fontSize: FontSize.xs, marginTop: 2 },
  checkBox: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
});
