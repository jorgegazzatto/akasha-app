import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  showBack?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
}) => {
  const percent = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onBack}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}

      <View style={styles.trackContainer}>
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.stepLabel}>
          {currentStep} / {totalSteps}
        </Text>
      </View>

      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: '100%',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  placeholder: {
    width: 38,
  },
  trackContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(238, 214, 220, 0.6)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryButton,
    borderRadius: 3,
  },
  stepLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
});
