import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { Radius } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 16, borderRadius = Radius.md, style }: SkeletonProps) {
  const { colors } = useTheme();
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 750, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.65] });

  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius, backgroundColor: colors.border, opacity }, style]}
    />
  );
}

export function SkeletonTransactionItem() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4 }}>
      <Skeleton width={44} height={44} borderRadius={14} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton width="55%" height={13} />
        <Skeleton width="30%" height={10} />
      </View>
      <Skeleton width={65} height={13} />
    </View>
  );
}

export function SkeletonCard({ lines = 2, style }: { lines?: number; style?: ViewStyle }) {
  return (
    <View style={[{ gap: 10 }, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={13} width={i === 0 ? '65%' : '40%'} />
      ))}
    </View>
  );
}

export function SkeletonBalanceCard() {
  return (
    <View style={{ gap: 12, padding: 20 }}>
      <Skeleton width="40%" height={12} />
      <Skeleton width="70%" height={36} borderRadius={8} />
      <Skeleton width="30%" height={10} />
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
        <Skeleton width="45%" height={40} borderRadius={10} />
        <Skeleton width="45%" height={40} borderRadius={10} />
      </View>
    </View>
  );
}
