import { create } from 'zustand';
import { Storage } from '../utils/storage';

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

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  hydrate: async () => {
    try {
      const saved = await Storage.getItem<NotificationItem[]>(Storage.KEYS.NOTIFICATIONS);
      if (saved) {
        set({ 
          notifications: saved,
          unreadCount: saved.filter(n => !n.isRead).length
        });
      }
    } catch (err) {
      console.error('Failed to hydrate notifications:', err);
    }
  },

  addNotification: async (title, body, type) => {
    const newItem: NotificationItem = {
      id: Math.random().toString(36).substring(7),
      title,
      body,
      date: new Date().toISOString(),
      isRead: false,
      type,
    };

    const updated = [newItem, ...get().notifications];
    set({ 
      notifications: updated,
      unreadCount: updated.filter(n => !n.isRead).length
    });
    await Storage.setItem(Storage.KEYS.NOTIFICATIONS, updated);
  },

  markAsRead: async (id) => {
    const updated = get().notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    );
    set({ 
      notifications: updated, 
      unreadCount: updated.filter(n => !n.isRead).length
    });
    await Storage.setItem(Storage.KEYS.NOTIFICATIONS, updated);
  },

  markAllAsRead: async () => {
    const updated = get().notifications.map(n => ({ ...n, isRead: true }));
    set({ 
      notifications: updated, 
      unreadCount: 0 
    });
    await Storage.setItem(Storage.KEYS.NOTIFICATIONS, updated);
  },

  clearNotifications: async () => {
    set({ notifications: [], unreadCount: 0 });
    await Storage.setItem(Storage.KEYS.NOTIFICATIONS, []);
  },
}));
