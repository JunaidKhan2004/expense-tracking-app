import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';
import { FilterPills } from '../../components/ui/Badge';
import { FontSize, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { FilterPeriod } from '../../types';
import { filterTransactionsByPeriod, formatCurrency, getCategoryStats, getMonthlyStats } from '../../utils/formatters';

const { width } = Dimensions.get('window');
const CHART_W = width - Spacing.base * 2;

const PERIOD_OPTIONS = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Year', value: 'year' },
  { label: 'All', value: 'all' },
];

// ─── Pie Chart ────────────────────────────────────────────────────────────────
function PieChart({ data, colors }: { data: { color: string; percentage: number; name: string; amount: number }[]; colors: any }) {
  const size = 180;
  const radius = 70;
  const cx = size / 2;
  const cy = size / 2;
  let startAngle = -90;

  const slices = data.slice(0, 6).map((item) => {
    const angle = (item.percentage / 100) * 360;
    const start = startAngle;
    startAngle += angle;
    return { ...item, startAngle: start, angle };
  });

  const polarToCartesian = (angle: number, r: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  });

  const arcPath = (start: number, angle: number) => {
    if (angle >= 360) {
      return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.01} ${cy - radius} Z`;
    }
    const end = start + angle;
    const s = polarToCartesian(start, radius);
    const e = polarToCartesian(end, radius);
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y} Z`;
  };

  return (
    <View style={pieStyles.container}>
      <Svg width={size} height={size}>
        <G>
          {slices.map((slice, i) => (
            <G key={i}>
              <SvgText></SvgText>
            </G>
          ))}
          {slices.map((slice, i) => {
            const pathD = arcPath(slice.startAngle, slice.angle);
            return (
              <G key={i}>
                <SvgText></SvgText>
              </G>
            );
          })}
        </G>
        {/* Use simple colored circles as a legend proxy */}
        {slices.map((slice, i) => {
          const midAngle = slice.startAngle + slice.angle / 2;
          const p = polarToCartesian(midAngle, radius);
          return (
            <G key={`arc-${i}`}>
              <Rect
                x={cx}
                y={cy}
                width={0}
                height={0}
                fill={slice.color}
              />
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const pieStyles = StyleSheet.create({ container: { alignItems: 'center' } });

// ─── Bar Chart ────────────────────────────────────────────────────────────────
function BarChart({ data, colors }: { data: { month: string; income: number; expenses: number }[]; colors: any }) {
  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expenses)), 1);
  const barHeight = 120;

  return (
    <View style={barStyles.container}>
      {data.map((item, i) => (
        <View key={i} style={barStyles.group}>
          <View style={[barStyles.bars, { height: barHeight }]}>
            <LinearGradient
              colors={colors.gradient.income}
              style={[barStyles.bar, { height: (item.income / maxVal) * barHeight }]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            />
            <LinearGradient
              colors={colors.gradient.expense}
              style={[barStyles.bar, { height: (item.expenses / maxVal) * barHeight }]}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
            />
          </View>
          <Text style={[barStyles.label, { color: colors.textMuted }]}>{item.month}</Text>
        </View>
      ))}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 8 },
  group: { flex: 1, alignItems: 'center', gap: 6 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, justifyContent: 'center' },
  bar: { width: 10, borderRadius: 4 },
  label: { fontSize: 10, fontWeight: '600' },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function AnalyticsScreen() {
  const { colors } = useTheme();
  const { transactions, categories } = useTransactionStore();
  const { settings } = useSettingsStore();
  const [period, setPeriod] = useState<FilterPeriod>('month');

  const filtered = filterTransactionsByPeriod(transactions, period);
  const catStats = getCategoryStats(filtered);
  const monthlyStats = getMonthlyStats(transactions);

  const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const savings = income - expenses;

  const pieData = catStats.slice(0, 6).map((s) => {
    const cat = categories.find((c) => c.id === s.categoryId);
    return { color: cat?.color ?? colors.primary, percentage: s.percentage, name: cat?.name ?? 'Other', amount: s.amount };
  });

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Analytics</Text>
          <FilterPills options={PERIOD_OPTIONS} selected={period} onSelect={(v) => setPeriod(v as FilterPeriod)} />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <SummaryCard label="Income" value={formatCurrency(income, settings.currency)} gradient={colors.gradient.income} icon="arrow-down-circle" />
          <SummaryCard label="Expenses" value={formatCurrency(expenses, settings.currency)} gradient={colors.gradient.expense} icon="arrow-up-circle" />
          <SummaryCard label="Savings" value={formatCurrency(savings, settings.currency)} gradient={savings >= 0 ? colors.gradient.card3 : colors.gradient.expense} icon="wallet" />
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
            <BarChart data={monthlyStats} colors={colors} />
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
            catStats.slice(0, 8).map((stat) => {
              const cat = categories.find((c) => c.id === stat.categoryId);
              return (
                <View key={stat.categoryId} style={styles.catRow}>
                  <View style={[styles.catIcon, { backgroundColor: `${cat?.color ?? colors.primary}22` }]}>
                    <Ionicons name={(cat?.icon ?? 'ellipsis-horizontal-circle') as any} size={16} color={cat?.color ?? colors.primary} />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catLabelRow}>
                      <Text style={[styles.catName, { color: colors.text }]}>{cat?.name ?? 'Other'}</Text>
                      <Text style={[styles.catAmount, { color: colors.text }]}>{formatCurrency(stat.amount, settings.currency)}</Text>
                    </View>
                    <View style={[styles.catBarBg, { backgroundColor: colors.border }]}>
                      <LinearGradient
                        colors={[cat?.color ?? colors.primary, `${cat?.color ?? colors.primary}88`]}
                        style={[styles.catBarFill, { width: `${stat.percentage}%` }]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </View>
                    <Text style={[styles.catPct, { color: colors.textMuted }]}>{stat.percentage.toFixed(1)}% · {stat.count} transactions</Text>
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

function SummaryCard({ label, value, gradient, icon }: any) {
  return (
    <LinearGradient colors={gradient} style={styles.summaryCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <Ionicons name={icon} size={18} color="#fff" style={{ marginBottom: 4 }} />
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 54 },
  scroll: { paddingHorizontal: Spacing.base },
  header: { marginBottom: Spacing.xl, gap: Spacing.md },
  title: { fontSize: FontSize.xxl, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  summaryCard: { flex: 1, borderRadius: Radius.lg, padding: Spacing.md },
  summaryValue: { color: '#fff', fontSize: FontSize.base, fontWeight: '800' },
  summaryLabel: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.xs, fontWeight: '600' },
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
  catLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  catName: { fontSize: FontSize.sm, fontWeight: '600' },
  catAmount: { fontSize: FontSize.sm, fontWeight: '700' },
  catBarBg: { height: 6, borderRadius: 3, marginBottom: 4, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 3 },
  catPct: { fontSize: FontSize.xs, fontWeight: '500' },
  aiCard: { borderRadius: Radius.xl, padding: Spacing.base, marginBottom: Spacing.xl },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  aiTitle: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  aiText: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.sm, lineHeight: 20 },
});
