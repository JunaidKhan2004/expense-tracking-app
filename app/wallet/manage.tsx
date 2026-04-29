import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { useWalletStore } from '../../store/useWalletStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { FontSize, Radius, Spacing, Shadow } from '../../constants/theme';
import { formatCurrency } from '../../utils/formatters';
import { showToast } from '../../utils/toast';

const { width } = Dimensions.get('window');

const WALLET_TYPES = [
  { label: 'Cash', value: 'cash', icon: 'wallet' },
  { label: 'Bank', value: 'bank', icon: 'business' },
  { label: 'Card', value: 'card', icon: 'card' },
  { label: 'Savings', value: 'savings', icon: 'safe' },
  { label: 'Investment', value: 'investment', icon: 'trending-up' },
];

const COLORS = ['#408A71', '#FFB830', '#FF4B4B', '#7C6FFF', '#00A8FF', '#FF6B6B'];

export default function WalletManageScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { wallets, addWallet, deleteWallet, isLoading, activeWalletId, setActiveWallet } = useWalletStore();
  const { user } = useAuthStore();
  const { settings } = useSettingsStore();

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState('wallet');

  const handleAddWallet = async () => {
    if (!name.trim()) {
      showToast.error('Required', 'Please enter a wallet name');
      return;
    }

    try {
      await addWallet({
        name: name.trim(),
        type: type as any,
        balance: 0,
        currency: settings.currency,
        color,
        icon,
        isDefault: wallets.length === 0,
      });
      showToast.success('Wallet Added', `${name} has been created.`);
      setIsAdding(false);
      setName('');
    } catch (err: any) {
      if (err.message === 'LIMIT_REACHED') {
        router.push('/premium');
      } else {
        showToast.error('Error', 'Could not add wallet');
      }
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (wallets.length <= 1) {
      showToast.error('Cannot Delete', 'You must have at least one wallet.');
      return;
    }

    Alert.alert(
      'Delete Wallet',
      `Are you sure you want to delete ${name}? All transaction history for this wallet will be affected.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteWallet(id) },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Manage Wallets', headerTitleStyle: { fontWeight: '800' } }} />

      <ScrollView 
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + Spacing.sm }]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Manage Wallets</Text>
        </View>

        {/* Existing Wallets */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACTIVE WALLETS</Text>
        <View style={styles.walletList}>
          {wallets.map((wallet) => (
            <TouchableOpacity 
              key={wallet.id} 
              activeOpacity={0.8}
              onPress={() => setActiveWallet(wallet.id)}
              style={[
                styles.walletItem, 
                { backgroundColor: colors.card, borderColor: activeWalletId === wallet.id ? colors.primary : colors.border }
              ]}
            >
              <LinearGradient colors={[wallet.color, `${wallet.color}cc`]} style={styles.walletIcon}>
                <Ionicons name={wallet.icon as any} size={20} color="#fff" />
              </LinearGradient>
              <View style={styles.walletInfo}>
                <Text style={[styles.walletName, { color: colors.text }]}>{wallet.name}</Text>
                <Text style={[styles.walletBalance, { color: colors.textSecondary }]}>
                  {formatCurrency(wallet.balance, settings.currency)}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(wallet.id, wallet.name)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add New Section */}
        {!isAdding ? (
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: colors.primaryGlow, borderColor: colors.primary }]}
            onPress={() => setIsAdding(true)}
          >
            <Ionicons name="add" size={24} color={colors.primary} />
            <Text style={[styles.addBtnText, { color: colors.primary }]}>Add New Wallet</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Create New Wallet</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Wallet Name</Text>
              <TextInput
                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                placeholder="e.g. Personal Savings"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Wallet Type</Text>
              <View style={styles.typeRow}>
                {WALLET_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.typeItem,
                      { backgroundColor: colors.background, borderColor: type === t.value ? colors.primary : colors.border }
                    ]}
                    onPress={() => { setType(t.value); setIcon(t.icon); }}
                  >
                    <Ionicons name={t.icon as any} size={18} color={type === t.value ? colors.primary : colors.textMuted} />
                    <Text style={[styles.typeLabel, { color: type === t.value ? colors.primary : colors.textMuted }]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Color Theme</Text>
              <View style={styles.colorRow}>
                {COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorItem, { backgroundColor: c, borderColor: color === c ? '#fff' : 'transparent', borderWidth: 2 }]}
                    onPress={() => setColor(c)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsAdding(false)}>
                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleAddWallet}>
                {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Save Wallet</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: Spacing.base, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  backBtn: { marginRight: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: '800' },
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.md, marginTop: Spacing.sm },
  walletList: { gap: Spacing.md, marginBottom: Spacing.xl },
  walletItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.xl, borderWidth: 1, ...Shadow.sm },
  walletIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  walletInfo: { flex: 1, marginLeft: Spacing.md },
  walletName: { fontSize: FontSize.base, fontWeight: '700' },
  walletBalance: { fontSize: FontSize.sm, fontWeight: '600', marginTop: 2 },
  deleteBtn: { padding: 8 },
  addBtn: { height: 56, borderRadius: Radius.xl, borderStyle: 'dashed', borderWidth: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  addBtnText: { fontSize: FontSize.base, fontWeight: '700' },
  // Form
  form: { padding: Spacing.xl, borderRadius: Radius.xxl, borderWidth: 1, ...Shadow.lg },
  formTitle: { fontSize: FontSize.lg, fontWeight: '800', marginBottom: Spacing.xl },
  inputGroup: { marginBottom: Spacing.lg },
  label: { fontSize: FontSize.xs, fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  input: { height: 50, borderRadius: Radius.lg, borderWidth: 1, paddingHorizontal: Spacing.md, fontSize: FontSize.base },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeItem: { width: (width - Spacing.base * 4 - 20) / 3, height: 60, borderRadius: Radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 4 },
  typeLabel: { fontSize: 10, fontWeight: '700' },
  colorRow: { flexDirection: 'row', gap: 12 },
  colorItem: { width: 36, height: 36, borderRadius: 18 },
  formActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  cancelBtn: { flex: 1, height: 50, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontSize: FontSize.base, fontWeight: '700' },
  saveBtn: { flex: 2, height: 50, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', ...Shadow.primary },
  saveText: { color: '#fff', fontSize: FontSize.base, fontWeight: '800' },
});
