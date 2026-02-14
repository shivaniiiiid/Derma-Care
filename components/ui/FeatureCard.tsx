import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  onPress: () => void;
}

export default function FeatureCard({ title, description, icon, color, onPress }: FeatureCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon} size={32} color={color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});