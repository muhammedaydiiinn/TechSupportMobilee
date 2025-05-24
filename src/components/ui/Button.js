import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { FONTS, SPACING, RADIUS, getShadow } from '../../constants/theme';

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
        return styles.primaryButton;
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
    padding: SPACING.m,
    borderRadius: RADIUS.s,
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadow('small'),
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.white,
    fontWeight: FONTS.weight.semiBold,
    fontSize: FONTS.size.normal,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
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