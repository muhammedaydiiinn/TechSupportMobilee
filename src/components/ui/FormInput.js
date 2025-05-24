import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { FONTS, SPACING, RADIUS, getShadow } from '../../constants/theme';

/**
 * Reusable form input component with icon
 * 
 * @param {Object} props Component props
 * @param {string} props.iconName - Name of the Ionicons icon
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.value - Current value of the input
 * @param {Function} props.onChangeText - Function to call when text changes
 * @param {string} [props.keyboardType] - Keyboard type (default: 'default')
 * @param {boolean} [props.secureTextEntry] - Whether this is a secure text entry (password)
 * @param {string} [props.autoCapitalize] - Auto capitalize behavior ('none', 'sentences', 'words', 'characters')
 * @param {Object} [props.style] - Additional style for the container
 * @param {Object} [props.inputStyle] - Additional style for the text input
 */
const FormInput = ({ 
  iconName, 
  placeholder, 
  value, 
  onChangeText, 
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'none',
  style,
  inputStyle,
  ...restProps
}) => {
  return (
    <View style={[styles.inputContainer, style]}>
      <Ionicons name={iconName} size={20} color={COLORS.inputText} style={styles.icon} />
      <TextInput
        style={[styles.input, inputStyle]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        placeholderTextColor={COLORS.inputText}
        {...restProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.s,
    marginBottom: SPACING.m,
    paddingHorizontal: SPACING.s,
    backgroundColor: COLORS.inputBackground,
    ...getShadow('small'),
  },
  icon: {
    marginRight: SPACING.s,
    width: 24,
  },
  input: {
    flex: 1,
    padding: SPACING.m,
    color: COLORS.text,
    fontSize: FONTS.size.normal,
  },
});

export default FormInput; 