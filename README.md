# 🚀 FinVault Expense Tracker

FinVault is a modern, premium Expense Tracking application built with **React Native** and **Expo**. It features a stunning UI, smooth animations, and comprehensive financial management tools to help you track your income, expenses, and savings.

---

## ✨ Key Features

- **Premium UI/UX:** Built with a cohesive design system, featuring glassmorphism, linear gradients, and smooth `Animated` transitions.
- **Dark/Light Mode:** Full theming support that updates instantly across the app.
- **Dashboard & Insights:** Get a quick overview of your total balance, monthly budget progress, and quick stats.
- **Multiple Wallets:** Manage your finances across different accounts (Bank, Cash, Credit Card).
- **Analytics & Charts:** Custom-built SVG Pie and Bar charts to visualize spending by category and income vs. expenses trends.
- **Transaction Management:** Easily add, edit, search, and filter transactions. Includes recurring transaction support.
- **State Management:** Powered by **Zustand** for fast, reliable global state, persisted locally with AsyncStorage.

---

## 🛠️ Tech Stack

- **Framework:** React Native (0.81.5) & Expo (~54.0)
- **Navigation:** Expo Router (File-based routing)
- **Styling:** NativeWind (Tailwind CSS for React Native) & Custom Design System
- **State Management:** Zustand
- **Local Storage:** `@react-native-async-storage/async-storage`
- **Charts:** `react-native-svg`
- **Icons:** `@expo/vector-icons` (Ionicons)
- **Animations:** React Native `Animated` API

---

## 📁 Project Structure

```text
expense-tracking-app/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Login, Signup, Forgot Password
│   ├── (tabs)/             # Main app tabs (Dashboard, Transactions, Analytics, Settings)
│   ├── transaction/        # Add/Detail transaction modals
│   ├── _layout.tsx         # Root layout & store hydration
│   └── index.tsx           # Entry point (Auth redirect)
├── components/             # Reusable React components
│   ├── transaction/        # Transaction list items
│   └── ui/                 # Buttons, Cards, Inputs, Badges
├── constants/              # App constants
│   ├── categories.ts       # Default categories & currencies
│   └── theme.ts            # Design system (Colors, Spacing, Typography)
├── hooks/                  # Custom React hooks (e.g., useTheme)
├── store/                  # Zustand state stores
│   ├── useAuthStore.ts
│   ├── useSettingsStore.ts
│   ├── useTransactionStore.ts
│   └── useWalletStore.ts
├── types/                  # TypeScript type definitions
└── utils/                  # Helper functions
    ├── formatters.ts       # Date, currency, and chart formatting
    └── storage.ts          # AsyncStorage wrapper
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed. You will also need the **Expo Go** app on your iOS/Android device, or an emulator set up on your machine.

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd expense-tracking-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start --clear
   ```

4. **Run the app:**
   - Scan the QR code with your camera (iOS) or the Expo Go app (Android).
   - Press `a` to run on Android Emulator.
   - Press `i` to run on iOS Simulator.

---

## 🎨 Theming and Customization

The app's entire color palette, spacing, and typography are controlled via `constants/theme.ts`. To change the primary color or adjust the dark mode aesthetics, simply modify the `Colors` object in that file. The custom `useTheme` hook automatically applies these changes across all components.

---

## 📝 License

This project is open-source and available under the MIT License.
