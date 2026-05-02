import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated, Dimensions, RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionItem } from '../../components/transaction/TransactionItem';
import { handleUnderDevelopment } from '../../components/ui/FeatureWrapper';
import { FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { useBudgetStore } from '../../store/useBudgetStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useWalletStore } from '../../store/useWalletStore';
import { generateAIInsights } from '../../utils/ai';
import { formatCurrency, formatCurrencyFull } from '../../utils/formatters';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuthStore();
  const { transactions, categories, filteredTransactions, totalIncome, totalExpenses, netBalance, hydrate, deleteTransaction, filterPeriod, searchQuery } = useTransactionStore();
  const { wallets, totalBalance } = useWalletStore();
  const { settings } = useSettingsStore();
  const { budgets, getBudgetsWithProgress, hydrate: hydrateBudgets } = useBudgetStore();
  const { unreadCount } = useNotificationStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const balanceScale = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const recentTransactions = useMemo(() => {
    return filteredTransactions().slice(0, 5);
  }, [transactions, filterPeriod, searchQuery]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.spring(balanceScale, { toValue: 1, tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });
  const pulseTranslate = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 15],
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([hydrate(), hydrateBudgets()]);
    setRefreshing(false);
  };

  const income = totalIncome();
  const expenses = totalExpenses();
  const savings = income - expenses;
  const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;

  const budgetProgress = getBudgetsWithProgress();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* ─── Header ──────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>{greeting}</Text>
            <Text style={[styles.userName, { color: colors.text }]}>{firstName}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push('/notifications' as any)}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              {unreadCount > 0 && (
                <View style={[styles.notifDot, { backgroundColor: colors.danger }]}>
                  <Text style={styles.notifCount}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.avatarCircle, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(tabs)/settings')}
            >
              <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ─── Balance Card ─────────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: balanceScale }], marginBottom: Spacing.xl }}>
          <LinearGradient colors={colors.gradient.primary} style={styles.balanceCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            {/* Decorative circles */}
            <Animated.View style={[styles.decorCircle1, { transform: [{ scale: pulseScale }, { translateY: pulseTranslate }] }]} />
            <Animated.View style={[styles.decorCircle2, { transform: [{ scale: pulseScale }, { translateY: pulseTranslate }] }]} />

            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatCurrencyFull(totalBalance(), settings.currency)}
            </Text>
            <Text style={styles.balanceSubtitle}>Across {wallets.length} account{wallets.length !== 1 ? 's' : ''}</Text>

            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <View style={styles.balanceStatIcon}>
                  <Ionicons name="arrow-down" size={14} color="#fff" />
                </View>
                <View>
                  <Text style={styles.balanceStatLabel}>Income</Text>
                  <Text style={styles.balanceStatValue}>{formatCurrency(income, settings.currency)}</Text>
                </View>
              </View>
              <View style={[styles.balanceDivider]} />
              <View style={styles.balanceStat}>
                <View style={[styles.balanceStatIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <Ionicons name="arrow-up" size={14} color="#fff" />
                </View>
                <View>
                  <Text style={styles.balanceStatLabel}>Expenses</Text>
                  <Text style={styles.balanceStatValue}>{formatCurrency(expenses, settings.currency)}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* ─── Quick Stats ──────────────────────────────────────────────────── */}
        <Animated.View style={[styles.row, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <StatCard
            label="Savings"
            value={formatCurrency(savings, settings.currency)}
            icon="trending-up"
            gradient={colors.gradient.income}
            colors={colors}
            sub={`${savingsRate}% of income`}
          />
          <StatCard
            label="Transactions"
            value={String(transactions.length)}
            icon="swap-horizontal"
            gradient={colors.gradient.primary}
            colors={colors}
            sub="This month"
          />
        </Animated.View>

        {/* ─── AI Smart Advisor ────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <AIAdvisorSection
            insights={generateAIInsights(transactions, categories, colors)}
            colors={colors}
            isDark={isDark}
          />
        </Animated.View>

        {/* ─── Wallets ──────────────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>My Wallets</Text>
            <TouchableOpacity onPress={() => router.push('/wallet/manage')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Manage</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.walletsRow}>
            {wallets.map((wallet) => (
              <LinearGradient
                key={wallet.id}
                colors={[wallet.color, `${wallet.color}99`]}
                style={styles.walletCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.walletIcon}>
                  <Ionicons name={wallet.icon as any} size={18} color="#fff" />
                </View>
                <Text style={styles.walletName}>{wallet.name}</Text>
                <Text style={styles.walletBalance}>
                  {formatCurrency(wallet.balance, settings.currency)}
                </Text>
                <Text style={styles.walletType}>{wallet.type.toUpperCase()}</Text>
              </LinearGradient>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ─── Budget Progress ─────────────────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Budgets</Text>
            <TouchableOpacity onPress={() => router.push('/budget/manage')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Set Budget</Text>
            </TouchableOpacity>
          </View>

          {budgetProgress.length === 0 ? (
            <View style={[styles.emptyBudget, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.emptyBudgetText, { color: colors.textMuted }]}>No budgets set for this month</Text>
              <TouchableOpacity onPress={() => router.push('/budget/manage')}>
                <Text style={[styles.emptyBudgetAction, { color: colors.primary }]}>Set your first budget</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.budgetList}>
              {budgetProgress.slice(0, 4).map((budget) => {
                const category = categories.find(c => c.id === budget.categoryId);
                const isOver = budget.percentage > 100;
                return (
                  <View key={budget.id} style={[styles.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.budgetInfo}>
                      <View style={[styles.budgetIcon, { backgroundColor: `${category?.color ?? colors.primary}22` }]}>
                        <Ionicons name={category?.icon as any ?? 'grid'} size={18} color={category?.color ?? colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.budgetName, { color: colors.text }]}>{category?.name ?? 'Category'}</Text>
                        <Text style={[styles.budgetSpent, { color: colors.textMuted }]}>
                          {formatCurrency(budget.spent, settings.currency)} of {formatCurrency(budget.amount, settings.currency)}
                        </Text>
                      </View>
                      <Text style={[styles.budgetPct, { color: isOver ? colors.danger : colors.text }]}>
                        {Math.round(budget.percentage)}%
                      </Text>
                    </View>
                    <View style={[styles.budgetProgressBg, { backgroundColor: colors.border }]}>
                      <View
                        style={[
                          styles.budgetProgressFill,
                          {
                            width: `${Math.min(budget.percentage, 100)}%`,
                            backgroundColor: isOver ? colors.danger : category?.color ?? colors.primary
                          }
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
              {budgetProgress.length > 4 && (
                <TouchableOpacity
                  style={[styles.seeMoreBtn, { borderColor: colors.border }]}
                  onPress={() => router.push('/budget/manage')}
                >
                  <Text style={[styles.seeMoreText, { color: colors.textSecondary }]}>View All {budgetProgress.length} Budgets</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}
        </Animated.View>

        {/* ─── Recent Transactions ──────────────────────────────────────────── */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>No transactions yet</Text>
              <TouchableOpacity onPress={() => router.push('/transaction/add')}>
                <Text style={[styles.emptyAction, { color: colors.primary }]}>Add your first one</Text>
              </TouchableOpacity>
            </View>
          ) : (
            recentTransactions.map((t) => (
              <TransactionItem
                key={t.id}
                transaction={t}
                onPress={(tx) => router.push(`/transaction/${tx.id}`)}
                onEdit={(tx) => router.push({ pathname: '/transaction/add', params: { id: tx.id } } as any)}
                onDelete={(id) => deleteTransaction(id)}
              />
            ))
          )}
          {filteredTransactions().length > 5 && (
            <TouchableOpacity
              style={[styles.seeMoreBtn, { borderColor: colors.border, marginTop: Spacing.md }]}
              onPress={() => router.push('/(tabs)/transactions')}
            >
              <Text style={[styles.seeMoreText, { color: colors.textSecondary }]}>View All {filteredTransactions().length} Transactions</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Bottom space for FAB */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

function AIAdvisorSection({ insights, colors, isDark }: any) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { user } = useAuthStore();
  const mainInsight = insights[0];

  return (
    <View style={[styles.aiContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {!user?.isPremium && (
        <View style={styles.aiLockOverlay}>
          <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={[styles.aiLockBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/premium')}
          >
            <Ionicons name="lock-closed" size={14} color="#fff" />
            <Text style={styles.aiLockText}>Unlock with Premium</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity
        style={[styles.aiHeader, !user?.isPremium && { opacity: 0.3 }]}
        onPress={() => user?.isPremium ? setIsExpanded(!isExpanded) : router.push('/premium')}
        activeOpacity={0.7}
      >
        <View style={[styles.aiIconBox, { backgroundColor: `${mainInsight.color}22` }]}>
          <Ionicons name="sparkles" size={18} color={mainInsight.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.aiLabel, { color: colors.textMuted }]}>AI SMART ADVISOR</Text>
          <Text style={[styles.aiMainTitle, { color: colors.text }]}>{mainInsight.title}</Text>
        </View>
        {user?.isPremium ? (
          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textMuted}
          />
        ) : (
          <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
        )}
      </TouchableOpacity>

      <Text style={[styles.aiMainDesc, { color: colors.textSecondary }]}>
        {mainInsight.description}
      </Text>

      {isExpanded && (
        <View style={styles.aiExpandedList}>
          {insights.slice(1).map((item: any, i: number) => (
            <View key={i} style={[styles.aiSubRow, { borderTopColor: colors.border }]}>
              <Ionicons name={item.icon} size={16} color={item.color} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.aiSubTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.aiSubDesc, { color: colors.textSecondary }]}>{item.description}</Text>
              </View>
            </View>
          ))}
          {!user?.isPremium && (
            <TouchableOpacity
              style={[styles.aiProBtn, { backgroundColor: colors.primaryGlow }]}
              onPress={() => router.push('/premium')}
            >
              <Text style={[styles.aiProBtnText, { color: colors.primary }]}>Unlock Full AI Analysis</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function StatCard({ label, value, icon, gradient, colors, sub }: any) {
  return (
    <LinearGradient colors={gradient} style={styles.statCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSub}>{sub}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.base },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.xl },
  greeting: { fontSize: FontSize.sm, fontWeight: '500' },
  userName: { fontSize: FontSize.xl, fontWeight: '800', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerBtn: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, position: 'relative' },
  notifDot: { position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  notifCount: { color: '#fff', fontSize: 10, fontWeight: '800' },
  avatarCircle: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: FontSize.base, fontWeight: '800' },
  // Balance Card
  balanceCard: { borderRadius: Radius.xxl, padding: Spacing.xl, overflow: 'hidden', ...Shadow.primary },
  decorCircle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -60, right: -40, backgroundColor: 'rgba(255,255,255,0.08)' },
  decorCircle2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, bottom: -30, left: 20, backgroundColor: 'rgba(255,255,255,0.05)' },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.sm, fontWeight: '600', letterSpacing: 0.5 },
  balanceAmount: { color: '#fff', fontSize: 36, fontWeight: '800', marginVertical: 8, letterSpacing: -0.5 },
  balanceSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, fontWeight: '500', marginBottom: Spacing.lg },
  balanceStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.base },
  balanceStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  balanceStatIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  balanceStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.xs, fontWeight: '500' },
  balanceStatValue: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  balanceDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },
  // Quick Stats
  row: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
  statCard: { flex: 1, borderRadius: Radius.xl, padding: Spacing.base, gap: 3 },
  statIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  statValue: { color: '#fff', fontSize: FontSize.xl, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.9)', fontSize: FontSize.sm, fontWeight: '600' },
  statSub: { color: 'rgba(255,255,255,0.65)', fontSize: FontSize.xs },
  // Section
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md, marginTop: Spacing.lg },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700' },
  seeAll: { fontSize: FontSize.sm, fontWeight: '600' },
  // Wallets
  walletsRow: { paddingBottom: Spacing.md, gap: Spacing.md },
  walletCard: { width: 150, borderRadius: Radius.xl, padding: Spacing.base, gap: 4 },
  walletIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  walletName: { color: '#fff', fontSize: FontSize.sm, fontWeight: '700' },
  walletBalance: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  walletType: { color: 'rgba(255,255,255,0.65)', fontSize: FontSize.xs, fontWeight: '600', letterSpacing: 0.5 },
  // Budget
  budgetList: { gap: Spacing.md },
  budgetCard: { borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1 },
  budgetInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  budgetIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  budgetName: { fontSize: FontSize.base, fontWeight: '700' },
  budgetSpent: { fontSize: FontSize.xs, marginTop: 1 },
  budgetPct: { fontSize: FontSize.sm, fontWeight: '700' },
  budgetProgressBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  budgetProgressFill: { height: '100%', borderRadius: 3 },
  emptyBudget: { padding: Spacing.xl, borderRadius: Radius.xl, borderWidth: 1, alignItems: 'center', gap: 6 },
  emptyBudgetText: { fontSize: FontSize.sm, fontWeight: '500' },
  emptyBudgetAction: { fontSize: FontSize.sm, fontWeight: '700' },
  // Empty state
  emptyState: { borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: 'center', borderWidth: 1, gap: Spacing.sm },
  emptyText: { fontSize: FontSize.base, fontWeight: '500' },
  emptyAction: { fontSize: FontSize.base, fontWeight: '700' },
  // AI Advisor Styles
  aiContainer: {
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    position: 'relative',
    overflow: 'hidden',
    ...Shadow.sm,
  },
  aiLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    ...Shadow.sm,
  },
  aiLockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: 8,
  },
  aiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  aiMainTitle: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  aiMainDesc: {
    fontSize: 13,
    lineHeight: 18,
    paddingLeft: 4,
  },
  aiExpandedList: {
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  aiSubRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  aiSubTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    marginBottom: 2,
  },
  aiSubDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  aiProBtn: {
    marginTop: Spacing.sm,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiProBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  seeMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: Radius.lg,
    marginTop: Spacing.xs,
    gap: 8,
  },
  seeMoreText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
