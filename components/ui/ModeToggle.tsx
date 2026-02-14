import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

export default function ModeToggle() {
  const { isDetailedMode, toggleDetailedMode } = useApp();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggle,
          !isDetailedMode && styles.activeToggle,
        ]}
        onPress={!isDetailedMode ? undefined : toggleDetailedMode}
      >
        <MaterialIcons 
          name="accessibility" 
          size={20} 
          color={!isDetailedMode ? Colors.primary : Colors.textSecondary} 
        />
        <Text style={[
          styles.toggleText,
          !isDetailedMode && styles.activeToggleText,
        ]}>
          Simple
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.toggle,
          isDetailedMode && styles.activeToggle,
        ]}
        onPress={isDetailedMode ? undefined : toggleDetailedMode}
      >
        <MaterialIcons 
          name="science" 
          size={20} 
          color={isDetailedMode ? Colors.primary : Colors.textSecondary} 
        />
        <Text style={[
          styles.toggleText,
          isDetailedMode && styles.activeToggleText,
        ]}>
          Detailed
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 4,
    marginVertical: Spacing.md,
  },
  toggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  activeToggle: {
    backgroundColor: Colors.background,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  activeToggleText: {
    color: Colors.primary,
    fontWeight: '600',
  },
});