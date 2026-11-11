import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ImageBackground,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { api, StoryResponse } from '../services/api';

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = (params.userId as string) || '5d53a8e9-6ca9-4952-82fa-c9f3bd8b3c88';
  const userName = (params.name as string) || 'Jorge';
  const partnerName = (params.partnerName as string) || 'Simone';

  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'library' | 'favorites' | 'profile'>('home');
  const [stories, setStories] = useState<StoryResponse[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);

  // Temporizador Regressivo de 24 horas
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 24, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Busca histórias diárias da API ou usa presets personalizados ricos
  useEffect(() => {
    setIsLoadingStories(true);
    api
      .getDailyStories(userId)
      .then((data) => {
        if (data && data.length > 0) {
          setStories(data);
        } else {
          setDefaultStories();
        }
      })
      .catch(() => {
        setDefaultStories();
      })
      .finally(() => {
        setIsLoadingStories(false);
      });
  }, [userId]);

  const setDefaultStories = () => {
    setStories([
      {
        id: 'story-1',
        user_id: userId,
        title: `Eu assisto ${partnerName} colocar café na varanda da nossa fazenda`,
        category: 'AMOR & PRESENÇA',
        script_text: `Eu acordo sentindo o calor suave da manhã entrando pela janela do nosso quarto na fazenda. O cheiro de café fresco já perfuma o ar. Ao caminhar descalço até a varanda de madeira, encontro ${partnerName} com duas xícaras fumegantes e um olhar de ternura. O vale verde se abre diante de nós em silêncio. Eu sinto que cada esforço valeu a pena para viver esta calmaria hoje.`,
        duration_seconds: 180,
        cover_image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
        is_favorite: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'story-2',
        user_id: userId,
        title: 'Eu celebro a colheita abundante e a liberdade de tempo',
        category: 'PROSPERIDADE & PROPÓSITO',
        script_text: `Eu sento diante da minha mesa de trabalho com vista para a serra, observando os números e o impacto dos projetos crescendo com leveza. Meus negócios operam com autonomia e fluidez. Eu tenho tempo livre para caminhar no fim da tarde, respirar fundo e contemplar a vida com o coração transbordando de alívio e segurança.`,
        duration_seconds: 195,
        cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        is_favorite: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'story-3',
        user_id: userId,
        title: 'Eu respiro paz absoluta e certeza inabalável',
        category: 'ALINHAMENTO & PAZ',
        script_text: `O entardecer pinta o céu em tons dourados e rosados. Eu fecho os olhos e sinto todas as antigas tensões se dissolvendo do meu peito. Eu não sinto pressa nem medo. Eu confio no fluxo da vida e pertenço plenamente ao agora.`,
        duration_seconds: 160,
        cover_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
        is_favorite: false,
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const handleGenerateOnDemand = async () => {
    if (!promptInput.trim()) return;
    setIsGenerating(true);
    try {
      const newStory = await api.generateStory(userId, promptInput.trim());
      setStories((prev) => [newStory, ...prev]);
      setPromptInput('');
      router.push({
        pathname: '/player',
        params: {
          storyId: newStory.id,
          title: newStory.title,
          scriptText: newStory.script_text,
          userName,
          partnerName,
        },
      });
    } catch (err) {
      console.warn('Fallback de história sob demanda:', err);
      const fallbackStory: StoryResponse = {
        id: `story-${Date.now()}`,
        user_id: userId,
        title: promptInput.trim(),
        category: 'CRIAÇÃO SOB DEMANDA',
        script_text: `Eu vejo e sinto a realização de "${promptInput.trim()}" se materializando agora com perfeita naturalidade. Sinto a alegria vibrando em cada célula do meu corpo, acompanhado por ${partnerName}, em paz e gratidão.`,
        duration_seconds: 180,
        is_favorite: false,
        created_at: new Date().toISOString(),
      };
      setStories((prev) => [fallbackStory, ...prev]);
      setPromptInput('');
      router.push({
        pathname: '/player',
        params: {
          storyId: fallbackStory.id,
          title: fallbackStory.title,
          scriptText: fallbackStory.script_text,
          userName,
          partnerName,
        },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectTrending = (tag: string) => {
    setPromptInput(tag);
  };

  const handleOpenStory = (story: StoryResponse) => {
    router.push({
      pathname: '/player',
      params: {
        storyId: story.id,
        title: story.title,
        scriptText: story.script_text,
        userName,
        partnerName,
      },
    });
  };

  const formatTimer = () => {
    const h = timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours;
    const m = timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes;
    const s = timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds;
    return `${h}:${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabeçalho do Dashboard */}
        <View style={styles.topHeader}>
          <View>
            <Text style={styles.greetingGreeting}>BEM-VINDO AO SEU SANTUÁRIO</Text>
            <Text style={styles.greetingName}>Olá, {userName} ✨</Text>
          </View>
          <TouchableOpacity
            style={styles.profileBadge}
            onPress={() => setActiveTab('profile')}
          >
            <Ionicons name="sparkles" size={16} color={Colors.accentGold} />
            <Text style={styles.profileBadgeText}>432Hz</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= PROMPT HERO ================= */}
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>
              {userName}, o que você deseja manifestar hoje?
            </Text>
            <Text style={styles.heroSubtitle}>
              Gere uma nova narrativa sensorial personalizada em segundos.
            </Text>

            <View style={styles.heroInputBox}>
              <TextInput
                style={styles.heroInput}
                placeholder="Ex.: Uma semana de US$ 10k, paz com Simone..."
                placeholderTextColor={Colors.textMuted}
                value={promptInput}
                onChangeText={setPromptInput}
                onSubmitEditing={handleGenerateOnDemand}
              />
              <TouchableOpacity
                style={[
                  styles.heroSendButton,
                  !promptInput.trim() && styles.heroSendButtonDisabled,
                ]}
                onPress={handleGenerateOnDemand}
                disabled={!promptInput.trim() || isGenerating}
              >
                {isGenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Trending Manifestations */}
            <View style={styles.trendingContainer}>
              <Text style={styles.trendingLabel}>EM ALTA (TRENDING):</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingScroll}
              >
                {[
                  'Semana de US$ 10k',
                  `Manhã de Paz com ${partnerName}`,
                  'Despertar da Abundância',
                  'Férias na Costa Amalfitana',
                  'Casa dos Sonhos na Fazenda',
                ].map((item) => (
                  <TouchableOpacity
                    key={item}
                    style={styles.trendingPill}
                    onPress={() => handleSelectTrending(item)}
                  >
                    <Text style={styles.trendingPillText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* ================= TEMPORIZADOR DIÁRIO 24H ================= */}
          <View style={styles.timerBanner}>
            <Ionicons name="time-outline" size={18} color={Colors.timerText} />
            <Text style={styles.timerText}>
              Suas manifestações diárias renovam em{' '}
              <Text style={styles.timerCountdown}>{formatTimer()}</Text>
            </Text>
          </View>

          {/* ================= CARROSSEL "FOR YOU" ================= */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Para Você (For You)</Text>
            <Text style={styles.sectionBadge}>DIÁRIO</Text>
          </View>

          {isLoadingStories ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={Colors.primaryButton} />
              <Text style={styles.loadingText}>Sintonizando seus roteiros...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselContainer}
            >
              {stories.map((item, index) => (
                <TouchableOpacity
                  key={item.id || index}
                  activeOpacity={0.9}
                  style={styles.storyCard}
                  onPress={() => handleOpenStory(item)}
                >
                  <View style={styles.storyCardHeader}>
                    <Text style={styles.storyCategory}>{item.category || 'MANIFESTAÇÃO'}</Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        api.toggleFavorite(item.id).catch(() => {});
                      }}
                    >
                      <Ionicons
                        name={item.is_favorite ? 'heart' : 'heart-outline'}
                        size={20}
                        color={item.is_favorite ? '#D45079' : '#FFFFFF'}
                      />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.storyCardBody}>
                    <Text style={styles.storyTitle} numberOfLines={3}>
                      {item.title}
                    </Text>
                  </View>

                  <View style={styles.storyCardFooter}>
                    <View style={styles.durationPill}>
                      <Ionicons name="headset" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                      <Text style={styles.durationText}>3 min • 432Hz</Text>
                    </View>

                    <View style={styles.playCircle}>
                      <Ionicons name="play" size={18} color="#38121F" style={{ marginLeft: 2 }} />
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Citação Inspiracional do Dia */}
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>
              "Aquilo que você sente como verdade no silêncio da sua mente, torna-se a sua realidade visível."
            </Text>
            <Text style={styles.quoteAuthor}>— Princípio Akasha</Text>
          </View>
        </ScrollView>

        {/* ================= BARRA DE NAVEGAÇÃO INFERIOR ================= */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('home')}
          >
            <Ionicons
              name={activeTab === 'home' ? 'home' : 'home-outline'}
              size={22}
              color={activeTab === 'home' ? Colors.primaryButton : Colors.textMuted}
            />
            <Text
              style={[
                styles.navText,
                activeTab === 'home' && styles.navTextActive,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('library')}
          >
            <Ionicons
              name={activeTab === 'library' ? 'book' : 'book-outline'}
              size={22}
              color={activeTab === 'library' ? Colors.primaryButton : Colors.textMuted}
            />
            <Text
              style={[
                styles.navText,
                activeTab === 'library' && styles.navTextActive,
              ]}
            >
              Biblioteca
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('favorites')}
          >
            <Ionicons
              name={activeTab === 'favorites' ? 'heart' : 'heart-outline'}
              size={22}
              color={activeTab === 'favorites' ? Colors.primaryButton : Colors.textMuted}
            />
            <Text
              style={[
                styles.navText,
                activeTab === 'favorites' && styles.navTextActive,
              ]}
            >
              Favoritos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => setActiveTab('profile')}
          >
            <Ionicons
              name={activeTab === 'profile' ? 'person' : 'person-outline'}
              size={22}
              color={activeTab === 'profile' ? Colors.primaryButton : Colors.textMuted}
            />
            <Text
              style={[
                styles.navText,
                activeTab === 'profile' && styles.navTextActive,
              ]}
            >
              Perfil
            </Text>
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
    justifyContent: 'space-between',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 10,
  },
  greetingGreeting: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: Colors.accentPink,
    marginBottom: 2,
  },
  greetingName: {
    fontSize: 22,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#F2DDE3',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
  },
  heroInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF5F7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  heroInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
    paddingRight: 8,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  heroSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSendButtonDisabled: {
    backgroundColor: '#EED6DC',
  },
  trendingContainer: {
    marginTop: 14,
  },
  trendingLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  trendingScroll: {
    gap: 8,
  },
  trendingPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  trendingPillText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    paddingVertical: 10,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  timerText: {
    fontSize: 12.5,
    color: Colors.textSecondary,
  },
  timerCountdown: {
    fontWeight: '700',
    color: Colors.primaryButton,
    fontFamily: 'serif',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionBadge: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.accentPink,
    backgroundColor: '#FCEEF2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  carouselContainer: {
    gap: 14,
    paddingRight: 10,
  },
  storyCard: {
    width: 250,
    height: 330,
    backgroundColor: '#38121F',
    borderRadius: 24,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  storyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storyCategory: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#F0C2D0',
  },
  storyCardBody: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 10,
  },
  storyTitle: {
    fontSize: 19,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  storyCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  durationText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  playCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  quoteCard: {
    marginTop: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  quoteText: {
    fontSize: 13.5,
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 6,
  },
  quoteAuthor: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryButton,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EED6DC',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  navTextActive: {
    color: Colors.primaryButton,
    fontWeight: '600',
  },
});
