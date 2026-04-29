# 🚀 FinVault Expense Tracker

FinVault is a modern, premium Expense Tracking application built with **React Native** and **Expo**. It features a stunning UI, smooth animations, and comprehensive financial management tools powered by **Supabase Cloud**.

---

## ✨ Key Features

- **AI Smart Advisor (New!):** Dashboard-integrated intelligence that analyzes your spending patterns (Spikes, Dining Alerts, Subscriptions) and provides actionable financial advice.
- **Interactive Swipe Actions:** Effortlessly manage your finances with left-to-right swipe for **Editing** and right-to-left swipe for **Deletion** directly from any transaction list.
- **Real-time Financial Sync:** Automatic wallet balance adjustments when adding, editing, or deleting transactions. Your net balance and category budgets stay perfectly in sync.
- **Supabase Cloud Integration:** Secure authentication (Email OTP & Google Sign-In) and real-time data synchronization across all your devices.
- **Advanced Budgeting Engine:** Set category-wise monthly spending limits with real-time progress tracking and visual color alerts (Healthy vs. Over-budget) on the dashboard.
- **Emerald Design System:** A sophisticated Emerald/Seafoam color palette for a premium, calm, and professional experience.
- **Security & Privacy:** Dual-layer security with **Biometric Lock (FaceID/Fingerprint)** and **4-digit PIN fallback**.
- **Offline Handling:** Intelligent connectivity monitoring with an **Animated Offline Banner**. Data stays persistent even without internet.
- **Data Export (Pro):** Generate professional **PDF Reports** with branding, or export raw data to **CSV** for detailed analysis.
- **Smart Notifications Center:** Local and push notification system with budget threshold alerts (80%/100%) and a dedicated notification history view.
- **Professional UI/UX:** A clean, emoji-free interface featuring glassmorphism, linear gradients, and smooth `Animated` transitions.

---

## 🛠️ Tech Stack

- **Framework:** React Native (0.81.5) & Expo (~54.0)
- **Backend:** **Supabase** (PostgreSQL, Auth, RLS)
- **Security:** `expo-local-authentication` & `expo-secure-store`
- **Gestures:** `react-native-gesture-handler` (Swipe Actions)
- **State Management:** Zustand (with Persistence & Auto-migration)
- **Styling:** NativeWind & Custom Emerald Design System
- **Charts:** `react-native-svg` & `react-native-chart-kit`
- **Icons:** `@expo-vector-icons` (Ionicons)

---

## 📁 Project Structure

```text
expense-tracking-app/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Professional Auth Flow (Google/Email)
│   ├── (tabs)/             # Main app (Dashboard, History, Analytics, Settings)
│   ├── budget/             # Budget management engine
│   ├── settings/           # Security, PIN, & Privacy screens
│   ├── transaction/        # Add/Edit/Detail transaction modals
│   ├── notifications.tsx   # Notification history center
│   └── _layout.tsx         # Root layout with GestureHandlerRootView
├── components/             # Reusable UI, TransactionItems & Guards
├── constants/              # Emerald Theme tokens & Categories
├── store/                  # Zustand stores (Transactions, Wallets, Budgets)
├── utils/                  # AI Engine, Export, Currency & Toast helpers
└── types/                  # TypeScript definitions
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed. You will also need the **Expo Go** app on your iOS/Android device.

### Installation

1. **Clone and Install:**
   ```bash
   cd expense-tracking-app
   npm install
   ```

2. **Configure Supabase:**
   - Update `lib/supabase.ts` with your credentials.
   - For **Google Sign-In**, configure your Client IDs in Google Cloud Console.
   - Run the SQL schema provided in the artifacts in your Supabase SQL Editor.

3. **Start Development:**
   ```bash
   npx expo start --clear
   ```

---

## 📝 Features Roadmap
- [x] Cloud Sync with Supabase
- [x] Multi-Currency Support
- [x] Category-wise Budgeting
- [x] Biometric & PIN Security
- [x] AI Spending Insights (Dashboard Integration)
- [x] Swipe-to-Action (Edit/Delete)
- [x] Real-time Balance Adjustment
- [x] PDF/CSV Reports
- [x] Google OAuth Integration
- [ ] Receipt Scanning (OCR) - *Coming Soon*
- [ ] Advanced AI Spending Forecast - *Under Development*

---

## 📝 License
This project is open-source and available under the MIT License. Built with ❤️ by **Junaid Dev**.
