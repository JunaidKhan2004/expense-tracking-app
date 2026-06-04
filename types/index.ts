// ─── Core Types ─────────────────────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';
export type WalletType = 'cash' | 'bank' | 'card' | 'crypto';
export type RecurringPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type FilterPeriod = 'day' | 'week' | 'month' | 'year' | 'all';
export type ThemeMode = 'dark' | 'light';

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  createdAt: string;
  currency: string;
  streakDays: number;
  totalBadges: number;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
  isCustom: boolean;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  walletId: string;
  title: string;
  notes?: string;
  date: string;
  createdAt: string;
  isRecurring: boolean;
  recurringPeriod?: RecurringPeriod;
  tags?: string[];
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

// ─── Budget ──────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: RecurringPeriod;
  walletId?: string;
}

// ─── Saving Goal ─────────────────────────────────────────────────────────────

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
  icon: string;
}

// ─── Achievement ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface MonthlyStats {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface CategoryStats {
  categoryId: string;
  amount: number;
  percentage: number;
  count: number;
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: ThemeMode;
  currency: string;
  language: string;
  notificationsEnabled: boolean;
  biometricEnabled: boolean;
  pinEnabled: boolean;
  budgetAlerts: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
}
