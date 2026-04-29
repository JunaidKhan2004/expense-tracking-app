import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Spacing, FontSize } from '../../constants/theme';
import { showToast } from '../../utils/toast';

const { width, height } = Dimensions.get('window');

export default function ScanReceiptScreen() {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);
  const [isCaptured, setIsCaptured] = useState(false);
  const [scanningProgress] = useState(new Animated.Value(0));
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (isScanning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanningProgress, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(scanningProgress, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      scanningProgress.stopAnimation();
    }
  }, [isScanning]);

  if (!permission) {
    return <View style={[styles.root, { backgroundColor: colors.background }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, padding: Spacing.xl, justifyContent: 'center', alignItems: 'center' }]}>
        <Ionicons name="camera-outline" size={80} color={colors.textMuted} />
        <Text style={[styles.permTitle, { color: colors.text }]}>Camera Access Needed</Text>
        <Text style={[styles.permSub, { color: colors.textSecondary }]}>We need permission to scan your receipts and extract expense details.</Text>
        <TouchableOpacity style={[styles.permBtn, { backgroundColor: colors.primary }]} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current) {
      showToast.error('Camera Error', 'Camera not ready. Please try again.');
      return;
    }

    try {
      setIsScanning(true);
      
      // Attempting to capture (Simulated)
      // const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      
      // Simulating a random error (e.g., Blurry or Poor Lighting)
      const shouldFail = Math.random() < 0.15; // 15% chance to simulate error
      
      setTimeout(() => {
        if (shouldFail) {
          setIsScanning(false);
          Alert.alert(
            'Scan Failed',
            'The image was too blurry or lighting was poor. Please try again with a clearer shot.',
            [{ text: 'Try Again', onPress: () => setIsScanning(false) }]
          );
          return;
        }

        setIsScanning(false);
        setIsCaptured(true);
        
        // Dynamic Mock Data Scenarios
        const scenarios = [
          { amount: '84.50', title: 'Starbucks Coffee', category: 'food' },
          { amount: '120.00', title: 'Shell Gas Station', category: 'transport' },
          { amount: '45.25', title: 'Walmart Supercenter', category: 'shopping' },
          { amount: '15.99', title: 'Netflix Subscription', category: 'entertainment' },
          { amount: '250.00', title: 'Apple Store', category: 'electronics' },
        ];
        
        const mockData = scenarios[Math.floor(Math.random() * scenarios.length)];

        showToast.success('Receipt Scanned', `${mockData.title} detected`);
        
        router.replace({
          pathname: '/transaction/add',
          params: { 
            amount: mockData.amount,
            title: mockData.title,
            category: mockData.category,
            scanMode: 'true'
          }
        });
      }, 3000);
    } catch (err) {
      setIsScanning(false);
      console.error('OCR Error:', err);
      showToast.error('System Error', 'Could not access camera. Please restart the app.');
    }
  };

  const lineTranslateY = scanningProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.8],
  });

  return (
    <View style={styles.root}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Receipt</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Guide Frame */}
          <View style={styles.frameContainer}>
            <View style={styles.guideFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {isScanning && (
                <Animated.View style={[styles.scanLine, { transform: [{ translateY: lineTranslateY }] }]}>
                  <LinearGradient 
                    colors={['transparent', 'rgba(0, 168, 255, 0.5)', 'transparent']} 
                    style={{ flex: 1 }} 
                  />
                </Animated.View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.hintText}>
              {isScanning ? 'Processing Receipt...' : 'Align receipt within the frame'}
            </Text>
            
            <View style={styles.controls}>
              <TouchableOpacity style={styles.galleryBtn}>
                <Ionicons name="images-outline" size={28} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.captureOuter} 
                onPress={handleCapture}
                disabled={isScanning}
              >
                <View style={[styles.captureInner, { backgroundColor: isScanning ? '#ccc' : '#fff' }]}>
                  {isScanning && <ActivityIndicator color="#00A8FF" />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.flashBtn}>
                <Ionicons name="flash-outline" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'space-between' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: Spacing.base,
    paddingTop: 60,
  },
  headerTitle: { color: '#fff', fontSize: FontSize.lg, fontWeight: '800' },
  closeBtn: { padding: 4 },
  frameContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guideFrame: {
    width: width * 0.8,
    height: width * 1.1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    position: 'relative',
  },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#00A8FF', borderWidth: 4 },
  topLeft: { top: -2, left: -2, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: -2, right: -2, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: -2, left: -2, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: -2, right: -2, borderTopWidth: 0, borderLeftWidth: 0 },
  scanLine: { 
    position: 'absolute', 
    width: '100%', 
    height: 4, 
    backgroundColor: '#00A8FF',
    shadowColor: '#00A8FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  footer: { paddingBottom: 60, alignItems: 'center' },
  hintText: { color: '#fff', fontSize: FontSize.sm, fontWeight: '600', marginBottom: 30, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 40 },
  captureOuter: { 
    width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center'
  },
  captureInner: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  galleryBtn: { padding: 10 },
  flashBtn: { padding: 10 },
  permTitle: { fontSize: FontSize.xl, fontWeight: '800', marginTop: 24, marginBottom: 8 },
  permSub: { fontSize: FontSize.base, textAlign: 'center', paddingHorizontal: 40, lineHeight: 22, marginBottom: 32 },
  permBtn: { paddingHorizontal: 32, height: 50, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  permBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
});
