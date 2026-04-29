import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { handleUnderDevelopment } from '../../components/ui/FeatureWrapper';
import { CURRENCIES } from '../../constants/categories';
import { FontSize, Radius, Shadow, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useTransactionStore } from '../../store/useTransactionStore';
import { useWalletStore } from '../../store/useWalletStore';
import { exportTransactionsToCSV, exportTransactionsToPDF } from '../../utils/export';
import { showToast } from '../../utils/toast';

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

function PremiumBanner({ colors }: any) {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Pulsing Star
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    // Floating Background Elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => handleUnderDevelopment('Premium Upgrade')}>
      <LinearGradient 
        colors={[colors.primary, colors.primaryDark]} 
        style={styles.premiumCard} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
      >
        {/* Animated Decor Circles */}
        <Animated.View style={[styles.premiumDecor, { transform: [{ translateY }] }]} />
        <Animated.View style={[styles.premiumDecorSmall, { transform: [{ translateY: Animated.multiply(translateY, -0.5) }] }]} />

        <Animated.View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.2)', width: 48, height: 48, transform: [{ scale: pulseAnim }] }]}>
          <Ionicons name="star" size={24} color="#FFB830" />
        </Animated.View>
        
        <View style={{ flex: 1 }}>
          <Text style={styles.premiumCardTitle}>Upgrade to Premium</Text>
          <Text style={styles.premiumCardSub}>Unlock cloud backup, unlimited wallets & AI spending insights</Text>
        </View>

        <View style={styles.premiumChevron}>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
        </View>
      </LinearGradient>
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
  const { transactions } = useTransactionStore();
  const { totalBalance } = useWalletStore();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } },
    ]);
  };

  const handleCurrencySelect = () => {
    Alert.alert(
      'Convert Currency',
      'This will permanently convert all your existing transactions and balances using current market rates. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        ...CURRENCIES.slice(0, 10).map((c) => ({
          text: `${c.symbol} ${c.name} (${c.code})`,
          onPress: async () => {
            try {
              await setCurrency(c.code);
              showToast.success('Currency Converted', `All values are now in ${c.code}`);
            } catch (err) {
              showToast.error('Conversion Failed', 'Please check your internet connection.');
            }
          },
        }))
      ]
    );
  };

  const handleExportPDF = async () => {
    try {
      showToast.info('Preparing PDF', 'Generating your report...');
      await exportTransactionsToPDF(
        transactions,
        settings.currency,
        user?.name || 'User',
        totalBalance()
      );
    } catch (err) {
      showToast.error('Export Failed', 'Could not generate PDF');
    }
  };

  const handleExportCSV = async () => {
    try {
      showToast.info('Preparing CSV', 'Generating your data file...');
      await exportTransactionsToCSV(transactions, settings.currency);
    } catch (err) {
      showToast.error('Export Failed', 'Could not generate CSV');
    }
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
          {/* <SettingRow
            icon="notifications-outline"
            label="Send Test Notification"
            colors={colors}
            color={colors.primary}
            onPress={async () => {
              const { useNotificationStore } = await import('../../store/useNotificationStore');
              const { sendLocalNotification } = await import('../../utils/notifications');
              await sendLocalNotification('FinVault Test 🚀', 'If you see this, notifications are working!');
              await useNotificationStore.getState().addNotification('FinVault Test 🚀', 'If you see this, notifications are working!', 'system');
            }}
          /> */}
          <SettingRow
            icon="time-outline"
            label="Notification History"
            colors={colors}
            color={colors.primary}
            onPress={() => router.push('/notifications')}
          />
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
          <SettingRow
            icon="lock-closed"
            label="Change PIN"
            onPress={() => router.push('/settings/security/pin' as any)}
            colors={colors}
            color={colors.warning}
          />
          <SettingRow
            icon="shield-checkmark"
            label="Privacy Policy"
            onPress={() => router.push('/settings/privacy' as any)}
            colors={colors}
            color="#6366F1"
          />
        </View>

        {/* Help & Support */}
        <SectionHeader title="HELP & SUPPORT" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="help-circle"
            label="Support & Feedback"
            onPress={() => handleUnderDevelopment('Support & Feedback')}
            colors={colors}
            color={colors.info}
          />
          <SettingRow
            icon="document-text"
            label="Terms of Service"
            onPress={() => handleUnderDevelopment('Terms of Service')}
            colors={colors}
            color={colors.textSecondary}
          />
        </View>

        {/* Data */}
        <SectionHeader title="DATA" colors={colors} />
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="cloud-upload"
            label="Backup to Cloud"
            value="Coming Soon"
            onPress={() => handleUnderDevelopment('Cloud Backup')}
            colors={colors}
            color={colors.primary}
          />
          <SettingRow
            icon="document-text"
            label="Export PDF Report"
            onPress={handleExportPDF}
            colors={colors}
            color="#EF4444"
          />
          <SettingRow
            icon="grid"
            label="Export CSV"
            onPress={handleExportCSV}
            colors={colors}
            color={colors.success}
          />
        </View>

        {/* Premium */}
        {!user?.isPremium && <PremiumBanner colors={colors} />}

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.dangerGlow, borderColor: colors.danger }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textMuted }]}>FinVault v1.0.0 · Built by <Text style={{ fontWeight: 'bold' }}>Junaid Dev</Text></Text>
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
  premiumCard: { 
    borderRadius: Radius.xxl, 
    padding: Spacing.xl, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: Spacing.md, 
    marginVertical: Spacing.md,
    overflow: 'hidden',
    position: 'relative',
    ...Shadow.primary
  },
  premiumCardTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: '900' },
  premiumCardSub: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.xs, marginTop: 2, lineHeight: 16 },
  premiumDecor: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: -40,
    right: -20,
  },
  premiumDecorSmall: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -20,
    left: 40,
  },
  premiumChevron: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, height: 52, borderRadius: Radius.xl, borderWidth: 1.5, marginTop: Spacing.lg },
  logoutText: { fontSize: FontSize.base, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: FontSize.xs, marginTop: Spacing.lg },
});
