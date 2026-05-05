import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { 
  FlatList, 
  RefreshControl, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoalCard } from '../../components/goals/GoalCard';
import { FontSize, Radius, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useGoalStore } from '../../store/useGoalStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function GoalsScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { goals, isLoading, hydrate } = useGoalStore();
  const { settings } = useSettingsStore();

  const onRefresh = async () => {
    await hydrate();
  };

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Financial Goals</Text>
        <TouchableOpacity 
          onPress={() => router.push('/goals/add')}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GoalCard 
            goal={item} 
            currency={settings.currency} 
            onPress={(g) => router.push(`/goals/${g.id}`)} 
          />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Overall Progress Card */}
            <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.statsInfo}>
                <View>
                  <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Overall Savings</Text>
                  <Text style={[styles.statsValue, { color: colors.text }]}>{Math.round(overallProgress)}%</Text>
                </View>
                <View style={[styles.statsIcon, { backgroundColor: `${colors.primary}22` }]}>
                  <Ionicons name="trending-up" size={24} color={colors.primary} />
                </View>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${overallProgress}%`, backgroundColor: colors.primary }
                  ]} 
                />
              </View>
              <Text style={[styles.statsSub, { color: colors.textSecondary }]}>
                You've saved {totalSaved.toLocaleString()} out of {totalTarget.toLocaleString()}
              </Text>
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Active Goals</Text>
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}11` }]}>
                <Ionicons name="flag-outline" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Goals Yet</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Set your first savings goal to start tracking your progress.
              </Text>
              <TouchableOpacity 
                style={[styles.createBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/goals/add')}
              >
                <Text style={styles.createBtnText}>Create a Goal</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />
        }
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
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: Spacing.base,
  },
  listHeader: {
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  statsCard: {
    padding: Spacing.lg,
    borderRadius: Radius.xxl,
    borderWidth: 1,
  },
  statsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statsLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 2,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsSub: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  emptySub: {
    fontSize: FontSize.base,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  createBtn: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
  },
  createBtnText: {
    color: '#fff',
    fontSize: FontSize.base,
    fontWeight: '700',
  },
});
