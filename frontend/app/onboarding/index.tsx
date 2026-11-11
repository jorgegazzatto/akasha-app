import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');

  const totalSteps = 15;
  const progressPercent = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step === 1 && !name.trim()) return;
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Barra Superior com Progresso e Voltar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* Conteúdo Dinâmico do Onboarding */}
        <View style={styles.content}>
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.titleSerif}>Primeiro, como devemos te chamar?</Text>
              
              <View style={styles.inputPillContainer}>
                <TextInput
                  style={styles.inputField}
                  placeholder="Seu nome"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoFocus
                  onSubmitEditing={handleNext}
                />
                <TouchableOpacity 
                  style={[styles.sendButton, !name.trim() && styles.sendButtonDisabled]}
                  onPress={handleNext}
                  disabled={!name.trim()}
                >
                  <Ionicons name="arrow-forward" size={18} color={name.trim() ? '#FFFFFF' : Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.titleSerif}>Que alegria ter você aqui, {name}.</Text>
              <Text style={styles.bodyText}>
                Este é o seu refúgio pessoal para ancorar e manifestar a vida dos seus sonhos através do som.
              </Text>
              
              <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
                <Text style={styles.continueButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          )}

          {step > 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.titleSerif}>Etapa {step} de {totalSteps}</Text>
              <Text style={styles.bodyText}>
                Próximas perguntas do perfil em implementação na Sprint 1.
              </Text>
              <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
                <Text style={styles.continueButtonText}>Avançar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  backButton: {
    padding: 6,
  },
  progressBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#EBD3DA',
    borderRadius: 2,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryButton,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  stepContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  titleSerif: {
    fontFamily: 'serif',
    fontSize: 26,
    lineHeight: 34,
    color: Colors.textPrimary,
    marginBottom: 28,
  },
  bodyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 32,
  },
  inputPillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    width: '100%',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  sendButton: {
    backgroundColor: Colors.primaryButton,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#F0E2E6',
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  continueButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
