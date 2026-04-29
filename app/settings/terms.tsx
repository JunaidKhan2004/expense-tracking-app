import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { FontSize, Radius, Spacing } from '../../constants/theme';

function TermSection({ title, content, colors }: any) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
      <Text style={[styles.sectionContent, { color: colors.text }]}>{content}</Text>
    </View>
  );
}

export default function TermsScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Terms of Service',
          headerTransparent: true,
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/settings')} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={{ height: 100 }} />
        
        <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="document-text" size={40} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>FinVault Terms</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Last Updated: April 2024</Text>
        </View>

        <TermSection 
          colors={colors}
          title="1. Acceptance of Terms"
          content="By accessing and using FinVault, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this application."
        />

        <TermSection 
          colors={colors}
          title="2. Use License"
          content="Permission is granted to temporarily download one copy of the materials (information or software) on FinVault's application for personal, non-commercial transitory viewing only."
        />

        <TermSection 
          colors={colors}
          title="3. Data Privacy"
          content="Your financial data is yours. FinVault uses Supabase for secure data storage. While we implement industry-standard security measures, we cannot guarantee absolute security of data transmitted over the internet."
        />

        <TermSection 
          colors={colors}
          title="4. Premium Subscriptions"
          content="Premium features are available via subscription. Payments are processed securely through the Apple App Store or Google Play Store. Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period."
        />

        <TermSection 
          colors={colors}
          title="5. Disclaimer"
          content="The materials on FinVault's application are provided on an 'as is' basis. FinVault makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability."
        />

        <TermSection 
          colors={colors}
          title="6. Limitations"
          content="In no event shall FinVault or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FinVault's application."
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Questions about our terms? Contact us at legal@finvault.com
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.base },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerCard: { borderRadius: Radius.xxl, padding: Spacing.xxl, borderWidth: 1, alignItems: 'center', marginBottom: Spacing.xl },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: '800', marginTop: Spacing.md },
  headerSub: { fontSize: FontSize.sm, marginTop: 4 },
  section: { marginBottom: Spacing.xl, paddingHorizontal: 4 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: '800', marginBottom: 8 },
  sectionContent: { fontSize: FontSize.md, lineHeight: 24, opacity: 0.9 },
  footer: { marginTop: Spacing.xl, paddingVertical: Spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', alignItems: 'center' },
  footerText: { fontSize: FontSize.xs, textAlign: 'center' },
});
