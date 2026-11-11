import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/theme';

interface PillButtonProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({
  label,
  selected = false,
  onPress,
  style,
  textStyle,
  icon,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.pill,
        selected ? styles.pillSelected : styles.pillDefault,
        style,
      ]}
    >
      {icon && <span style={{ marginRight: 6 }}>{icon}</span>}
      <Text
        style={[
          styles.pillText,
          selected ? styles.pillTextSelected : styles.pillTextDefault,
          textStyle,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    borderWidth: 1.2,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  pillDefault: {
    backgroundColor: '#FFFFFF',
    borderColor: '#EED6DC',
  },
  pillSelected: {
    backgroundColor: Colors.primaryButton,
    borderColor: Colors.primaryButton,
  },
  pillText: {
    fontSize: 14.5,
    fontWeight: '500',
    textAlign: 'center',
  },
  pillTextDefault: {
    color: Colors.textPrimary,
  },
  pillTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
