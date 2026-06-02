import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { useTransactionStore } from '../../store/useTransactionStore';
import { Spacing, FontSize, Radius, Shadow } from '../../constants/theme';
import { showToast } from '../../utils/toast';
import { Category } from '../../types';

const ICONS = [
  'cart', 'fast-food', 'bus', 'home', 'game-controller', 'gift', 
  'medical', 'school', 'fitness', 'briefcase', 'airplane', 'car',
  'cafe', 'pizza', 'shirt', 'laptop', 'build', 'cash', 'card', 'stats-chart'
];

const COLORS = [
  '#6366F1', '#EC4899', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', 
  '#3B82F6', '#06B6D4', '#22C55E', '#F97316', '#64748B', '#A855F7'
];

export default function CategoryManageScreen() {
  const { colors, isDark } = useTheme();
  const { categories, addCategory, deleteCategory } = useTransactionStore();

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [selectedType, setSelectedType] = useState<'expense' | 'income' | 'both'>('expense');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customCategories = categories.filter(c => c.isCustom);

  const CATEGORY_MAX_LENGTH = 30;

  const handleAddCategory = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      showToast.error('Error', 'Please enter a category name');
      return;
    }
    if (trimmedName.length > CATEGORY_MAX_LENGTH) {
      showToast.error('Name Too Long', `Category name must be ${CATEGORY_MAX_LENGTH} characters or less`);
      return;
    }
    const duplicate = categories.some(
      c => c.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (duplicate) {
      showToast.error('Already Exists', 'A category with this name already exists');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCategory({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        type: selectedType,
      });
      showToast.success('Success', 'Category added successfully');
      setName('');
      setSelectedIcon(ICONS[0]);
      setSelectedColor(COLORS[0]);
    } catch (error) {
      showToast.error('Error', 'Failed to add category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Category',
      'Are you sure you want to delete this category? Transactions in this category will not be deleted but may lose their category link.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id);
              showToast.success('Deleted', 'Category removed');
            } catch (err) {
              showToast.error('Error', 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.root, { backgroundColor: colors.background }]}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Categories</Text>
        </View>

        {/* Add New Section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Add New Category</Text>
          
          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={[styles.previewIcon, { backgroundColor: `${selectedColor}22` }]}>
                <Ionicons name={selectedIcon as any} size={20} color={selectedColor} />
              </View>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Category Name (max 30)"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={30}
              />
            </View>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Select Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconItem,
                    { 
                      backgroundColor: selectedIcon === icon ? colors.primaryGlow : colors.background,
                      borderColor: selectedIcon === icon ? colors.primary : colors.border
                    }
                  ]}
                >
                  <Ionicons name={icon as any} size={20} color={selectedIcon === icon ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.label, { color: colors.textSecondary }]}>Select Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.colorItem,
                    { backgroundColor: color, borderColor: selectedColor === color ? (isDark ? '#fff' : '#000') : 'transparent' }
                  ]}
                />
              ))}
            </ScrollView>

            <TouchableOpacity 
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddCategory}
              disabled={isSubmitting}
            >
              <Text style={styles.addBtnText}>{isSubmitting ? 'Adding...' : 'Create Category'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* List Section */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>Custom Categories</Text>
        {customCategories.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={{ color: colors.textMuted }}>No custom categories yet</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {customCategories.map(cat => (
              <View key={cat.id} style={[styles.catItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.previewIcon, { backgroundColor: `${cat.color}22` }]}>
                  <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                </View>
                <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                <TouchableOpacity onPress={() => handleDelete(cat.id)} style={styles.deleteBtn}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* System Categories (Read Only) */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.xl }]}>System Categories</Text>
        <View style={styles.list}>
          {categories.filter(c => !c.isCustom).map(cat => (
            <View key={cat.id} style={[styles.catItem, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.7 }]}>
              <View style={[styles.previewIcon, { backgroundColor: `${cat.color}22` }]}>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textMuted} />
            </View>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.base, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xl },
  backBtn: { marginRight: Spacing.md },
  title: { fontSize: FontSize.xl, fontWeight: '800' },
  card: { borderRadius: Radius.xxl, padding: Spacing.xl, borderWidth: 1, ...Shadow.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '800', marginBottom: Spacing.md },
  form: { gap: Spacing.md },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 56, borderWidth: 1, borderRadius: Radius.lg, paddingHorizontal: Spacing.md, gap: Spacing.md },
  previewIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: FontSize.base, fontWeight: '600' },
  label: { fontSize: FontSize.xs, fontWeight: '700', letterSpacing: 0.5, marginTop: Spacing.sm },
  iconScroll: { marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl },
  iconItem: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm, borderWidth: 1 },
  colorItem: { width: 34, height: 34, borderRadius: 17, marginRight: Spacing.md, borderWidth: 2 },
  addBtn: { height: 52, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md },
  addBtnText: { color: '#fff', fontSize: FontSize.base, fontWeight: '700' },
  list: { gap: Spacing.sm },
  catItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.xl, borderWidth: 1, gap: Spacing.md },
  catName: { flex: 1, fontSize: FontSize.base, fontWeight: '600' },
  deleteBtn: { padding: 4 },
  empty: { padding: Spacing.xl, borderRadius: Radius.xl, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
