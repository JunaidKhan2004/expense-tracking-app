# 🚀 FinVault Expense Tracker

FinVault is a modern, premium Expense Tracking application built with **React Native** and **Expo**. It features a stunning UI, smooth animations, and comprehensive financial management tools powered by **Supabase Cloud**.

---

## ✨ Key Features

- **Supabase Cloud Integration:** Secure authentication (Email OTP & Google Sign-In) and real-time data synchronization across all your devices.
- **Advanced Budgeting Engine:** Set category-wise monthly spending limits with real-time progress tracking and visual color alerts (Healthy vs. Over-budget) on the dashboard.
- **Emerald Design System:** A sophisticated new Emerald/Seafoam color palette for a premium, calm, and professional financial management experience.
- **Animated Premium Experience:** Unique "Upgrade to Premium" banner featuring breathing pulsing icons and floating glassmorphic background elements for a high-end feel.
- **Security & Privacy:** Dual-layer security with **Biometric Lock (FaceID/Fingerprint)** and **4-digit PIN fallback** to keep your financial data private.
- **Offline Handling:** Intelligent connectivity monitoring with an **Animated Offline Banner**. Data stays accessible and persistent even without internet.
- **Data Export (Pro):** Generate professional **PDF Reports** with transaction summaries and branding, or export raw data to **CSV** for detailed analysis.
- **Real-time Currency Conversion:** Convert all your transactions and wallet balances instantly using live market exchange rates. Supports **USD, PKR, SAR, AED, TRY, KWD** and more.
- **Smart Notifications Center:** Local and push notification system with Android channel support, budget threshold alerts (80%/100%), and a dedicated notification history view.
- **Professional UI/UX:** A clean, emoji-free interface designed for focus and clarity, featuring glassmorphism, linear gradients, and smooth `Animated` transitions.
- **Analytics & Charts:** Custom-built SVG Pie and Bar charts to visualize spending by category and income vs. expenses trends.

---

## 🛠️ Tech Stack

- **Framework:** React Native (0.81.5) & Expo (~54.0)
- **Backend:** **Supabase** (PostgreSQL, Auth, RLS)
- **Security:** `expo-local-authentication` & `expo-secure-store`
- **Networking:** `@react-native-community/netinfo` for offline states
- **Exports:** `expo-print`, `expo-sharing`, & `expo-file-system`
- **Notifications:** `expo-notifications` & `expo-device`
- **Navigation:** Expo Router (File-based routing)
- **State Management:** Zustand (with Persistence & Auto-migration)
- **Styling:** NativeWind & Custom Design System (Emerald Theme)
- **Charts:** `react-native-svg`
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
│   ├── transaction/        # Add/Detail transaction modals
│   ├── notifications.tsx   # Notification history center
│   └── _layout.tsx         # Root layout & Global UI Providers
├── components/             # Reusable UI, AuthGuard & Offline Banner
├── constants/              # Emerald Theme tokens & Categories
├── store/                  # Zustand stores (Core logic & Persistence)
├── utils/                  # Export, Currency, Notifs, & Toast helpers
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
   - For **Google Sign-In**, configure your Client IDs in Google Cloud Console and Supabase Auth providers.
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
- [x] PDF/CSV Reports
- [x] Smart Notifications Center
- [x] Google OAuth Integration
- [x] Offline Connectivity Handling
- [x] Emerald Professional UI (Emoji-free)
- [x] Animated Premium Banner
- [ ] AI Spending Insights (Next Up!)
- [ ] Receipt Scanning (OCR)
- [ ] Multi-user Shared Wallets

---

## 📝 License
This project is open-source and available under the MIT License. Built with ❤️ by **Junaid Dev**.
