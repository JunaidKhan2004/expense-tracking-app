import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch,
  TouchableOpacity, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { CURRENCIES } from '../../constants/categories';
import { Spacing, FontSize, Radius } from '../../constants/theme';

function SettingRow({ icon, label, value, onPress, rightElement, color, colors }: any) {
  return (
    <TouchableOpacity
      style={[styles.row, { borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: `${color ?? colors.primary}22` }]}>
        <Ionicons name={icon} size={18} color={color ?? colors.primary} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
        {value ? <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text> : null}
      </View>
      {rightElement ?? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />}
    </TouchableOpacity>
  );
}

function SectionHeader({ title, colors }: any) {
  return <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{title}</Text>;
}

export default function SettingsScreen() {
  const { colors, isDark } = useTheme();
  const { user, logout } = useAuthStore();
  const { settings, setTheme, setCurrency, toggleNotifications, toggleBiometric, updateSettings } = useSettingsStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const handleCurrencySelect = () => {
    Alert.alert(
      'Select Currency',
      undefined,
      CURRENCIES.slice(0, 8).map((c) => ({
        text: `${c.symbol} ${c.name} (${c.code})`,
        onPress: () => setCurrency(c.code),
      })).concat([{ text: 'Cancel', style: 'cancel' } as any])
    );
  };

  const firstName = user?.name?.split(' ')[0] ?? 'User';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Profile Card */}
        <LinearGradient colors={colors.gradient.primary} style={styles.profileCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email ?? ''}</Text>
            {user?.isPremium ? (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={12} color="#FFB830" />
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            ) : (
              <View style={styles.freeBadge}>
                <Text style={styles.freeText}>Free Plan</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Appearance */}
        <SectionHeader title="APPEARANCE" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="moon"
            label="Dark Mode"
            colors={colors}
            color={colors.primary}
            onPress={() => setTheme(isDark ? 'light' : 'dark')}
            rightElement={
              <Switch
                value={isDark}
                onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            icon="cash"
            label="Currency"
            value={CURRENCIES.find((c) => c.code === settings.currency)?.symbol + ' ' + settings.currency}
            onPress={handleCurrencySelect}
            colors={colors}
            color="#FFB830"
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="NOTIFICATIONS" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="notifications"
            label="Push Notifications"
            colors={colors}
            color={colors.accent}
            onPress={toggleNotifications}
            rightElement={
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            icon="alert-circle"
            label="Budget Alerts"
            colors={colors}
            color={colors.danger}
            onPress={() => updateSettings({ budgetAlerts: !settings.budgetAlerts })}
            rightElement={
              <Switch
                value={settings.budgetAlerts}
                onValueChange={(v) => updateSettings({ budgetAlerts: v })}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow
            icon="calendar"
            label="Monthly Report"
            colors={colors}
            color={colors.info}
            onPress={() => updateSettings({ monthlyReport: !settings.monthlyReport })}
            rightElement={
              <Switch
                value={settings.monthlyReport}
                onValueChange={(v) => updateSettings({ monthlyReport: v })}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* Security */}
        <SectionHeader title="SECURITY" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="finger-print"
            label="Biometric Lock"
            colors={colors}
            color={colors.success}
            onPress={toggleBiometric}
            rightElement={
              <Switch
                value={settings.biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ true: colors.primary, false: colors.border }}
                thumbColor="#fff"
              />
            }
          />
          <SettingRow icon="lock-closed" label="Change PIN" colors={colors} color={colors.warning} />
          <SettingRow icon="shield-checkmark" label="Privacy Policy" colors={colors} color="#6366F1" />
        </View>

        {/* Data */}
        <SectionHeader title="DATA" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="cloud-upload" label="Backup to Cloud" value="Pro feature" colors={colors} color={colors.primary} />
          <SettingRow icon="document-text" label="Export PDF Report" value="Pro feature" colors={colors} color="#EF4444" />
          <SettingRow icon="grid" label="Export CSV" value="Pro feature" colors={colors} color={colors.success} />
        </View>

        {/* Premium */}
        {!user?.isPremium && (
          <LinearGradient colors={['#FFB830', '#FF6B8A']} style={styles.premiumCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Ionicons name="star" size={24} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumCardTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumCardSub}>Unlock PDF exports, cloud backup & more</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </LinearGradient>
        )}

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.dangerGlow, borderColor: colors.danger }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textMuted }]}>FinVault v1.0.0 · Built with ❤️</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 54 },
  scroll: { paddingHorizontal: Spacing.base },
  title: { fontSize: FontSize.xxl, fontWeight: '800', marginBottom: Spacing.xl },
  profileCard: { borderRadius: Radius.xxl, padding: Spacing.xl, flexDirection: 'row', alignItems: 'center', gap: Spacing.base, marginBottom: Spacing.xl },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '800' },
  profileInfo: { flex: 1 },
  profileName: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  profileEmail: { color: 'rgba(255,255,255,0.75)', fontSize: FontSize.sm, marginTop: 2 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  premiumText: { color: '#FFB830', fontSize: FontSize.xs, fontWeight: '700' },
  freeBadge: { marginTop: 6, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  freeText: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs, fontWeight: '600' },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.sm, marginTop: Spacing.lg, paddingLeft: 4 },
  section: { borderRadius: Radius.xl, borderWidth: 1, overflow: 'hidden', marginBottom: Spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.base, gap: Spacing.md, borderBottomWidth: 1 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: FontSize.base, fontWeight: '600' },
  rowValue: { fontSize: FontSize.xs, fontWeight: '500', marginTop: 1 },
  premiumCard: { borderRadius: Radius.xl, padding: Spacing.base, flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginVertical: Spacing.md },
  premiumCardTitle: { color: '#fff', fontSize: FontSize.base, fontWeight: '800' },
  premiumCardSub: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.xs },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, height: 52, borderRadius: Radius.xl, borderWidth: 1.5, marginTop: Spacing.lg },
  logoutText: { fontSize: FontSize.base, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: FontSize.xs, marginTop: Spacing.lg },
});
