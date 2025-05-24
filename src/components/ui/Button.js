import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SPACING, RADIUS, getShadow } from '../../constants/theme';
import LinearGradient from 'react-native-linear-gradient';
import theme from '../../constants/theme';

/**
 * Reusable button component with loading state
 * 
 * @param {Object} props Component props
 * @param {string} props.title - Button text
 * @param {Function} props.onPress - Function to call when button is pressed
 * @param {boolean} [props.loading] - Whether to show loading indicator
 * @param {boolean} [props.disabled] - Whether button is disabled
 * @param {Object} [props.style] - Additional style for the button
 * @param {Object} [props.textStyle] - Additional style for the button text
 * @param {string} [props.variant] - Button variant ('primary', 'secondary', 'outline')
 */
const Button = ({ 
  title, 
  onPress, 
  loading = false, 
  disabled = false,
  style,
  textStyle,
  variant = 'primary',
  ...restProps
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'primary':
      default:
        return null; // For primary we use gradient now
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryButtonText;
      case 'outline':
        return styles.outlineButtonText;
      case 'primary':
      default:
        return styles.primaryButtonText;
    }
  };

  // For primary buttons, use a gradient background
  if (variant === 'primary') {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          (loading || disabled) && styles.buttonDisabled,
          style
        ]}
        onPress={onPress}
        disabled={loading || disabled}
        {...restProps}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loading ? (
            <ActivityIndicator 
              color={COLORS.white} 
              size="small"
            />
          ) : (
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  // For other button types
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        (loading || disabled) && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={loading || disabled}
      {...restProps}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' ? COLORS.primary : COLORS.white} 
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: RADIUS.s,
    ...getShadow('small'),
  },
  gradient: {
    paddingVertical: SPACING.m,
    borderRadius: RADIUS.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: FONTS.weight.semiBold,
    fontSize: FONTS.size.normal,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    padding: SPACING.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: COLORS.white,
    fontWeight: FONTS.weight.semiBold,
    fontSize: FONTS.size.normal,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: SPACING.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontWeight: FONTS.weight.semiBold,
    fontSize: FONTS.size.normal,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});

export default Button; 