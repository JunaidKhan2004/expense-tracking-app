import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Spacing, FontSize, Radius } from '../../constants/theme';

export default function PrivacyPolicyScreen() {
  const { colors } = useTheme();

  const Section = ({ title, content }: { title: string; content: string }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>{content}</Text>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.infoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          <Text style={[styles.infoTitle, { color: colors.text }]}>Your Data is Secure</Text>
          <Text style={[styles.infoSub, { color: colors.textSecondary }]}>
            At FinVault, we prioritize your financial privacy. All your data is encrypted and synced securely via Supabase.
          </Text>
        </View>

        <Section 
          title="1. Data Collection" 
          content="We collect transaction data, wallet balances, and budget configurations that you manually enter. We also collect device-specific information for push notifications and biometric authentication."
        />

        <Section 
          title="2. How We Use Data" 
          content="Your data is used solely to provide you with financial insights, budget alerts, and data synchronization across your devices. We do not sell or share your personal financial data with third parties."
        />

        <Section 
          title="3. Security Measures" 
          content="FinVault uses industry-standard encryption for data in transit and at rest. Biometric data (FaceID/Fingerprint) is handled by your device's secure enclave and is never stored on our servers."
        />

        <Section 
          title="4. Data Portability" 
          content="You have the right to export your transaction data at any time via the CSV and PDF export tools available in the Settings menu."
        />

        <Section 
          title="5. Account Deletion" 
          content="You can delete your account and all associated data through the settings menu. Once deleted, this action cannot be undone."
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>Last Updated: April 29, 2026</Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>© 2026 FinVault Financial Inc.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.base, marginBottom: Spacing.lg },
  backBtn: { padding: 4, marginRight: Spacing.sm },
  title: { fontSize: FontSize.xl, fontWeight: '800' },
  scroll: { paddingHorizontal: Spacing.base, paddingBottom: 40 },
  infoBox: { padding: Spacing.xl, borderRadius: Radius.xxl, borderWidth: 1, alignItems: 'center', marginBottom: Spacing.xl },
  infoTitle: { fontSize: FontSize.lg, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  infoSub: { fontSize: FontSize.sm, textAlign: 'center', lineHeight: 22 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '800', marginBottom: 10, letterSpacing: 0.5 },
  sectionContent: { fontSize: FontSize.sm, lineHeight: 24 },
  footer: { marginTop: 20, alignItems: 'center', paddingVertical: 20 },
  footerText: { fontSize: 12, marginBottom: 4 },
});
