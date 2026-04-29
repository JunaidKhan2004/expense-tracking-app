import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // ── Expense Categories ────────────────────────────────────────────────────
  { id: 'food', name: 'Food & Dining', icon: 'restaurant', color: '#FF6B8A', type: 'expense', isCustom: false },
  { id: 'transport', name: 'Transport', icon: 'car', color: '#285A48', type: 'expense', isCustom: false },
  { id: 'shopping', name: 'Shopping', icon: 'cart', color: '#FFB830', type: 'expense', isCustom: false },
  { id: 'bills', name: 'Bills & Utilities', icon: 'receipt', color: '#4ECDC4', type: 'expense', isCustom: false },
  { id: 'health', name: 'Health', icon: 'medical', color: '#00D9A0', type: 'expense', isCustom: false },
  { id: 'education', name: 'Education', icon: 'school', color: '#5BC8FF', type: 'expense', isCustom: false },
  { id: 'entertainment', name: 'Entertainment', icon: 'game-controller', color: '#FF8C00', type: 'expense', isCustom: false },
  { id: 'travel', name: 'Travel', icon: 'airplane', color: '#408A71', type: 'expense', isCustom: false },
  { id: 'housing', name: 'Housing & Rent', icon: 'home', color: '#F97316', type: 'expense', isCustom: false },
  { id: 'personal', name: 'Personal Care', icon: 'person', color: '#EC4899', type: 'expense', isCustom: false },
  { id: 'pets', name: 'Pets', icon: 'paw', color: '#84CC16', type: 'expense', isCustom: false },
  { id: 'gifts', name: 'Gifts & Donations', icon: 'gift', color: '#EF4444', type: 'expense', isCustom: false },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'tv', color: '#091413', type: 'expense', isCustom: false },
  { id: 'insurance', name: 'Insurance', icon: 'shield-checkmark', color: '#0EA5E9', type: 'expense', isCustom: false },
  { id: 'tax', name: 'Taxes', icon: 'document-text', color: '#78716C', type: 'expense', isCustom: false },
  { id: 'other_expense', name: 'Other', icon: 'ellipsis-horizontal-circle', color: '#94A3B8', type: 'expense', isCustom: false },

  // ── Income Categories ─────────────────────────────────────────────────────
  { id: 'salary', name: 'Salary', icon: 'briefcase', color: '#00D9A0', type: 'income', isCustom: false },
  { id: 'freelance', name: 'Freelance', icon: 'laptop', color: '#408A71', type: 'income', isCustom: false },
  { id: 'investment', name: 'Investment', icon: 'trending-up', color: '#FFB830', type: 'income', isCustom: false },
  { id: 'business', name: 'Business', icon: 'storefront', color: '#4ECDC4', type: 'income', isCustom: false },
  { id: 'rental', name: 'Rental Income', icon: 'key', color: '#F97316', type: 'income', isCustom: false },
  { id: 'bonus', name: 'Bonus', icon: 'star', color: '#FFB830', type: 'income', isCustom: false },
  { id: 'refund', name: 'Refund', icon: 'arrow-undo', color: '#00B8D9', type: 'income', isCustom: false },
  { id: 'gift_income', name: 'Gift Received', icon: 'gift', color: '#FF6B8A', type: 'income', isCustom: false },
  { id: 'other_income', name: 'Other Income', icon: 'add-circle', color: '#94A3B8', type: 'income', isCustom: false },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ur', name: 'اردو' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
];

export const WALLET_COLORS = [
  '#408A71', '#285A48', '#00D9A0', '#FFB830',
  '#4ECDC4', '#FF8C00', '#B0E4CC', '#F97316',
  '#EC4899', '#0EA5E9', '#84CC16', '#EF4444',
];
