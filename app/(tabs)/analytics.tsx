import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FilterPills } from '../../components/ui/Badge';
import { FontSize, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { FilterPeriod } from '../../types';
import { filterTransactionsByPeriod, formatCurrency, getCategoryStats, getMonthlyStats } from '../../utils/formatters';

const { width } = Dimensions.get('window');

const PERIOD_OPTIONS = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'All', value: 'all' },
];

// ─── Animated Bar Chart ───────────────────────────────────────────────────────
const BAR_H = 140;

function BarChart({ data, colors }: {
  data: { month: string; income: number; expenses: number }[];
  colors: any;
}) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expenses)), 1);

  // One Animated.Value per bar per type — recreated when data length changes via key prop
  const anims = useRef(
    data.map(() => ({ inc: new Animated.Value(0), exp: new Animated.Value(0) }))
  ).current;

  useEffect(() => {
    anims.forEach((a) => { a.inc.setValue(0); a.exp.setValue(0); });
    const animations = data.flatMap((item, i) => {
      const a = anims[i];
      if (!a) return [];
      return [
        Animated.timing(a.inc, {
          toValue: Math.max((item.income / maxVal) * BAR_H, item.income > 0 ? 4 : 0),
          duration: 550,
          delay: i * 55,
          useNativeDriver: false,
        }),
        Animated.timing(a.exp, {
          toValue: Math.max((item.expenses / maxVal) * BAR_H, item.expenses > 0 ? 4 : 0),
          duration: 550,
          delay: i * 55 + 35,
          useNativeDriver: false,
        }),
      ];
    });
    Animated.parallel(animations).start();
  }, [data]);

  return (
    <View style={barStyles.container}>
      {data.map((item, i) => {
        const a = anims[i] ?? { inc: new Animated.Value(0), exp: new Animated.Value(0) };
        return (
          <View key={i} style={barStyles.group}>
            <View style={[barStyles.bars, { height: BAR_H }]}>
              <Animated.View style={[barStyles.bar, { height: a.inc }]}>
                <LinearGradient
                  colors={colors.gradient.income}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                />
              </Animated.View>
              <Animated.View style={[barStyles.bar, { height: a.exp }]}>
                <LinearGradient
                  colors={colors.gradient.expense}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 0, y: 0 }}
                />
              </Animated.View>
            </View>
            <Text style={[barStyles.label, { color: colors.textMuted }]}>{item.month}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingTop: 8, paddingBottom: 4 },
  group: { flex: 1, alignItems: 'center', gap: 6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, justifyContent: 'center' },
  bar: { width: 11, borderTopLeftRadius: 5, borderTopRightRadius: 5, overflow: 'hidden', minHeight: 0 },
  label: { fontSize: 10, fontWeight: '600' },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { transactions, categories, hydrate } = useTransactionStore();
  const { settings } = useSettingsStore();
  const [period, setPeriod] = useState<FilterPeriod>('month');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = filterTransactionsByPeriod(transactions, period);
  const catStats = getCategoryStats(filtered);
  const monthlyStats = getMonthlyStats(transactions);

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;

  // Previous month for trend arrows (always vs last calendar month)
  const { prevIncome, prevExpenses } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    const prev = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
    return {
      prevIncome: prev.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      prevExpenses: prev.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
    };
  }, [transactions]);

  const incomeTrend = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : null;
  const expenseTrend = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : null;
  const savingsTrend = prevIncome > 0 || prevExpenses > 0
    ? ((savings - (prevIncome - prevExpenses)) / Math.max(Math.abs(prevIncome - prevExpenses), 1)) * 100
    : null;

  const onRefresh = async () => {
    setRefreshing(true);
    await hydrate();
    setRefreshing(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          <FilterPills options={PERIOD_OPTIONS} selected={period} onSelect={(v) => setPeriod(v as FilterPeriod)} />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard
            label="Income"
            value={formatCurrency(income, settings.currency)}
            gradient={colors.gradient.income}
            icon="arrow-down-circle"
            trend={period === 'month' ? incomeTrend : null}
            trendPositiveIsGood
          />
          <SummaryCard
            label="Expenses"
            value={formatCurrency(expenses, settings.currency)}
            gradient={colors.gradient.expense}
            icon="arrow-up-circle"
            trend={period === 'month' ? expenseTrend : null}
            trendPositiveIsGood={false}
          />
          <SummaryCard
            label="Savings"
            value={formatCurrency(savings, settings.currency)}
            gradient={savings >= 0 ? colors.gradient.card3 : colors.gradient.expense}
            icon="wallet"
            trend={period === 'month' ? savingsTrend : null}
            trendPositiveIsGood
          />
        </View>

        {/* Monthly Bar Chart */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Income vs Expenses</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Expenses</Text>
            </View>
          </View>
          {monthlyStats.length > 0 ? (
            <BarChart key={period} data={monthlyStats} colors={colors} />
          ) : (
            <View style={styles.noData}>
              <Ionicons name="bar-chart-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.noDataText, { color: colors.textMuted }]}>No data yet</Text>
            </View>
          )}
        </View>

        {/* Category Breakdown */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Spending by Category</Text>
          {catStats.length === 0 ? (
            <View style={styles.noData}>
              <Ionicons name="pie-chart-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.noDataText, { color: colors.textMuted }]}>No expenses yet</Text>
            </View>
          ) : (
            catStats.slice(0, 8).map((stat, idx) => {
              const cat = categories.find((c) => c.id === stat.categoryId);
              return (
                <View key={stat.categoryId} style={[styles.catRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: Spacing.md }]}>
                  <View style={[styles.catIcon, { backgroundColor: `${cat?.color ?? colors.primary}22` }]}>
                    <Ionicons name={(cat?.icon ?? 'ellipsis-horizontal-circle') as any} size={16} color={cat?.color ?? colors.primary} />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={[styles.catName, { color: colors.text }]}>{cat?.name ?? 'Other'}</Text>
                      <View style={styles.catRight}>
                        <Text style={[styles.catAmount, { color: colors.text }]}>{formatCurrency(stat.amount, settings.currency)}</Text>
                        <Text style={[styles.catPct, { color: colors.textMuted }]}>{stat.percentage.toFixed(0)}%</Text>
                      </View>
                    </View>
                    <View style={[styles.catBarBg, { backgroundColor: colors.border }]}>
                      <LinearGradient
                        colors={[cat?.color ?? colors.primary, `${cat?.color ?? colors.primary}88`]}
                        style={[styles.catBarFill, { width: `${stat.percentage}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    <Text style={[styles.catCount, { color: colors.textMuted }]}>{stat.count} transaction{stat.count !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* AI Insights */}
        <LinearGradient colors={colors.gradient.primary} style={styles.aiCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.aiHeader}>
            <Ionicons name="sparkles" size={20} color="#fff" />
            <Text style={styles.aiTitle}>AI Insight</Text>
          </View>
          <Text style={styles.aiText}>
            {expenses > income
              ? `You've overspent by ${formatCurrency(expenses - income, settings.currency)} this period. Consider reducing discretionary spending.`
              : savings > 0
                ? `Great job! You've saved ${formatCurrency(savings, settings.currency)} (${Math.round((savings / income) * 100)}% of income). Keep it up!`
                : 'Add more transactions to get personalized spending insights.'}
          </Text>
        </LinearGradient>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

// ─── Summary Card with trend arrow ───────────────────────────────────────────
function SummaryCard({ label, value, gradient, icon, trend, trendPositiveIsGood }: {
  label: string;
  value: string;
  gradient: string[];
  icon: string;
  trend: number | null;
  trendPositiveIsGood: boolean;
}) {
  const isPositive = (trend ?? 0) >= 0;
  const trendIsGood = trendPositiveIsGood ? isPositive : !isPositive;

  return (
    <LinearGradient colors={gradient} style={styles.summaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Ionicons name={icon as any} size={18} color="#fff" style={{ marginBottom: 6 }} />
      <Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
      {trend !== null && (
        <View style={styles.trendRow}>
          <Ionicons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={11}
            color={trendIsGood ? 'rgba(255,255,255,0.95)' : 'rgba(255,200,200,0.9)'}
          />
          <Text style={[styles.trendText, { color: trendIsGood ? 'rgba(255,255,255,0.9)' : 'rgba(255,200,200,0.9)' }]}>
            {Math.abs(trend).toFixed(0)}% vs last mo
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 54 },
  scroll: { paddingHorizontal: Spacing.base },
  header: { marginBottom: Spacing.xl, gap: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  summaryCard: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: 2 },
  summaryValue: { color: '#fff', fontSize: FontSize.sm, fontWeight: '800' },
  summaryLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 4 },
  trendText: { fontSize: 9, fontWeight: '700' },
  card: { borderRadius: Radius.xl, padding: Spacing.base, borderWidth: 1, marginBottom: Spacing.xl },
  cardTitle: { fontSize: FontSize.base, fontWeight: '700', marginBottom: Spacing.md },
  chartLegend: { flexDirection: 'row', gap: Spacing.base, marginBottom: Spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: FontSize.xs, fontWeight: '500' },
  noData: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  noDataText: { fontSize: FontSize.sm, fontWeight: '500' },
  catRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.md },
  catIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  catInfo: { flex: 1 },
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catName: { fontSize: FontSize.sm, fontWeight: '600' },
  catAmount: { fontSize: FontSize.sm, fontWeight: '700' },
  catPct: { fontSize: FontSize.xs, fontWeight: '600' },
  catBarBg: { height: 6, borderRadius: 3, marginBottom: 4, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3 },
  catCount: { fontSize: FontSize.xs, fontWeight: '500' },
  aiCard: { borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.xl },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  aiTitle: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  aiText: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.sm, lineHeight: 20 },
});
