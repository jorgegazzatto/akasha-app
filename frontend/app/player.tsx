import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Platform,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Colors } from '../constants/theme';
import { api } from '../services/api';
import { akashaStorage } from '../services/storage';
import { audioEngine } from '../services/audioEngine';

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const title = (params.title as string) || 'Café da manhã na varanda com Simone';
  const scriptText =
    (params.scriptText as string) ||
    'Eu acordo sentindo o calor suave da manhã entrando pela janela do nosso quarto na fazenda. O cheiro de café fresco já perfuma o ar. Ao caminhar descalço até a varanda, encontro Simone com duas xícaras nas mãos e um sorriso calmo no rosto. Olhamos juntos para a imensidão verde da serra, sentindo uma paz indescritível e a certeza de que todo o esforço valeu a pena. Eu sinto profunda gratidão por esta vida abundante.';
  const userName = (params.userName as string) || 'Jorge';
  const partnerName = (params.partnerName as string) || 'Simone';
  const storyId = (params.storyId as string) || 'story-active';

  // Divide o texto do roteiro em frases para o efeito Karaokê
  const sentences = scriptText
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Estados de Reprodução & Tempo
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [positionSeconds, setPositionSeconds] = useState(0);
  const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
  const durationSeconds = 180; // 3 minutos padrão

  // Mixer Sonoro de 2 Camadas
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [ambientVolume, setAmbientVolume] = useState(0.6);
  const [ambientTrack, setAmbientTrack] = useState<'432hz' | '528hz' | 'rain' | 'fire' | 'waves'>('432hz');

  // Diário de Sincronicidades ("Manifestou!")
  const [isFavorite, setIsFavorite] = useState(false);
  const [showManifestedModal, setShowManifestedModal] = useState(false);
  const [manifestedNote, setManifestedNote] = useState('');
  const [manifestedSuccess, setManifestedSuccess] = useState(false);

  // Animação da Aura Pulsante
  const auraScaleAnim = useRef(new Animated.Value(1)).current;
  const auraOpacityAnim = useRef(new Animated.Value(0.4)).current;
  const scrollRef = useRef<ScrollView>(null);

  // Cálculo de progresso
  const progressRatio = Math.min(1, (activeSentenceIndex + 1) / Math.max(1, sentences.length));

  // Inicia ou retoma a reprodução acústica com ambas as camadas
  const startPlayback = (startIndex: number = activeSentenceIndex) => {
    setAudioStarted(true);
    setIsPlaying(true);
    audioEngine.startAmbient(ambientTrack, ambientVolume);
    audioEngine.startVoice(
      sentences,
      startIndex,
      voiceVolume,
      (idx) => {
        setActiveSentenceIndex(idx);
        setPositionSeconds(Math.round((idx / Math.max(1, sentences.length)) * durationSeconds));
      },
      () => {
        setIsPlaying(false);
        setPositionSeconds(durationSeconds);
      }
    );
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioEngine.pause();
    } else {
      setIsPlaying(true);
      if (!audioStarted) {
        startPlayback(activeSentenceIndex);
      } else {
        audioEngine.resume();
      }
    }
  };

  const handleChangeVoiceVolume = (v: number) => {
    setVoiceVolume(v);
    audioEngine.setVoiceVolume(v);
  };

  const handleChangeAmbientVolume = (v: number) => {
    setAmbientVolume(v);
    audioEngine.setAmbientVolume(v);
  };

  const handleChangeAmbientTrack = (track: '432hz' | '528hz' | 'rain' | 'fire' | 'waves') => {
    setAmbientTrack(track);
    if (isPlaying) {
      audioEngine.startAmbient(track, ambientVolume);
    }
  };

  // Setup de Áudio em Segundo Plano com expo-av e limpeza ao desmontar
  useEffect(() => {
    async function configureAudio() {
      try {
        await Audio.setAudioModeAsync({
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (err) {
        console.warn('Erro ao configurar áudio background:', err);
      }
    }
    configureAudio();

    return () => {
      audioEngine.stopAll();
    };
  }, []);

  // Timer de incremento de posição em segundos
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPositionSeconds((prev) => {
          if (prev >= durationSeconds) {
            return durationSeconds;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Animação orgânica de pulso da aura de frequências
  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    if (isPlaying) {
      loop = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(auraScaleAnim, {
              toValue: 1.35,
              duration: 2400,
              useNativeDriver: true,
            }),
            Animated.timing(auraScaleAnim, {
              toValue: 1.0,
              duration: 2400,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(auraOpacityAnim, {
              toValue: 0.8,
              duration: 2400,
              useNativeDriver: true,
            }),
            Animated.timing(auraOpacityAnim, {
              toValue: 0.35,
              duration: 2400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      loop.start();
    } else {
      auraScaleAnim.setValue(1);
      auraOpacityAnim.setValue(0.35);
    }

    return () => {
      if (loop) loop.stop();
    };
  }, [isPlaying]);

  // Controles de Navegação de Tempo
  const handleSeekRelative = (seconds: number) => {
    const delta = seconds > 0 ? 1 : -1;
    const newIdx = Math.max(0, Math.min(sentences.length - 1, activeSentenceIndex + delta));
    setActiveSentenceIndex(newIdx);
    setPositionSeconds(Math.round((newIdx / Math.max(1, sentences.length)) * durationSeconds));
    audioEngine.seekSentence(newIdx);
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (storyId) {
      api.toggleFavorite(storyId).catch(() => {});
    }
  };

  const handleSaveManifested = () => {
    if (manifestedNote.trim()) {
      akashaStorage.addSynchronicity({
        storyId,
        storyTitle: title,
        text: manifestedNote.trim(),
      });
    }
    setShowManifestedModal(false);
    setManifestedSuccess(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
  };

  const ambientTrackLabels: Record<string, string> = {
    '432hz': '432Hz Harmônico',
    '528hz': '528Hz Transformação',
    rain: 'Chuva na Janela',
    fire: 'Lareira Aconchegante',
    waves: 'Ondas do Mar',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* ================= CABEÇALHO ================= */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerTitles}>
            <Text style={styles.headerCategory}>MANIFESTAÇÃO DIÁRIA • 432HZ</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={handleToggleFavorite}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#D45079' : Colors.textPrimary}
            />
          </TouchableOpacity>
        </View>

        {/* ================= VISUALIZADOR DE AURA E LEGENDAS KARAOKÊ ================= */}
        <ScrollView
          ref={scrollRef}
          style={styles.lyricsScroll}
          contentContainerStyle={styles.lyricsContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Card Central com Aura Pulsante Interativa */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={togglePlayPause}
            style={styles.auraCard}
          >
            <Animated.View
              style={[
                styles.auraOuterRing,
                {
                  transform: [{ scale: auraScaleAnim }],
                  opacity: auraOpacityAnim,
                },
              ]}
            />
            <View style={styles.auraCore}>
              <Image
                source={require('../assets/logo.jpg')}
                style={styles.auraLogoImage}
                resizeMode="cover"
              />
              <View style={styles.auraPlayOverlay}>
                <Ionicons
                  name={isPlaying ? 'headset' : 'play'}
                  size={18}
                  color="#FFFFFF"
                />
              </View>
            </View>
            <Text style={styles.auraLabel}>
              {isPlaying ? `${ambientTrackLabels[ambientTrack]} • Tocando` : 'Toque para Iniciar o Áudio 432Hz'}
            </Text>
            {!audioStarted && (
              <View style={styles.audioHintPill}>
                <Ionicons name="volume-high" size={13} color="#FFFFFF" />
                <Text style={styles.audioHintText}>Ativar Som Acústico</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Legendas Sincronizadas Estilo Karaokê */}
          <View style={styles.sentencesContainer}>
            {sentences.map((sentence, idx) => {
              const isActive = idx === activeSentenceIndex;
              const isPast = idx < activeSentenceIndex;
              return (
                <View
                  key={idx}
                  style={[
                    styles.sentenceWrapper,
                    isActive && styles.sentenceWrapperActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.sentenceText,
                      isActive && styles.sentenceTextActive,
                      isPast && styles.sentenceTextPast,
                    ]}
                  >
                    {sentence}
                  </Text>
                </View>
              );
            })}
          </View>

          {manifestedSuccess && (
            <View style={styles.manifestedSuccessBadge}>
              <Ionicons name="sparkles" size={18} color="#D4AF37" style={{ marginRight: 6 }} />
              <Text style={styles.manifestedSuccessText}>
                Registrado com sucesso no seu Diário de Sincronicidades ✨
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ================= MIXER SONORO DE DUAS CAMADAS ================= */}
        <View style={styles.mixerBox}>
          {/* Camada 1: Voz */}
          <View style={styles.mixerRow}>
            <View style={styles.mixerLabelCol}>
              <Ionicons name="mic-outline" size={16} color={Colors.textPrimary} />
              <Text style={styles.mixerLabel}>Voz ({Math.round(voiceVolume * 100)}%)</Text>
            </View>
            <View style={styles.pillsRow}>
              {[0.0, 0.5, 0.8, 1.0].map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => handleChangeVoiceVolume(v)}
                  style={[
                    styles.mixerPill,
                    voiceVolume === v && styles.mixerPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.mixerPillText,
                      voiceVolume === v && styles.mixerPillTextActive,
                    ]}
                  >
                    {v === 0 ? 'Mudo' : `${Math.round(v * 100)}%`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Camada 2: Ambiente & Frequência 432Hz */}
          <View style={styles.mixerRow}>
            <View style={styles.mixerLabelCol}>
              <Ionicons name="water-outline" size={16} color={Colors.accentPink} />
              <Text style={styles.mixerLabel}>Ambiente ({Math.round(ambientVolume * 100)}%)</Text>
            </View>
            <View style={styles.pillsRow}>
              {[0.2, 0.5, 0.8, 1.0].map((v) => (
                <TouchableOpacity
                  key={v}
                  onPress={() => handleChangeAmbientVolume(v)}
                  style={[
                    styles.mixerPill,
                    ambientVolume === v && styles.mixerPillActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.mixerPillText,
                      ambientVolume === v && styles.mixerPillTextActive,
                    ]}
                  >
                    {Math.round(v * 100)}%
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Seletor de Trilha de Fundo */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ambientTrackRow}
          >
            {[
              { id: '432hz', label: '✨ 432Hz' },
              { id: '528hz', label: '🌀 528Hz' },
              { id: 'rain', label: '🌧️ Chuva' },
              { id: 'fire', label: '🔥 Lareira' },
              { id: 'waves', label: '🌊 Ondas' },
            ].map((track) => (
              <TouchableOpacity
                key={track.id}
                onPress={() => handleChangeAmbientTrack(track.id as any)}
                style={[
                  styles.trackPill,
                  ambientTrack === track.id && styles.trackPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.trackPillText,
                    ambientTrack === track.id && styles.trackPillTextActive,
                  ]}
                >
                  {track.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ================= BARRA DE PROGRESSO & CONTROLES ================= */}
        <View style={styles.footerControls}>
          {/* Barra de Progresso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressRatio * 100}%` },
                ]}
              />
            </View>
            <View style={styles.timeLabelsRow}>
              <Text style={styles.timeLabel}>{formatTime(positionSeconds)}</Text>
              <Text style={styles.timeLabel}>{formatTime(durationSeconds)}</Text>
            </View>
          </View>

          {/* Botões de Ação */}
          <View style={styles.buttonsRow}>
            {/* Botão de Registro "Manifestou!" */}
            <TouchableOpacity
              style={styles.manifestButton}
              activeOpacity={0.8}
              onPress={() => setShowManifestedModal(true)}
            >
              <Ionicons name="sparkles" size={16} color="#D4AF37" style={{ marginRight: 6 }} />
              <Text style={styles.manifestButtonText}>Manifestou!</Text>
            </TouchableOpacity>

            {/* Retroceder 15s */}
            <TouchableOpacity
              onPress={() => handleSeekRelative(-15)}
              style={styles.seekButton}
            >
              <Ionicons name="play-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Play / Pause Principal */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.mainPlayButton}
              onPress={togglePlayPause}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={30}
                color="#FFFFFF"
                style={{ marginLeft: isPlaying ? 0 : 3 }}
              />
            </TouchableOpacity>

            {/* Avançar 15s */}
            <TouchableOpacity
              onPress={() => handleSeekRelative(15)}
              style={styles.seekButton}
            >
              <Ionicons name="play-forward" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            {/* Atalho para Home */}
            <TouchableOpacity
              style={styles.homeRoundButton}
              onPress={() =>
                router.push({
                  pathname: '/home',
                  params: { userName, partnerName },
                })
              }
            >
              <Ionicons name="home-outline" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= MODAL DO DIÁRIO DE SINCRONICIDADES ================= */}
        <Modal
          visible={showManifestedModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowManifestedModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>✨ Manifestou!</Text>
              <Text style={styles.modalSubtitle}>
                O que desta história aconteceu na vida real? Anote o momento para ancorar sua vibração de gratidão.
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Ex.: Simone preparou o café exatamente como na história e conversamos sobre o nosso refúgio..."
                placeholderTextColor={Colors.textMuted}
                value={manifestedNote}
                onChangeText={setManifestedNote}
                multiline
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowManifestedModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={handleSaveManifested}
                >
                  <Text style={styles.modalSaveText}>Salvar no Diário</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
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
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.accentPink,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: 'serif',
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  lyricsScroll: {
    flex: 1,
    marginVertical: 10,
  },
  lyricsContent: {
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  auraCard: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    position: 'relative',
  },
  auraOuterRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(212, 80, 121, 0.25)',
  },
  auraCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EED6DC',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  auraLogoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  auraPlayOverlay: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 18, 31, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  auraLabel: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  audioHintPill: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryButton,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  audioHintText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sentencesContainer: {
    gap: 14,
  },
  sentenceWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  sentenceWrapperActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.primaryButton,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  sentenceText: {
    fontSize: 17,
    fontFamily: 'serif',
    lineHeight: 28,
    color: Colors.textSecondary,
  },
  sentenceTextActive: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  sentenceTextPast: {
    color: 'rgba(56, 18, 31, 0.4)',
  },
  manifestedSuccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFE082',
    alignSelf: 'center',
  },
  manifestedSuccessText: {
    fontSize: 12.5,
    color: '#8D6E63',
    fontWeight: '600',
  },
  mixerBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EED6DC',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
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
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 5,
  },
  mixerPill: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F5EBEE',
  },
  mixerPillActive: {
    backgroundColor: Colors.primaryButton,
  },
  mixerPillText: {
    fontSize: 10.5,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  mixerPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  ambientTrackRow: {
    gap: 8,
    paddingTop: 8,
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5EBEE',
  },
  trackPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  trackPillActive: {
    backgroundColor: '#F7E7EC',
    borderColor: Colors.primaryButton,
  },
  trackPillText: {
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  trackPillTextActive: {
    color: Colors.primaryButton,
    fontWeight: '600',
  },
  footerControls: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(238, 214, 220, 0.7)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryButton,
    borderRadius: 3,
  },
  timeLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  buttonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manifestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  manifestButtonText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  seekButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  mainPlayButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#38121F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  homeRoundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#EED6DC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#FDF8F9',
    borderRadius: 16,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#EED6DC',
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 18,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  modalCancelText: {
    fontSize: 13.5,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  modalSaveButton: {
    backgroundColor: Colors.primaryButton,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 999,
  },
  modalSaveText: {
    fontSize: 13.5,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
