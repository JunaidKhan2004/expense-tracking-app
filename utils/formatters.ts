import { format, isToday, isYesterday, parseISO, startOfDay, startOfWeek, startOfMonth, startOfYear, endOfDay } from 'date-fns';
import { Transaction, CategoryStats, MonthlyStats, FilterPeriod } from '../types';
import { CURRENCIES } from '../constants/categories';

// ─── Currency ─────────────────────────────────────────────────────────────────

export function getCurrencySymbol(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol ?? '$';
}

export function formatCurrency(amount: number, currencyCode = 'USD'): string {
  const symbol = getCurrencySymbol(currencyCode);
  const abs = Math.abs(amount);
  let formatted: string;
  if (abs >= 1_000_000) {
    formatted = `${symbol}${(abs / 1_000_000).toFixed(1)}M`;
  } else if (abs >= 1_000) {
    formatted = `${symbol}${(abs / 1_000).toFixed(1)}K`;
  } else {
    formatted = `${symbol}${abs.toFixed(2)}`;
  }
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatCurrencyFull(amount: number, currencyCode = 'USD'): string {
  const symbol = getCurrencySymbol(currencyCode);
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Date ─────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMM dd');
  } catch {
    return dateStr;
  }
}

export function formatTime(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'hh:mm a');
  } catch {
    return '';
  }
}

export function formatMonthYear(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'MMMM yyyy');
  } catch {
    return dateStr;
  }
}

export function getCurrentMonth(): string {
  return format(new Date(), 'MMMM yyyy');
}

export function getDateRangeForPeriod(period: FilterPeriod): { start: Date; end: Date } {
  const now = new Date();
  const end = endOfDay(now);
  switch (period) {
    case 'day':
      return { start: startOfDay(now), end };
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end };
    case 'month':
      return { start: startOfMonth(now), end };
    case 'year':
      return { start: startOfYear(now), end };
    default:
      return { start: new Date(0), end };
  }
}

// ─── Transaction Helpers ──────────────────────────────────────────────────────

export function filterTransactionsByPeriod(transactions: Transaction[], period: FilterPeriod): Transaction[] {
  if (period === 'all') return transactions;
  const { start, end } = getDateRangeForPeriod(period);
  return transactions.filter((t) => {
    const date = parseISO(t.date);
    return date >= start && date <= end;
  });
}

export function calculateTotals(transactions: Transaction[]): { income: number; expenses: number; balance: number } {
  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  return { income, expenses, balance: income - expenses };
}

export function getCategoryStats(transactions: Transaction[]): CategoryStats[] {
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const categoryMap = new Map<string, { amount: number; count: number }>();

  expenseTransactions.forEach((t) => {
    const existing = categoryMap.get(t.categoryId) ?? { amount: 0, count: 0 };
    categoryMap.set(t.categoryId, { amount: existing.amount + t.amount, count: existing.count + 1 });
  });

  return Array.from(categoryMap.entries())
    .map(([categoryId, { amount, count }]) => ({
      categoryId,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getMonthlyStats(transactions: Transaction[]): MonthlyStats[] {
  const months: Record<string, MonthlyStats> = {};
  transactions.forEach((t) => {
    const key = format(parseISO(t.date), 'yyyy-MM');
    if (!months[key]) {
      months[key] = { month: format(parseISO(t.date), 'MMM'), income: 0, expenses: 0, savings: 0 };
    }
    if (t.type === 'income') months[key].income += t.amount;
    else months[key].expenses += t.amount;
    months[key].savings = months[key].income - months[key].expenses;
  });

  return Object.values(months).slice(-6);
}

export function groupTransactionsByDate(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>((groups, t) => {
    const key = formatDate(t.date);
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
    return groups;
  }, {});
}

// ─── Misc ──────────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
