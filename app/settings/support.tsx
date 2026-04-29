import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { FontSize, Radius, Spacing, Shadow } from '../../constants/theme';
import { showToast } from '../../utils/toast';

export default function SupportScreen() {
  const { colors } = useTheme();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      showToast.error('Missing Info', 'Please fill in both subject and message');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      showToast.success('Feedback Sent', 'Thank you for helping us improve FinVault!');
      setSubject('');
      setMessage('');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/settings');
      }
    }, 1500);
  };

  const handleEmailSupport = async () => {
    const url = 'mailto:support@finvault.com?subject=Support Request';
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    } else {
      showToast.error('Email Error', 'No email client found on this device');
    }
  };

  const handleOpenFAQ = async () => {
    const url = 'https://finvault.com/faq';
    try {
      if (await Linking.canOpenURL(url)) {
        await Linking.openURL(url);
      } else {
        showToast.error('Link Error', 'Cannot open FAQ at this moment');
      }
    } catch (err) {
      showToast.error('Link Error', 'Unable to open link');
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTitle: 'Support & Feedback',
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
        
        {/* Contact Options */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>GET IN TOUCH</Text>
        <View style={styles.optionsRow}>
          <TouchableOpacity style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleEmailSupport}>
            <LinearGradient colors={colors.gradient.primary} style={styles.optionIcon}>
              <Ionicons name="mail" size={20} color="#fff" />
            </LinearGradient>
            <Text style={[styles.optionLabel, { color: colors.text }]}>Email Us</Text>
            <Text style={[styles.optionSub, { color: colors.textSecondary }]}>support@finvault.com</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.optionCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleOpenFAQ}>
            <LinearGradient colors={colors.gradient.card3} style={styles.optionIcon}>
              <Ionicons name="help-buoy" size={20} color="#fff" />
            </LinearGradient>
            <Text style={[styles.optionLabel, { color: colors.text }]}>Visit FAQ</Text>
            <Text style={[styles.optionSub, { color: colors.textSecondary }]}>Common Questions</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback Form */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary, marginTop: Spacing.xl }]}>SEND FEEDBACK</Text>
        <View style={[styles.form, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Subject</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: Spacing.md }]}>Message</Text>
          <TextInput
            style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
            placeholder="Tell us more about your experience or report a bug..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={message}
            onChangeText={setMessage}
          />

          <TouchableOpacity 
            style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <LinearGradient colors={colors.gradient.primary} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              {isSubmitting ? (
                <Text style={styles.btnText}>Sending...</Text>
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.btnText}>Submit Feedback</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Our team typically responds to support requests within 24-48 hours.
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
  sectionTitle: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 1, marginBottom: Spacing.md },
  optionsRow: { flexDirection: 'row', gap: Spacing.md },
  optionCard: { flex: 1, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, alignItems: 'center', ...Shadow.sm },
  optionIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  optionLabel: { fontSize: FontSize.base, fontWeight: '700', marginBottom: 2 },
  optionSub: { fontSize: FontSize.xs, fontWeight: '500' },
  form: { borderRadius: Radius.xxl, padding: Spacing.xl, borderWidth: 1, ...Shadow.md },
  inputLabel: { fontSize: FontSize.xs, fontWeight: '700', marginBottom: 8, marginLeft: 4 },
  input: { height: 50, borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, fontSize: FontSize.base },
  textArea: { height: 120, borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, fontSize: FontSize.base },
  submitBtn: { marginTop: Spacing.xl, borderRadius: Radius.xl, overflow: 'hidden' },
  btnGradient: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  btnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: Spacing.xl, paddingHorizontal: Spacing.sm },
  infoText: { flex: 1, fontSize: FontSize.xs, lineHeight: 18 },
});
