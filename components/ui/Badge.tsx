import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Radius, FontSize, Spacing } from '../../constants/theme';

interface BadgeProps {
  label: string;
  color?: string;
  icon?: string;
  size?: 'sm' | 'md';
  onPress?: () => void;
  style?: ViewStyle;
}

export function Badge({ label, color, icon, size = 'md', onPress, style }: BadgeProps) {
  const { colors } = useTheme();
  const bg = color ? `${color}22` : colors.primaryGlow;
  const textColor = color ?? colors.primary;
  const isSmall = size === 'sm';

  const content = (
    <View style={[styles.badge, { backgroundColor: bg, paddingHorizontal: isSmall ? 8 : 12, paddingVertical: isSmall ? 3 : 5 }, style]}>
      {icon && <Ionicons name={icon as any} size={isSmall ? 10 : 12} color={textColor} style={{ marginRight: 4 }} />}
      <Text style={[styles.label, { color: textColor, fontSize: isSmall ? FontSize.xs : FontSize.sm }]}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

// ─── Filter Pill Group ────────────────────────────────────────────────────────

interface FilterPillsProps {
  options: { label: string; value: string }[];
  selected: string;
  onSelect: (value: string) => void;
}

export function FilterPills({ options, selected, onSelect }: FilterPillsProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.pills}>
      {options.map((o) => {
        const isActive = o.value === selected;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onSelect(o.value)}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? colors.primary : colors.card,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, { color: isActive ? '#fff' : colors.textSecondary }]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
