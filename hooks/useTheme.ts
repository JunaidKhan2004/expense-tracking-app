import { useSettingsStore } from '../store/useSettingsStore';
import { Colors } from '../constants/theme';

export function useTheme() {
  const { settings } = useSettingsStore();
  const isDark = settings.theme === 'dark';
  const colors = isDark ? Colors.dark : Colors.light;
  return { colors, isDark, theme: settings.theme };
}
