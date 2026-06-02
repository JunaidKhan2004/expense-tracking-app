import { create } from 'zustand';
import { Storage } from '../utils/storage';
import { storeEvents } from './storeEvents';
import { useBudgetStore } from './useBudgetStore';
import { useSettingsStore } from './useSettingsStore';
import { sendLocalNotification } from '../utils/notifications';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  date: string;
  isRead: boolean;
  type: 'budget' | 'transaction' | 'system';
}

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;

  hydrate: () => Promise<void>;
  addNotification: (title: string, body: string, type: NotificationItem['type']) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => Promise<void>;
}

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: timestamp + random hex block (collision-resistant enough for local IDs)
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  // Subscribe to transaction:added events — handle notifications without dynamic imports
  storeEvents.on('transaction:added', async (tx) => {
    const { settings } = useSettingsStore.getState();
    if (!settings.notificationsEnabled) return;

    const { addNotification } = useNotificationStore.getState();

    // 1. General transaction notification
    const txTitle = tx.type === 'income' ? 'Income Received!' : 'Expense Tracked';
    const txBody = `${tx.title}: ${tx.amount}`;
    await sendLocalNotification(txTitle, txBody);
    await addNotification(txTitle, txBody, 'transaction');

    // 2. Budget alert for expenses
    if (tx.type === 'expense' && settings.budgetAlerts) {
      const budget = useBudgetStore.getState().getBudgetsWithProgress()
        .find((b) => b.categoryId === tx.categoryId);

      if (budget) {
        if (budget.percentage >= 100) {
          const title = 'Budget Exceeded!';
          const body = `You've spent ${Math.round(budget.percentage)}% of your budget for this category.`;
          await sendLocalNotification(title, body);
          await addNotification(title, body, 'budget');
        } else if (budget.percentage >= 80) {
          const title = 'Budget Alert';
          const body = `You've used ${Math.round(budget.percentage)}% of your budget for this category.`;
          await sendLocalNotification(title, body);
          await addNotification(title, body, 'budget');
        }
      }
    }
  });

  return {
    notifications: [],
    unreadCount: 0,

    hydrate: async () => {
      try {
        const saved = await Storage.getItem<NotificationItem[]>(Storage.KEYS.NOTIFICATIONS);
        if (saved) {
          set({
            notifications: saved,
            unreadCount: saved.filter((n) => !n.isRead).length,
          });
        }
      } catch (err) {
        console.error('Failed to hydrate notifications:', err);
      }
    },

    addNotification: async (title, body, type) => {
      const newItem: NotificationItem = {
        id: generateId(),
        title,
        body,
        date: new Date().toISOString(),
        isRead: false,
        type,
      };

      const updated = [newItem, ...get().notifications];
      set({
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      });
      await Storage.setItem(Storage.KEYS.NOTIFICATIONS, updated);
    },

    markAsRead: async (id) => {
      const updated = get().notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      set({ notifications: updated, unreadCount: updated.filter((n) => !n.isRead).length });
      await Storage.setItem(Storage.KEYS.NOTIFICATIONS, updated);
    },

    markAllAsRead: async () => {
      const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });
      await Storage.setItem(Storage.KEYS.NOTIFICATIONS, updated);
    },

    clearNotifications: async () => {
      set({ notifications: [], unreadCount: 0 });
      await Storage.setItem(Storage.KEYS.NOTIFICATIONS, []);
    },
  };
});
