import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontSize, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useWalletStore } from '../../store/useWalletStore';
import { formatCurrencyFull, formatDate, formatTime } from '../../utils/formatters';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { transactions, categories, deleteTransaction, isLoading } = useTransactionStore();
  const { wallets } = useWalletStore();
  const { settings } = useSettingsStore();

  const transaction = transactions.find((t) => t.id === id);

  // Show loading while store is hydrating to avoid a "not found" flash
  if (isLoading) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Ionicons name="hourglass-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Loading...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Transaction not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontWeight: '700', marginTop: 8 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = categories.find((c) => c.id === transaction.categoryId);
  const wallet = wallets.find((w) => w.id === transaction.walletId);
  const isIncome = transaction.type === 'income';
  const gradient = isIncome ? colors.gradient.income : colors.gradient.expense;
  const amountColor = isIncome ? colors.success : colors.danger;

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(transaction.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="close" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction Detail</Text>
          <TouchableOpacity onPress={handleDelete} style={[styles.backBtn, { backgroundColor: colors.dangerGlow, borderColor: colors.danger }]}>
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>

        {/* Amount Hero */}
        <LinearGradient colors={gradient} style={styles.heroCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.heroDecor1} />
          <View style={styles.heroDecor2} />
          <View style={[styles.catIcon, { backgroundColor: `${category?.color ?? colors.primary}33` }]}>
            <Ionicons name={(category?.icon ?? 'ellipsis-horizontal-circle') as any} size={28} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>{transaction.title}</Text>
          <Text style={styles.heroAmount}>
            {isIncome ? '+' : '-'}{formatCurrencyFull(transaction.amount, settings.currency)}
          </Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroChip}>
              <Ionicons name={isIncome ? 'arrow-down-circle' : 'arrow-up-circle'} size={12} color="#fff" />
              <Text style={styles.heroChipText}>{isIncome ? 'INCOME' : 'EXPENSE'}</Text>
            </View>
            {transaction.isRecurring && (
              <View style={styles.heroChip}>
                <Ionicons name="refresh" size={12} color="#fff" />
                <Text style={styles.heroChipText}>RECURRING</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Details */}
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <DetailRow icon="calendar-outline" label="Date" value={formatDate(transaction.date)} colors={colors} />
          <DetailRow icon="time-outline" label="Time" value={formatTime(transaction.date)} colors={colors} />
          <DetailRow icon="pricetag-outline" label="Category" value={category?.name ?? 'Unknown'} colors={colors} />
          <DetailRow icon="wallet-outline" label="Wallet" value={wallet?.name ?? 'Unknown'} colors={colors} last />
        </View>

        {transaction.notes && (
          <View style={[styles.notesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>Notes</Text>
            </View>
            <Text style={[styles.notesText, { color: colors.text }]}>{transaction.notes}</Text>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteBtn, { backgroundColor: colors.dangerGlow, borderColor: colors.danger }]}
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Text style={[styles.deleteBtnText, { color: colors.danger }]}>Delete Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value, colors, last }: any) {
  return (
    <View style={[styles.detailRow, !last && { borderBottomWidth: 1, borderColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 16 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.base },
  scroll: { paddingHorizontal: Spacing.base, paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  headerTitle: { fontSize: FontSize.base, fontWeight: '700' },
  backBtn: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  notFoundText: { fontSize: FontSize.base },
  heroCard: { borderRadius: Radius.xxl, padding: Spacing.xl, alignItems: 'center', marginBottom: Spacing.xl, overflow: 'hidden' },
  heroDecor1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, top: -50, right: -50, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroDecor2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, bottom: -30, left: 20, backgroundColor: 'rgba(255,255,255,0.06)' },
  catIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  heroTitle: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.base, fontWeight: '600', marginBottom: 8 },
  heroAmount: { color: '#fff', fontSize: 40, fontWeight: '900', letterSpacing: -1 },
  heroMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  heroChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  heroChipText: { color: '#fff', fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5 },
  detailCard: { borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.base },
  detailLabel: { flex: 1, fontSize: FontSize.sm, fontWeight: '600' },
  detailValue: { fontSize: FontSize.sm, fontWeight: '700' },
  notesCard: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.base, marginBottom: Spacing.md },
  notesHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  notesLabel: { fontSize: FontSize.sm, fontWeight: '600' },
  notesText: { fontSize: FontSize.base, lineHeight: 22 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, height: 52, borderRadius: Radius.xl, borderWidth: 1.5, marginTop: Spacing.md },
  deleteBtnText: { fontSize: FontSize.base, fontWeight: '700' },
});
