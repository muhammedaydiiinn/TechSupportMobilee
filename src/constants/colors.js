// Importing from the centralized theme
import { COLORS as THEME_COLORS } from './theme';

// Re-exporting COLORS for backward compatibility
export const COLORS = {
  primary: THEME_COLORS.primary,
  secondary: '#FF9800', // Keeping for backward compatibility
  accent: '#673AB7',    // Keeping for backward compatibility
  white: THEME_COLORS.white,
  black: THEME_COLORS.black,
  textLight: THEME_COLORS.textLight,
  error: THEME_COLORS.error.text,
  success: THEME_COLORS.success.text,
  warning: '#FFC107',   // Keeping for backward compatibility
  background: THEME_COLORS.background,
  text: THEME_COLORS.text,
  inputBackground: THEME_COLORS.inputBackground,
  inputBorder: THEME_COLORS.border,
  inputText: THEME_COLORS.placeholder,
};

// For smooth transition, the above keeps the old naming pattern
// but pulls values from the new theme system.