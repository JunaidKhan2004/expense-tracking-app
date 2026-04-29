import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { TransactionItem } from '../../components/transaction/TransactionItem';
import { FilterPills } from '../../components/ui/Badge';
import { formatDate } from '../../utils/formatters';
import { Spacing, FontSize, Radius } from '../../constants/theme';
import { FilterPeriod } from '../../types';

const PERIOD_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Today', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
];

const TYPE_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
];

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const { filteredTransactions, filterPeriod, setFilterPeriod, setSearchQuery, searchQuery, deleteTransaction } = useTransactionStore();
  const [typeFilter, setTypeFilter] = useState('all');

  const all = filteredTransactions();
  const filtered = typeFilter === 'all' ? all : all.filter((t) => t.type === typeFilter);

  // Group by date label
  const grouped: { title: string; data: typeof filtered }[] = [];
  const dateMap: Record<string, typeof filtered> = {};
  filtered.forEach((t) => {
    const label = formatDate(t.date);
    if (!dateMap[label]) dateMap[label] = [];
    dateMap[label].push(t);
  });
  Object.entries(dateMap).forEach(([title, data]) => grouped.push({ title, data }));

  const flatList: Array<{ type: 'header'; title: string } | { type: 'item'; transaction: (typeof filtered)[0] }> = [];
  grouped.forEach(({ title, data }) => {
    flatList.push({ type: 'header', title });
    data.forEach((t) => flatList.push({ type: 'item', transaction: t }));
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/transaction/add')} style={[styles.addBtn, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}>
          <Ionicons name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Period Filter */}
      <View style={styles.filterSection}>
        <FilterPills
          options={PERIOD_OPTIONS}
          selected={filterPeriod}
          onSelect={(v) => setFilterPeriod(v as FilterPeriod)}
        />
      </View>

      {/* Type Filter */}
      <View style={styles.filterSection}>
        <FilterPills options={TYPE_OPTIONS} selected={typeFilter} onSelect={setTypeFilter} />
      </View>

      {/* List */}
      {flatList.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>No transactions found</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>Try adjusting filters or add a new transaction.</Text>
        </View>
      ) : (
        <FlatList
          data={flatList}
          keyExtractor={(item, i) => (item.type === 'header' ? `h-${item.title}` : `t-${item.transaction.id}`)}
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <View style={styles.dateHeader}>
                  <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>{item.title}</Text>
                </View>
              );
            }
            return (
              <TransactionItem
                transaction={item.transaction}
                onPress={(t) => router.push(`/transaction/${t.id}`)}
                onDelete={deleteTransaction}
                showDate
              />
            );
          }}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 54 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.base },
  title: { fontSize: FontSize.xxl, fontWeight: '800' },
  addBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.base, borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: Spacing.md, height: 48, gap: Spacing.sm, marginBottom: Spacing.md },
  searchInput: { flex: 1, fontSize: FontSize.base },
  filterSection: { paddingHorizontal: Spacing.base, marginBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 100 },
  dateHeader: { marginTop: Spacing.base, marginBottom: Spacing.xs },
  dateLabel: { fontSize: FontSize.sm, fontWeight: '700', letterSpacing: 0.3 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.xxl },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  emptySubtitle: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});
