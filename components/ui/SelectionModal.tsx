import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../hooks/useTheme';
import { FontSize, Radius, Spacing } from '../../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Option {
  id: string;
  label: string;
  subLabel?: string;
  icon?: string;
  iconColor?: string;
}

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: Option[];
  onSelect: (option: Option) => void;
  selectedValue?: string;
}

export function SelectionModal({
  visible,
  onClose,
  title,
  options,
  onSelect,
  selectedValue,
}: SelectionModalProps) {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.dismissArea} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <View style={[styles.content, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.header}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </View>

          <FlatList
            data={options}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.option,
                    { borderColor: colors.borderLight },
                    isSelected && { backgroundColor: colors.primaryGlow, borderColor: colors.primary }
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  {item.icon && (
                    <View style={[styles.iconBox, { backgroundColor: `${item.iconColor || colors.primary}22` }]}>
                      <Ionicons name={item.icon as any} size={18} color={item.iconColor || colors.primary} />
                    </View>
                  )}
                  <View style={styles.optionText}>
                    <Text style={[styles.optionLabel, { color: colors.text }, isSelected && { color: colors.primary }]}>
                      {item.label}
                    </Text>
                    {item.subLabel && (
                      <Text style={[styles.optionSub, { color: colors.textSecondary }]}>
                        {item.subLabel}
                      </Text>
                    )}
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
          />

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.borderLight }]}
            onPress={onClose}
          >
            <Text style={[styles.closeText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  content: {
    maxHeight: SCREEN_HEIGHT * 0.7,
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  list: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  closeBtn: {
    marginHorizontal: Spacing.base,
    height: 52,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  closeText: {
    fontSize: FontSize.base,
    fontWeight: '700',
  },
});
