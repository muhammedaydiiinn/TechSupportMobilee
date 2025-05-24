import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import theme, { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Custom TabBar component with blue gradient background
 * 
 * @param {Object} props Component props
 * @param {Array} props.tabs - Array of tab objects with {key, label, icon}
 * @param {string} props.activeTab - Key of the currently active tab
 * @param {Function} props.onTabPress - Function to call when a tab is pressed
 * @param {Object} [props.style] - Additional style for the tab bar
 */
const TabBar = ({ tabs, activeTab, onTabPress, style }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark]}
      style={[
        styles.container, 
        { paddingBottom: Math.max(SPACING.s, insets.bottom) },
        style
      ]}
    >
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={styles.tab}
          onPress={() => onTabPress(tab.key)}
        >
          <View style={styles.tabContent}>
            <Ionicons
              name={tab.icon}
              size={24}
              color={activeTab === tab.key ? COLORS.white : 'rgba(255, 255, 255, 0.7)'}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: activeTab === tab.key ? COLORS.white : 'rgba(255, 255, 255, 0.7)' }
              ]}
            >
              {tab.label}
            </Text>
            
            {activeTab === tab.key && (
              <View style={styles.activeIndicator} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: SPACING.s,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.s,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabLabel: {
    fontSize: FONTS.size.small,
    marginTop: SPACING.xs,
    fontWeight: FONTS.weight.medium,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -SPACING.s - 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.white,
  },
});

export default TabBar; 