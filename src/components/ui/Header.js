import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import theme, { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * A reusable header component with gradient background
 * 
 * @param {Object} props Component props
 * @param {string} props.title - The title text
 * @param {Function} [props.onBack] - Function to call on back button press
 * @param {Function} [props.onRightAction] - Function to call on right action button press
 * @param {string} [props.rightIcon] - Ionicons name for right action button
 * @param {React.ReactNode} [props.rightComponent] - Component to render on the right side
 * @param {Object} [props.style] - Additional style for the header container
 */
const Header = ({ 
  title, 
  onBack, 
  onRightAction, 
  rightIcon,
  rightComponent,
  style 
}) => {
  const insets = useSafeAreaInsets();
  
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={[
        styles.container, 
        { paddingTop: Math.max(SPACING.m, insets.top) },
        style
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.contentContainer}>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
        
        <Text 
          style={[
            styles.title, 
            { marginLeft: onBack ? 0 : SPACING.m }
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
        
        {rightComponent ? (
          <View style={styles.rightComponentContainer}>
            {rightComponent}
          </View>
        ) : rightIcon && onRightAction ? (
          <TouchableOpacity style={styles.rightButton} onPress={onRightAction}>
            <Ionicons name={rightIcon} size={24} color={COLORS.white} />
          </TouchableOpacity>
        ) : <View style={styles.rightPlaceholder} />}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: SPACING.m,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.m,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.s,
  },
  title: {
    flex: 1,
    fontSize: FONTS.size.h3,
    fontWeight: FONTS.weight.bold,
    color: COLORS.white,
  },
  rightButton: {
    padding: SPACING.xs,
  },
  rightComponentContainer: {
    marginLeft: SPACING.s,
  },
  rightPlaceholder: {
    width: 32, // Approximately the width of the back button for visual balance
  },
});

export default Header; 