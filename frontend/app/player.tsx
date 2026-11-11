import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const title = (params.title as string) || 'Café da manhã na varanda';
  const scriptText =
    (params.scriptText as string) ||
    'Eu acordo sentindo o calor suave da manhã entrando pela janela do nosso quarto na fazenda. O cheiro de café fresco já perfuma o ar. Ao caminhar descalço até a varanda, encontro Simone com duas xícaras nas mãos e um sorriso calmo no rosto...';
  const userName = (params.userName as string) || 'Jorge';
  const partnerName = (params.partnerName as string) || 'Simone';

  const [isPlaying, setIsPlaying] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [ambientVolume, setAmbientVolume] = useState(0.6);
  const [manifested, setManifested] = useState(false);

  // Divide o texto do roteiro em parágrafos de narrativa
  const paragraphs = scriptText.split(/(?<=[.?!])\s+/);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabeçalho do Player */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="chevron-down" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.headerCategory}>MANIFESTAÇÃO DIÁRIA</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setManifested(!manifested)}
          >
            <Ionicons
              name={manifested ? 'sparkles' : 'sparkles-outline'}
              size={22}
              color={manifested ? '#D4AF37' : Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* Área Visual / Legendas Sincronizadas Estilo Karaokê */}
        <ScrollView
          style={styles.lyricsScroll}
          contentContainerStyle={styles.lyricsContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.auraCard}>
            <View style={styles.auraGlow} />
            <Ionicons name="headset" size={32} color={Colors.primaryButton} />
            <Text style={styles.auraSub}>Frequência Harmônica 432Hz Ativa</Text>
          </View>

          {paragraphs.map((p, idx) => (
            <Text
              key={idx}
              style={[
                styles.scriptParagraph,
                idx === 0 && styles.scriptParagraphActive,
              ]}
            >
              {p}
            </Text>
          ))}

          {manifested && (
            <View style={styles.manifestedBadge}>
              <Ionicons name="checkmark-circle" size={18} color="#2E7D32" style={{ marginRight: 6 }} />
              <Text style={styles.manifestedBadgeText}>Registrado no seu Diário de Sincronicidades ✨</Text>
            </View>
          )}
        </ScrollView>

        {/* Mixer Sonoro de Duas Camadas: Voz vs Ambiente 432Hz */}
        <View style={styles.mixerCard}>
          <View style={styles.mixerRow}>
            <View style={styles.mixerLabelCol}>
              <Ionicons name="mic" size={16} color={Colors.textPrimary} />
              <Text style={styles.mixerLabel}>Voz Narrador</Text>
            </View>
            <View style={styles.volumePillRow}>
              {[0.4, 0.7, 1.0].map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setVoiceVolume(v)}
                  style={[
                    styles.volumePill,
                    voiceVolume === v && styles.volumePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.volumePillText,
                      voiceVolume === v && styles.volumePillTextActive,
                    ]}
                  >
                    {Math.round(v * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.mixerRow}>
            <View style={styles.mixerLabelCol}>
              <Ionicons name="water" size={16} color={Colors.accentPink} />
              <Text style={styles.mixerLabel}>432Hz & Chuva</Text>
            </View>
            <View style={styles.volumePillRow}>
              {[0.2, 0.5, 0.8].map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => setAmbientVolume(v)}
                  style={[
                    styles.volumePill,
                    ambientVolume === v && styles.volumePillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.volumePillText,
                      ambientVolume === v && styles.volumePillTextActive,
                    ]}
                  >
                    {Math.round(v * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Controles Principais de Reprodução */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={styles.manifestButton}
            onPress={() => setManifested(true)}
          >
            <Ionicons name="heart" size={18} color="#D45079" style={{ marginRight: 6 }} />
            <Text style={styles.manifestButtonText}>Manifestou!</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.playPauseButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRoundButton}
            onPress={() => router.push({ pathname: '/home', params: { userName, partnerName } })}
          >
            <Ionicons name="home-outline" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  headerTitles: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 12,
  },
  headerCategory: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.accentPink,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  lyricsScroll: {
    flex: 1,
    marginVertical: 14,
  },
  lyricsContent: {
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  auraCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  auraGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(212, 80, 121, 0.12)',
  },
  auraSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  scriptParagraph: {
    fontSize: 18,
    lineHeight: 30,
    fontFamily: 'serif',
    color: 'rgba(56, 18, 31, 0.45)',
    marginBottom: 16,
  },
  scriptParagraphActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  manifestedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 10,
    alignSelf: 'center',
  },
  manifestedBadgeText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  mixerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EED6DC',
    marginBottom: 12,
  },
  mixerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  mixerLabelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mixerLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  volumePillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  volumePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F5EBEE',
  },
  volumePillActive: {
    backgroundColor: Colors.primaryButton,
  },
  volumePillText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  volumePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  manifestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  manifestButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  playPauseButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#38121F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  actionRoundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
});

