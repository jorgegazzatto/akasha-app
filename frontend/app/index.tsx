import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Espaço central de boas-vindas */}
        <View style={styles.centerContent}>
          <Text style={styles.brandTitle}>Akasha</Text>
          <Text style={styles.brandSubtitle}>Crie a vida que você deseja</Text>
          <Text style={styles.brandTagline}>
            Manifestações e visualizações sonoras guiadas por Inteligência Artificial
          </Text>
        </View>

        {/* Rodapé com Botão de Início e Termos */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.continueButton} 
            activeOpacity={0.85}
            onPress={handleStart}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            Ao clicar em "Continuar", você concorda com os nossos{' '}
            <Text style={styles.linkText}>Termos de Uso</Text> e{' '}
            <Text style={styles.linkText}>Política de Privacidade</Text>.
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 52,
    fontFamily: 'serif',
    color: Colors.textPrimary,
    letterSpacing: -1,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '400',
    marginBottom: 16,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 14,
  },
  continueButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimerText: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 12,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: Colors.textSecondary,
  },
});
