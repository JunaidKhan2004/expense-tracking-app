import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming 
} from 'react-native-reanimated';
import { Radius, Spacing, FontSize } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
  showLabel?: boolean;
}

export function ProgressBar({ progress, color, height = 8, showLabel = false }: ProgressBarProps) {
  const { colors } = useTheme();
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(Math.min(Math.max(progress, 0), 100), { damping: 15 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Progress</Text>
          <Text style={[styles.value, { color: colors.text }]}>{Math.round(progress)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor: colors.border, borderRadius: height / 2 }]}>
        <Animated.View 
          style={[
            styles.fill, 
            { 
              backgroundColor: color || colors.primary, 
              height, 
              borderRadius: height / 2 
            }, 
            animatedStyle
          ]} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: Spacing.xs,
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  value: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
