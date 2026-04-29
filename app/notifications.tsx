import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { format } from 'date-fns';
import { useTheme } from '../hooks/useTheme';
import { useNotificationStore, NotificationItem } from '../store/useNotificationStore';
import { Spacing, FontSize, Radius } from '../constants/theme';

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'budget': return { name: 'pie-chart', color: colors.danger };
      case 'transaction': return { name: 'swap-horizontal', color: colors.success };
      default: return { name: 'notifications', color: colors.primary };
    }
  };

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const icon = getIcon(item.type);
    
    return (
      <TouchableOpacity 
        style={[
          styles.item, 
          { backgroundColor: colors.card, borderLeftColor: item.isRead ? 'transparent' : colors.primary }
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={[styles.iconBox, { backgroundColor: `${icon.color}22` }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.itemDate, { color: colors.textSecondary }]}>
              {format(new Date(item.date), 'MMM dd, HH:mm')}
            </Text>
          </View>
          <Text style={[styles.itemBody, { color: colors.textSecondary }]}>{item.body}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          <TouchableOpacity onPress={clearNotifications}>
            <Text style={{ color: colors.danger, fontWeight: '600' }}>Clear All</Text>
          </TouchableOpacity>
        </View>
        
        {notifications.length > 0 && (
          <TouchableOpacity style={styles.markAll} onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 12 }}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIconBox, { backgroundColor: colors.card }]}>
              <Ionicons name="notifications-off-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>We'll alert you about budgets and transactions here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: Spacing.base, marginBottom: Spacing.md },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  backBtn: { padding: 4, marginLeft: -4 },
  title: { fontSize: FontSize.xl, fontWeight: '800' },
  markAll: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 40 },
  item: { 
    flexDirection: 'row', 
    padding: Spacing.md, 
    borderRadius: Radius.xl, 
    marginBottom: Spacing.sm,
    borderLeftWidth: 4,
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  content: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemTitle: { fontSize: FontSize.base, fontWeight: '700' },
  itemDate: { fontSize: 10, fontWeight: '500' },
  itemBody: { fontSize: FontSize.sm, lineHeight: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyIconBox: { width: 80, height: 80, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyText: { fontSize: FontSize.lg, fontWeight: '700', marginBottom: 8 },
  emptySub: { fontSize: FontSize.sm, textAlign: 'center', paddingHorizontal: 40, opacity: 0.6 },
});
