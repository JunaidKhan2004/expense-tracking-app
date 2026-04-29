import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useAuthStore } from '../store/useAuthStore';
import { FontSize, Radius, Spacing, Shadow } from '../constants/theme';
import { showToast } from '../utils/toast';

const { width } = Dimensions.get('window');

function FeatureItem({ icon, title, description, colors }: any) {
  return (
    <View style={styles.featureRow}>
      <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}22` }]}>
        <Ionicons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );
}

export default function PremiumScreen() {
  const { colors } = useTheme();
  const { purchasePremium, isLoading, user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    if (user?.isPremium) {
      showToast.info('Already Premium', 'You are already enjoying all premium features!');
      return;
    }

    setIsProcessing(true);
    const success = await purchasePremium();
    setIsProcessing(false);

    if (success) {
      showToast.success('Welcome to Premium!', 'All features have been unlocked for you.');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/settings');
      }
    } else {
      showToast.error('Purchase Failed', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'FinVault Premium',
          headerTransparent: true,
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/settings')} style={styles.backBtn}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }} 
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={{ height: 100 }} />
        
        {/* Hero Section */}
        <LinearGradient 
          colors={colors.gradient.primary} 
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="star" size={60} color="#FFB830" />
          <Text style={styles.heroTitle}>Level Up Your Finances</Text>
          <Text style={styles.heroSub}>Unlock the full power of FinVault and take control of your future.</Text>
        </LinearGradient>

        {/* Features List */}
        <View style={styles.featuresList}>
          <FeatureItem 
            colors={colors}
            icon="cloud-upload"
            title="Real-time Cloud Sync"
            description="Access your data from any device. Securely backed up in the cloud."
          />
          <FeatureItem 
            colors={colors}
            icon="wallet"
            title="Unlimited Wallets"
            description="Manage multiple bank accounts, cash, and credit cards without limits."
          />
          <FeatureItem 
            colors={colors}
            icon="sparkles"
            title="Advanced AI Insights"
            description="Get behavioral analysis and future spending forecasts powered by AI."
          />
          <FeatureItem 
            colors={colors}
            icon="document-text"
            title="Premium PDF Reports"
            description="Export beautiful, branded PDF summaries for your taxes or records."
          />
          <FeatureItem 
            colors={colors}
            icon="color-palette"
            title="Exclusive Themes"
            description="Unlock Midnight Gold, Ruby Red, and more premium color palettes."
          />
        </View>

        {/* Pricing Card */}
        <View style={[styles.priceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>LIFETIME ACCESS</Text>
          <View style={styles.priceRow}>
            <Text style={[styles.currency, { color: colors.text }]}>$</Text>
            <Text style={[styles.amount, { color: colors.text }]}>9.99</Text>
            <Text style={[styles.period, { color: colors.textSecondary }]}>/ once</Text>
          </View>
          <Text style={[styles.priceSub, { color: colors.textMuted }]}>No monthly fees. Pay once, own forever.</Text>

          <TouchableOpacity 
            style={[styles.buyBtn, (isLoading || isProcessing) && { opacity: 0.8 }]} 
            onPress={handlePurchase}
            disabled={isLoading || isProcessing}
          >
            <LinearGradient colors={colors.gradient.primary} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {isLoading || isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{user?.isPremium ? 'Already Purchased' : 'Get Premium Now'}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={[styles.secureText, { color: colors.textMuted }]}>
            <Ionicons name="shield-checkmark" size={12} /> Secure transaction via App Store
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
  heroCard: { borderRadius: Radius.xxl, padding: Spacing.xxl, alignItems: 'center', marginBottom: Spacing.xl, ...Shadow.primary },
  heroTitle: { color: '#fff', fontSize: FontSize.xxl, fontWeight: '900', marginTop: Spacing.md, textAlign: 'center' },
  heroSub: { color: 'rgba(255,255,255,0.85)', fontSize: FontSize.sm, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  featuresList: { gap: Spacing.lg, marginBottom: Spacing.xxl, paddingHorizontal: 4 },
  featureRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  featureIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featureContent: { flex: 1 },
  featureTitle: { fontSize: FontSize.base, fontWeight: '700', marginBottom: 2 },
  featureDesc: { fontSize: FontSize.xs, lineHeight: 16 },
  priceCard: { borderRadius: Radius.xxl, padding: Spacing.xl, borderWidth: 1, alignItems: 'center', ...Shadow.lg },
  priceLabel: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 1, marginBottom: Spacing.sm },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  currency: { fontSize: FontSize.xl, fontWeight: '700' },
  amount: { fontSize: 48, fontWeight: '900' },
  period: { fontSize: FontSize.base, fontWeight: '600' },
  priceSub: { fontSize: FontSize.xs, marginTop: 4, marginBottom: Spacing.xl },
  buyBtn: { width: '100%', borderRadius: Radius.xl, overflow: 'hidden' },
  btnGradient: { height: 56, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '800' },
  secureText: { fontSize: 10, marginTop: Spacing.md, opacity: 0.6 },
});
