import { Platform } from 'react-native';

// Theme configuration for TechSupport Mobile App
// Based on the web app theme guide

// Colors
export const COLORS = {
  // Primary Colors
  primary: '#3b82f6',     // Main blue for buttons, links, and primary actions
  primaryDark: '#1e40af', // Deep blue for sidebar gradient, hover states
  white: '#ffffff',       // White for backgrounds and text areas

  // Gray Shades
  background: '#f5f7fa',  // Light gray for page backgrounds, container backgrounds
  border: '#e2e8f0',      // Gray for borders, dividers, input edges
  placeholder: '#94a3b8', // Medium gray for placeholder text, secondary content
  textLight: '#64748b',   // Darker gray for secondary text, labels
  formLabel: '#475569',   // Even darker gray for form labels
  text: '#334155',        // Darkest gray for main text, headings

  // Notification Colors
  error: {
    background: '#fee2e2',
    text: '#b91c1c',
    border: '#ef4444',
  },
  success: {
    background: '#ecfdf5',
    text: '#065f46',
    border: '#10b981',
  },

  // Additional UI Colors
  black: '#000000',       // Pure black for specific uses
  inputBackground: '#ffffff', // Input field background
  cardBackground: '#ffffff',  // Card background
};

// Typography
export const FONTS = {
  // Font Sizes
  size: {
    h1: 28,         // 1.75rem
    h2: 24,         // 1.5rem
    h3: 20,         // 1.25rem
    normal: 14,     // 0.875rem
    small: 12,      // 0.75rem
  },
  
  // Font Weights (using React Native's naming)
  weight: {
    bold: '700',      // For main headings
    semiBold: '600',  // For subheadings, buttons
    medium: '500',    // For labels
    regular: '400',   // For normal text
  }
};

// Spacing
export const SPACING = {
  xs: 4,    // Extra small spacing
  s: 8,     // Small spacing
  m: 16,    // Medium spacing (1rem equivalent)
  l: 24,    // Large spacing (1.5rem equivalent)
  xl: 32,   // Extra large spacing (2rem equivalent)
  xxl: 48,  // Extra extra large spacing (3rem equivalent)
};

// Border Radius
export const RADIUS = {
  s: 6,     // Small radius for buttons, inputs
  m: 12,    // Medium radius for containers
  l: 24,    // Large radius for floating elements
  round: 999, // For completely round elements
};

// Shadows
export const SHADOWS = {
  // For iOS
  ios: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
    },
  },
  // For Android (using elevation)
  android: {
    small: { elevation: 3 },
    medium: { elevation: 5 },
  }
};

// Layout
export const LAYOUT = {
  // Common screen padding
  screenPadding: SPACING.xl,
  // Header height
  headerHeight: 60,
  // Content width percentages
  contentWidth: '100%',
  // Sidebar width (for tablet/larger screens)
  sidebarWidth: '25%',
};

// Function to get shadow based on platform
export const getShadow = (size = 'small') => {
  return Platform.OS === 'ios' ? SHADOWS.ios[size] : SHADOWS.android[size];
};

// Combined theme object
export const theme = {
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  layout: LAYOUT,
};

export default theme; 