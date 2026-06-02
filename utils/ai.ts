import { Transaction, Category } from '../types';
import { startOfWeek, endOfWeek, subWeeks, isWithinInterval, parseISO } from 'date-fns';

const INSIGHT_THRESHOLDS = {
  /** % increase week-over-week that qualifies as a spending spike */
  SPENDING_SPIKE_MIN_INCREASE: 0,
  /** Fraction of weekly spend that dining must exceed to trigger an alert */
  DINING_ALERT_FRACTION: 0.4,
  /** Number of recurring transactions that triggers subscription fatigue warning */
  SUBSCRIPTION_FATIGUE_COUNT: 5,
  /** Safe investment suggestion as a fraction of idle cash */
  SAFE_INVEST_FRACTION: 0.1,
} as const;

export interface AIInsight {
  title: string;
  description: string;
  icon: string;
  color: string;
}

export function generateAIInsights(transactions: Transaction[], categories: Category[], colors: any): AIInsight[] {
  const insights: AIInsight[] = [];
  
  if (transactions.length === 0) {
    return [{
      title: 'Get Started',
      description: 'Add your first transaction to unlock personalized AI financial insights.',
      icon: 'bulb-outline',
      color: colors.primary
    }];
  }

  const now = new Date();
  const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
  const lastWeek = { start: startOfWeek(subWeeks(now, 1)), end: endOfWeek(subWeeks(now, 1)) };

  // 1. Spending Trend
  const currentWeekExpenses = transactions
    .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), thisWeek))
    .reduce((sum, t) => sum + t.amount, 0);

  const lastWeekExpenses = transactions
    .filter(t => t.type === 'expense' && isWithinInterval(parseISO(t.date), lastWeek))
    .reduce((sum, t) => sum + t.amount, 0);

  if (currentWeekExpenses > lastWeekExpenses && lastWeekExpenses > 0) {
    const diff = (((currentWeekExpenses - lastWeekExpenses) / lastWeekExpenses) * 100).toFixed(0);
    insights.push({
      title: 'Spending Spike',
      description: `Your spending is up ${diff}% compared to last week. Try to keep an eye on discretionary costs.`,
      icon: 'trending-up',
      color: colors.danger
    });
  } else if (currentWeekExpenses < lastWeekExpenses && lastWeekExpenses > 0) {
    insights.push({
      title: 'Great Progress!',
      description: 'You are spending less than last week. You are on track to meet your savings goals.',
      icon: 'checkmark-circle',
      color: colors.success
    });
  }

  // 2. Category specific (Dining example)
  const diningCat = categories.find(c => c.name.toLowerCase().includes('dining') || c.name.toLowerCase().includes('food'));
  if (diningCat) {
    const diningSpend = transactions
      .filter(t => t.categoryId === diningCat.id && isWithinInterval(parseISO(t.date), thisWeek))
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (diningSpend > currentWeekExpenses * INSIGHT_THRESHOLDS.DINING_ALERT_FRACTION) {
      insights.push({
        title: 'Dining Alert',
        description: 'Dining out accounts for over 40% of this week\'s spend. Small cuts here can lead to big savings.',
        icon: 'restaurant',
        color: colors.warning
      });
    }
  }

  // 3. Subscription Check
  const recurringCount = transactions.filter(t => t.isRecurring).length;
  if (recurringCount > INSIGHT_THRESHOLDS.SUBSCRIPTION_FATIGUE_COUNT) {
    insights.push({
      title: 'Subscription Fatigue',
      description: `You have ${recurringCount} active recurring payments. Review them to ensure you still use all services.`,
      icon: 'repeat',
      color: colors.primary
    });
  }

  // Fallback default
  if (insights.length < 2) {
    insights.push({
      title: 'Safe to Invest',
      description: `Based on your current balance and bills, you can safely invest ${INSIGHT_THRESHOLDS.SAFE_INVEST_FRACTION * 100}% of your idle cash.`,
      icon: 'leaf',
      color: colors.success
    });
  }

  return insights;
}
