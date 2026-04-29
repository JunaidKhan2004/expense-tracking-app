import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Radius, Shadow, Spacing } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlight' | 'bordered';
  padding?: number;
  noShadow?: boolean;
}

export function Card({ children, style, variant = 'default', padding = Spacing.base, noShadow = false }: CardProps) {
  const { colors } = useTheme();

  const bg =
    variant === 'highlight'
      ? colors.cardHighlight
      : colors.card;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: bg, padding },
        variant === 'bordered' && { borderWidth: 1, borderColor: colors.border },
        !noShadow && Shadow.md,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
  },
});
