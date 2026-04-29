import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';
import { Radius, FontSize, FontWeight, Spacing } from '../../constants/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const { colors } = useTheme();

  const sizeStyles = {
    sm: { height: 40, paddingHorizontal: Spacing.md, fontSize: FontSize.sm },
    md: { height: 52, paddingHorizontal: Spacing.lg, fontSize: FontSize.base },
    lg: { height: 60, paddingHorizontal: Spacing.xl, fontSize: FontSize.lg },
  }[size];

  const isDisabled = disabled || loading;

  const content = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? colors.primary : '#fff'} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { fontSize: sizeStyles.fontSize },
              variant === 'outline' && { color: colors.primary },
              variant === 'ghost' && { color: colors.primary },
              variant === 'danger' && { color: '#fff' },
              variant === 'success' && { color: '#fff' },
              isDisabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        style={[{ width: fullWidth ? '100%' : 'auto', opacity: isDisabled ? 0.6 : 1 }, style]}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={colors.gradient.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, { height: sizeStyles.height, paddingHorizontal: sizeStyles.paddingHorizontal }]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyle: ViewStyle =
    variant === 'outline'
      ? { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.primary }
      : variant === 'ghost'
      ? { backgroundColor: colors.primaryGlow }
      : variant === 'danger'
      ? { backgroundColor: colors.danger }
      : variant === 'success'
      ? { backgroundColor: colors.success }
      : { backgroundColor: colors.card };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        variantStyle,
        { height: sizeStyles.height, paddingHorizontal: sizeStyles.paddingHorizontal, width: fullWidth ? '100%' : 'auto', opacity: isDisabled ? 0.6 : 1 },
        style,
      ]}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold as any,
    letterSpacing: 0.3,
  },
  disabledText: {
    opacity: 0.7,
  },
  iconLeft: { marginRight: Spacing.sm },
  iconRight: { marginLeft: Spacing.sm },
});
