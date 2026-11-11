import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface InspirationPillsProps {
  title?: string;
  items: string[];
  onSelect: (item: string) => void;
  selectedItems?: string[];
}

export const InspirationPills: React.FC<InspirationPillsProps> = ({
  title = '✨ Inspirações para quebrar o bloqueio:',
  items,
  onSelect,
  selectedItems = [],
}) => {
  return (
    <View style={styles.container}>
      {title ? (
        <View style={styles.headerRow}>
          <Text style={styles.titleText}>{title}</Text>
        </View>
      ) : null}
      <View style={styles.pillsWrap}>
        {items.map((item, idx) => {
          const isSelected = selectedItems.includes(item);
          return (
            <TouchableOpacity
              key={`${item}-${idx}`}
              activeOpacity={0.7}
              onPress={() => onSelect(item)}
              style={[
                styles.pill,
                isSelected && styles.pillActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  isSelected && styles.pillTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleText: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EED6DC',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  pillActive: {
    backgroundColor: '#F7E7EC',
    borderColor: Colors.primaryButton,
  },
  pillText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.primaryButton,
    fontWeight: '600',
  },
});

