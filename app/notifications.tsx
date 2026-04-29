import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontSize, Radius, Spacing } from '../constants/theme';
import { useTheme } from '../hooks/useTheme';
import { NotificationItem, useNotificationStore } from '../store/useNotificationStore';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
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
        activeOpacity={0.7}
        style={[
          styles.item,
          {
            backgroundColor: colors.card,
            borderColor: item.isRead ? colors.border : colors.primary,
            borderLeftColor: item.isRead ? 'transparent' : colors.primary,
            shadowColor: item.isRead ? '#000' : colors.primary,
          }
        ]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={[styles.iconBox, { backgroundColor: `${icon.color}15` }]}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.content}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[styles.itemDate, { color: colors.textMuted }]}>
              {format(new Date(item.date), 'HH:mm')}
            </Text>
          </View>
          <Text style={[styles.itemBody, { color: colors.textSecondary }]} numberOfLines={2}>{item.body}</Text>
          <Text style={[styles.itemFullDate, { color: colors.textMuted }]}>
            {format(new Date(item.date), 'MMM dd, yyyy')}
          </Text>
        </View>
        {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
      </TouchableOpacity>
    );
  };

  const slideAnim = useRef(new Animated.Value(40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Drag Handle */}
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <View style={[styles.header, { marginTop: Spacing.base }]}>
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
              <LinearGradient
                colors={[colors.card, colors.background]}
                style={styles.emptyIconBox}
              >
                <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
              </LinearGradient>
              <Text style={[styles.emptyText, { color: colors.text }]}>All Caught Up!</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                You don't have any new notifications at the moment.
              </Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: Spacing.sm },
  header: { paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  backBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: FontSize.xxl, fontWeight: '800', letterSpacing: -0.5 },
  markAll: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  list: { paddingHorizontal: Spacing.base, paddingBottom: 40, paddingTop: Spacing.sm },
  item: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderLeftWidth: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
  },
  unreadDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  content: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  itemTitle: { fontSize: FontSize.base, fontWeight: '700', flex: 1, marginRight: 8 },
  itemDate: { fontSize: 10, fontWeight: '600' },
  itemBody: { fontSize: FontSize.sm, lineHeight: 18, marginBottom: 4 },
  itemFullDate: { fontSize: 9, fontWeight: '500', opacity: 0.5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 120, paddingHorizontal: 40 },
  emptyIconBox: { width: 100, height: 100, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  emptyText: { fontSize: FontSize.xl, fontWeight: '800', marginBottom: 12 },
  emptySub: { fontSize: FontSize.base, textAlign: 'center', lineHeight: 22, opacity: 0.7 },
});
