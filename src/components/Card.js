import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import theme from '../constants/theme';
import LinearGradient from 'react-native-linear-gradient';

/**
 * Card component with optional gradient header
 * 
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {Object} [props.style] - Additional style for the card
 * @param {boolean} [props.withGradientHeader] - Whether to include a gradient header
 * @param {number} [props.headerHeight] - Height of the gradient header (if included)
 * @param {boolean} [props.withTopBorder] - Whether to include a blue top border instead of header
 */
export const Card = ({ 
  children, 
  style, 
  withGradientHeader = false, 
  headerHeight = 5, 
  withTopBorder = false 
}) => {
  if (withGradientHeader) {
    return (
      <View style={[styles.card, style]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={[styles.gradientHeader, { height: headerHeight }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <View style={styles.cardContent}>
          {children}
        </View>
      </View>
    );
  }

  if (withTopBorder) {
    return (
      <View style={[styles.card, styles.cardWithBorder, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  cardWithBorder: {
    borderTopWidth: 3,
    borderTopColor: theme.colors.primary,
  },
  gradientHeader: {
    width: '100%',
  },
  cardContent: {
    padding: 15,
  },
}); 