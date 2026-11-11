import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { api, StoryResponse } from '../services/api';

export default function TransitionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = (params.userId as string) || '5d53a8e9-6ca9-4952-82fa-c9f3bd8b3c88';
  const userName = (params.name as string) || 'Jorge';
  const partnerName = (params.partnerName as string) || 'Simone';
  const dreamHome = (params.dreamHome as string) || 'Fazenda';

  const [story, setStory] = useState<StoryResponse | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [breathText, setBreathText] = useState('Inspire profundamente...');
  const [isReady, setIsReady] = useState(false);

  // Animação da Esfera de Respiração
  const breathAnim = useRef(new Animated.Value(1)).current;

  // Fases de Feedback Narrativo Progressivo
  const narrativePhases = [
    `✨ Sintonizando as intenções de ${userName}...`,
    `🏡 Desenhando o refúgio com ${partnerName}...`,
    `🎧 Harmonizando tons acústicos e frequência 432Hz...`,
    `🌟 Sua manifestação viva está pronta.`,
  ];

  // Ciclo de respiração 4-7-8
  useEffect(() => {
    let active = true;

    const runBreathingCycle = () => {
      if (!active) return;
      setBreathText('Inspire suavemente...');
      Animated.timing(breathAnim, {
        toValue: 1.45,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        if (!active) return;
        setBreathText('Segure o ar...');
        setTimeout(() => {
          if (!active) return;
          setBreathText('Expire e relaxe...');
          Animated.timing(breathAnim, {
            toValue: 1.0,
            duration: 6000,
            useNativeDriver: true,
          }).start(() => {
            if (active) runBreathingCycle();
          });
        }, 5000);
      });
    };

    runBreathingCycle();

    return () => {
      active = false;
    };
  }, []);

  // Progresso das frases narrativas e chamada do backend
  useEffect(() => {
    const phaseInterval = setInterval(() => {
      setPhaseIndex((prev) => {
        if (prev < narrativePhases.length - 2) {
          return prev + 1;
        }
        return prev;
      });
    }, 4500);

    // Chama o backend para gerar a história sensorial em 1ª pessoa
    api
      .generateStory(userId, 'Amor & Abundância')
      .then((generatedStory) => {
        setStory(generatedStory);
        setPhaseIndex(narrativePhases.length - 1);
        setIsReady(true);
      })
      .catch((err) => {
        console.warn('Fallback de história local:', err);
        // Criação simulada de alta qualidade para preview
        setStory({
          id: 'preview-story-1',
          user_id: userId,
          title: `Café da manhã na varanda com ${partnerName}`,
          category: 'Amor & Presença',
          script_text: `Eu acordo sentindo o calor suave da manhã entrando pela janela do nosso quarto na fazenda. O cheiro de café fresco já perfuma o ar. Ao caminhar descalço até a varanda, encontro ${partnerName} com duas xícaras nas mãos e um sorriso calmo no rosto. Olhamos juntos para a imensidão verde da serra, sentindo uma paz indescritível e a certeza de que todo o esforço valeu a pena. Eu sinto profunda gratidão por esta vida abundante.`,
          duration_seconds: 180,
          is_favorite: false,
          created_at: new Date().toISOString(),
        });
        setPhaseIndex(narrativePhases.length - 1);
        setIsReady(true);
      });

    return () => clearInterval(phaseInterval);
  }, []);

  const handleStartListening = () => {
    router.push({
      pathname: '/player',
      params: {
        storyId: story?.id || '',
        title: story?.title || `Manhã com ${partnerName}`,
        scriptText: story?.script_text || '',
        userName,
        partnerName,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Esfera de Respiração Consciente */}
        <View style={styles.sphereContainer}>
          <Animated.View
            style={[
              styles.breathingSphereGlow,
              { transform: [{ scale: breathAnim }] },
            ]}
          />
          <Animated.View
            style={[
              styles.breathingSphere,
              { transform: [{ scale: breathAnim }] },
            ]}
          >
            <Ionicons name="sparkles-outline" size={32} color="#FFFFFF" />
          </Animated.View>

          <Text style={styles.breathInstructionText}>{breathText}</Text>
        </View>

        {/* Feedback Narrativo Progressivo */}
        <View style={styles.feedbackCard}>
          <Text style={styles.narrativePhaseText}>
            {narrativePhases[phaseIndex]}
          </Text>

          {!isReady ? (
            <View style={styles.loadingIndicatorRow}>
              <ActivityIndicator size="small" color={Colors.primaryButton} />
              <Text style={styles.subtleText}>Orquestrando seu refúgio...</Text>
            </View>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.listenButton}
              onPress={handleStartListening}
            >
              <Ionicons name="headset-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.listenButtonText}>Ouvir Minha Manifestação</Text>
            </TouchableOpacity>
          )}
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
    paddingHorizontal: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 32,
  },
  sphereContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    position: 'relative',
  },
  breathingSphereGlow: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(212, 80, 121, 0.15)',
  },
  breathingSphere: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: Colors.primaryButton,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primaryButton,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  breathInstructionText: {
    marginTop: 36,
    fontSize: 17,
    fontFamily: 'serif',
    color: Colors.textPrimary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  feedbackCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EED6DC',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  narrativePhaseText: {
    fontSize: 16.5,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  loadingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subtleText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  listenButton: {
    backgroundColor: '#38121F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 999,
    width: '100%',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  listenButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
