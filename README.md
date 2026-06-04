# Spendly — Smart Expense Tracker

A production-grade personal finance app built with React Native and Expo. Track expenses, manage wallets, set budgets, and get AI-powered spending insights.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.81.5 + Expo SDK 54 |
| Navigation | Expo Router 6 (file-based) |
| State | Zustand 5 (8 stores + event bus) |
| Backend | Supabase (PostgreSQL + Auth) |
| Styling | NativeWind 4 (Tailwind CSS) + Reanimated 4 |
| Security | expo-secure-store (chunked) + Biometric + PIN |
| Build | EAS Build |

---

## Features

- **Dashboard** — Animated balance card, income/savings/expense breakdown, AI advisor
- **Transactions** — Add, edit, delete with swipe gestures; OCR receipt scanner
- **Wallets** — Multi-wallet support with real-time balance sync
- **Budgets** — Per-category monthly budgets with progress tracking
- **Savings Goals** — Create and track financial goals with contributions
- **Analytics** — Charts and spending breakdowns by category and period
- **AI Smart Advisor** — Spending spike detection, subscription alerts, saving suggestions (Premium)
- **Multi-currency** — 14 currencies with live conversion
- **Auth** — Email/password + Google OAuth (PKCE), OTP verification, biometric lock
- **Themes** — Dark and light mode with Emerald design system
- **Export** — PDF reports and CSV exports
- **Notifications** — Budget alerts and transaction confirmations

---

## Project Structure

```
app/
  (auth)/          # Login, signup, OTP, forgot/reset password
  (tabs)/          # Dashboard, transactions, analytics, settings
  transaction/     # Add/edit, OCR scan, detail view
  budget/          # Budget management
  wallet/          # Wallet management
  goals/           # Savings goals
  settings/        # Privacy, terms, support, PIN setup
  premium.tsx      # Premium upgrade modal
  notifications.tsx

store/
  useAuthStore.ts          # Auth, OAuth, session management
  useTransactionStore.ts   # Transaction CRUD + category management
  useWalletStore.ts        # Wallet CRUD + balance sync
  useBudgetStore.ts        # Budget tracking with smart caching
  useGoalStore.ts          # Savings goals
  useSettingsStore.ts      # Theme, currency, security, notifications
  useNotificationStore.ts  # Notification center
  useAppStore.ts           # Global hydration flag
  storeEvents.ts           # Typed event bus (cross-store communication)

components/
  auth/            # AuthGuard (biometric/PIN lock), AuthHeader
  ui/              # Button, Input, Card, Badge, ProgressBar, Skeleton, OfflineBanner
  transaction/     # TransactionItem (swipe actions)
  goals/           # GoalCard

utils/
  ai.ts                # AI spending insights generator
  formatters.ts        # Currency, date, stats formatters
  retryWithBackoff.ts  # Exponential backoff (3 attempts, jitter)
  currencyConverter.ts # Live currency conversion
  notifications.ts     # Push notification setup
  export.ts            # PDF/CSV export
  toast.ts             # Toast message API

lib/
  supabase.ts      # Supabase client with chunked SecureStore adapter

constants/
  theme.ts         # Emerald design system (colors, spacing, radius, shadows)
  categories.ts    # Default categories and supported currencies

types/
  index.ts         # Shared TypeScript definitions
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- EAS CLI: `npm install -g eas-cli`

### Install

```bash
npm install
```

### Environment

Create `.env.local` in the project root:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run

```bash
# Start dev server (clear cache)
npx expo start --clear

# Android
npx expo start --android

# iOS
npx expo start --ios
```

---

## Build (EAS)

```bash
# APK for testing (Android)
eas build --profile preview --platform android

# iOS build
eas build --profile preview --platform ios

# Both platforms
eas build --profile preview --platform all

# Production (Play Store / App Store)
eas build --profile production --platform all
```

---

## Architecture Notes

### Cross-store Communication
Stores communicate via a typed event bus (`storeEvents.ts`) instead of direct imports, preventing circular dependencies:

```
TransactionStore  →  emit('transaction:deleted')  →  WalletStore adjusts balance
TransactionStore  →  emit('transaction:added')    →  NotificationStore creates alert
```

### Session Storage
Expo SecureStore has a 2048-byte limit per key. Supabase sessions exceed this, so `lib/supabase.ts` implements a chunked adapter that splits large values across multiple keys and reassembles them on read.

### Hydration Flow
On app launch, `_layout.tsx` sets `isHydrating: true`, hydrates auth and settings, then sets `isHydrating: false`. The splash screen (`app/index.tsx`) waits for this flag before redirecting. An 8-second timeout ensures the app never gets stuck on splash.

### Network Resilience
All Supabase calls in stores use `retryWithBackoff` (3 attempts, exponential backoff + jitter). Auth actions use `Promise.race` with a 15-second timeout and always reset `isLoading` in a `finally` block — prevents iOS loading-stuck issues.

### Budget Caching
`useBudgetStore.getBudgetsWithProgress()` uses a module-level cache keyed on month + transaction count + budget amounts. Safe to call during render since it never triggers a re-render.

---

## Design System

Primary color: **Emerald `#408A71`**

| Token | Values |
|-------|--------|
| Spacing | xs(4) sm(8) md(12) base(16) lg(20) xl(24) xxl(32) |
| Radius | sm(8) md(12) lg(16) xl(20) xxl(24) full(999) |
| FontSize | xs(11) sm(12) md(14) base(16) lg(18) xl(20) xxl(24) display(36) |
| Shadows | sm / md / lg / primary — all Emerald-tinted |

---

## App Info

| Field | Value |
|-------|-------|
| App Name | Spendly |
| Bundle ID | com.megajunaid.spendly |
| Version | 1.0.0 |
| Platforms | Android, iOS |
| Owner | megajunaid |
