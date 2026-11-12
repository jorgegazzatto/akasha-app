import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/theme';
import { api, StoryResponse } from '../services/api';
import { akashaStorage, SynchronicityNote } from '../services/storage';

const CATEGORIES = [
  'Todas',
  'Amor & Presença',
  'Prosperidade & Carreira',
  'Paz & Alinhamento',
  'Saúde & Vitalidade',
];

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

  // Estados da Biblioteca e Filtros
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [librarySearch, setLibrarySearch] = useState('');

  // Estados do Diário de Sincronicidades & Streaks (Sprint 6)
  const [synchronicities, setSynchronicities] = useState<SynchronicityNote[]>([]);
  const [showAddSyncModal, setShowAddSyncModal] = useState(false);
  const [newSyncText, setNewSyncText] = useState('');
  const [newSyncTitle, setNewSyncTitle] = useState('');
  const [streakDays, setStreakDays] = useState(7);

  // Estados de Monetização & Clonagem de Voz (Sprint 7)
  const [showPaywallModal, setShowPaywallModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free');
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceRecordProgress, setVoiceRecordProgress] = useState(0);

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

  // Carrega sincronicidades e preferências locais
  useEffect(() => {
    const notes = akashaStorage.getSynchronicities();
    setSynchronicities(notes);
    const prefs = akashaStorage.getUserPreferences();
    setStreakDays(prefs.streakDays);
    setSubscriptionTier(prefs.subscriptionTier);
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
        category: 'Amor & Presença',
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
        category: 'Prosperidade & Carreira',
        script_text: `Eu sento diante da minha mesa de trabalho com vista para a serra, observando os números e o impacto dos projetos crescendo com leveza. Meus negócios operam com autonomia e fluidez. Eu tenho tempo livre para caminhar no fim da tarde, respirar fundo e contemplar a vida com o coração transbordando de alívio e segurança.`,
        duration_seconds: 195,
        cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        is_favorite: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'story-3',
        user_id: userId,
        title: 'Eu respiro paz absoluta e certeza inabalável',
        category: 'Paz & Alinhamento',
        script_text: `O entardecer pinta o céu em tons dourados e rosados. Eu fecho os olhos e sinto todas as antigas tensões se dissolvendo do meu peito. Eu não sinto pressa nem medo. Eu confio no fluxo da vida e pertenço plenamente ao agora.`,
        duration_seconds: 160,
        cover_image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',
        is_favorite: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'story-4',
        user_id: userId,
        title: 'Meu corpo vibra vitalidade, energia e regeneração plena',
        category: 'Saúde & Vitalidade',
        script_text: `A cada respiração profunda, sinto minhas células se renovando em harmonia. Meus passos são firmes, meu olhar é límpido e minha mente é clara como a água da nascente. Meu corpo é meu templo sagrado de vida.`,
        duration_seconds: 175,
        cover_image_url: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=800&q=80',
        is_favorite: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 'story-5',
        user_id: userId,
        title: `Uma viagem inesquecível de celebração com ${partnerName}`,
        category: 'Amor & Presença',
        script_text: `O vento suave do mar nos toca o rosto enquanto caminhamos de mãos dadas ao pôr do sol. Rimos juntos das memórias e celebramos tudo o que construímos. O amor que compartilhamos é leve, seguro e infinito.`,
        duration_seconds: 190,
        cover_image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
        is_favorite: true,
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
        category: 'Criação Sob Demanda',
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

  const handleToggleFavorite = (storyId: string) => {
    setStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, is_favorite: !s.is_favorite } : s))
    );
    api.toggleFavorite(storyId).catch(() => {});
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

  const handleSaveManualSynchronicity = () => {
    if (!newSyncText.trim()) return;
    const added = akashaStorage.addSynchronicity({
      storyTitle: newSyncTitle.trim() || 'Sincronicidade Espontânea',
      text: newSyncText.trim(),
    });
    setSynchronicities([added, ...synchronicities]);
    setNewSyncText('');
    setNewSyncTitle('');
    setShowAddSyncModal(false);
  };

  const handleDeleteSynchronicity = (id: string) => {
    akashaStorage.deleteSynchronicity(id);
    setSynchronicities((prev) => prev.filter((s) => s.id !== id));
  };

  const handleStartVoiceCloneRecording = () => {
    setIsRecordingVoice(true);
    setVoiceRecordProgress(0);
    const interval = setInterval(() => {
      setVoiceRecordProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRecordingVoice(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);
  };

  const handleUpgradeToPremium = () => {
    setSubscriptionTier('premium');
    akashaStorage.saveUserPreferences({ subscriptionTier: 'premium' });
    setShowPaywallModal(false);
  };

  const formatTimer = () => {
    const h = timeLeft.hours < 10 ? `0${timeLeft.hours}` : timeLeft.hours;
    const m = timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes;
    const s = timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds;
    return `${h}:${m}:${s}`;
  };

  // Histórias filtradas na Biblioteca
  const filteredLibraryStories = stories.filter((story) => {
    const matchesCategory =
      selectedCategory === 'Todas' ||
      story.category?.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !librarySearch.trim() ||
      story.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
      story.script_text.toLowerCase().includes(librarySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Histórias favoritas
  const favoriteStories = stories.filter((s) => s.is_favorite);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Cabeçalho Superior com Logo */}
        <View style={styles.topHeader}>
          <View style={styles.headerBrandRow}>
            <Image
              source={require('../assets/logo.jpg')}
              style={styles.brandLogo}
              resizeMode="cover"
            />
            <View>
              <Text style={styles.greetingGreeting}>AKASHA • SANTUÁRIO</Text>
              <Text style={styles.greetingName}>Olá, {userName} ✨</Text>
            </View>
          </View>
          <View style={styles.headerRightActions}>
            <TouchableOpacity
              style={styles.profileBadge}
              onPress={() => setShowVoiceModal(true)}
            >
              <Ionicons name="sparkles" size={15} color={Colors.accentGold} />
              <Text style={styles.profileBadgeText}>
                {subscriptionTier === 'premium' ? 'Voz Estúdio' : '432Hz Alfa'}
              </Text>
            </TouchableOpacity>

            {subscriptionTier === 'free' && (
              <TouchableOpacity
                style={styles.upgradePill}
                onPress={() => setShowPaywallModal(true)}
              >
                <Ionicons name="star" size={13} color="#FFFFFF" />
                <Text style={styles.upgradePillText}>Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ================= CONTEÚDO PRINCIPAL (BASEADO NA ABA ATIVA) ================= */}
        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= ABA 1: HOME ================= */}
          {activeTab === 'home' && (
            <>
              {/* Prompt Hero */}
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
                        onPress={() => setPromptInput(item)}
                      >
                        <Text style={styles.trendingPillText}>{item}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Temporizador 24h */}
              <View style={styles.timerBanner}>
                <Ionicons name="time-outline" size={18} color={Colors.timerText} />
                <Text style={styles.timerText}>
                  Suas manifestações diárias renovam em{' '}
                  <Text style={styles.timerCountdown}>{formatTimer()}</Text>
                </Text>
              </View>

              {/* Carrossel "For You" */}
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
                        <Text style={styles.storyCategory}>
                          {item.category || 'MANIFESTAÇÃO'}
                        </Text>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(item.id);
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
                          <Ionicons
                            name="headset"
                            size={14}
                            color="#FFFFFF"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.durationText}>3 min • 432Hz</Text>
                        </View>

                        <View style={styles.playCircle}>
                          <Ionicons
                            name="play"
                            size={18}
                            color="#38121F"
                            style={{ marginLeft: 2 }}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Citação Inspiracional */}
              <View style={styles.quoteCard}>
                <Text style={styles.quoteText}>
                  "Aquilo que você sente como verdade no silêncio da sua mente, torna-se a sua realidade visível."
                </Text>
                <Text style={styles.quoteAuthor}>— Princípio Akasha</Text>
              </View>
            </>
          )}

          {/* ================= ABA 2: BIBLIOTECA (SPRINT 6) ================= */}
          {activeTab === 'library' && (
            <View style={styles.tabContainer}>
              <View style={styles.tabHeaderBox}>
                <Text style={styles.tabHeading}>Biblioteca Akasha</Text>
                <Text style={styles.tabSubheading}>
                  Seu acervo de manifestações gravadas e alinhadas.
                </Text>
              </View>

              {/* Campo de Busca */}
              <View style={styles.searchBarBox}>
                <Ionicons name="search-outline" size={18} color={Colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar manifestação por título ou intenção..."
                  placeholderTextColor={Colors.textMuted}
                  value={librarySearch}
                  onChangeText={setLibrarySearch}
                />
                {librarySearch.length > 0 && (
                  <TouchableOpacity onPress={() => setLibrarySearch('')}>
                    <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Filtros de Categoria */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryPillsScroll}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryPill,
                      selectedCategory === cat && styles.categoryPillActive,
                    ]}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryPillText,
                        selectedCategory === cat && styles.categoryPillTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Lista de Histórias da Biblioteca */}
              <View style={styles.storiesGrid}>
                {filteredLibraryStories.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Ionicons name="book-outline" size={40} color={Colors.textMuted} />
                    <Text style={styles.emptyTitle}>Nenhuma história encontrada</Text>
                    <Text style={styles.emptySubtitle}>
                      Tente outro termo de busca ou selecione outra categoria.
                    </Text>
                  </View>
                ) : (
                  filteredLibraryStories.map((story) => (
                    <TouchableOpacity
                      key={story.id}
                      style={styles.libraryCard}
                      activeOpacity={0.88}
                      onPress={() => handleOpenStory(story)}
                    >
                      <View style={styles.libraryCardTop}>
                        <View style={styles.libraryCategoryBadge}>
                          <Text style={styles.libraryCategoryBadgeText}>
                            {story.category || 'MANIFESTAÇÃO'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(story.id);
                          }}
                        >
                          <Ionicons
                            name={story.is_favorite ? 'heart' : 'heart-outline'}
                            size={20}
                            color={story.is_favorite ? '#D45079' : Colors.textMuted}
                          />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.libraryCardTitle} numberOfLines={2}>
                        {story.title}
                      </Text>

                      <Text style={styles.libraryCardSnippet} numberOfLines={2}>
                        {story.script_text}
                      </Text>

                      <View style={styles.libraryCardBottom}>
                        <View style={styles.libraryTimeMeta}>
                          <Ionicons name="headset-outline" size={14} color={Colors.textMuted} />
                          <Text style={styles.libraryTimeText}>3 min • 432Hz</Text>
                        </View>

                        <View style={styles.libraryPlayBtn}>
                          <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
                          <Text style={styles.libraryPlayText}>Ouvir</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>
          )}

          {/* ================= ABA 3: FAVORITOS (SPRINT 6) ================= */}
          {activeTab === 'favorites' && (
            <View style={styles.tabContainer}>
              <View style={styles.tabHeaderBox}>
                <Text style={styles.tabHeading}>Suas Favoritas</Text>
                <Text style={styles.tabSubheading}>
                  Narrativas salvas para sua rotina diária matinal e noturna.
                </Text>
              </View>

              {/* Botão de Rotina Rápida se houver favoritos */}
              {favoriteStories.length > 0 && (
                <View style={styles.routineBanner}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.routineBannerTitle}>✨ Rotina de Alinhamento</Text>
                    <Text style={styles.routineBannerSubtitle}>
                      {favoriteStories.length} histórias guardadas com amor
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.routineButton}
                    onPress={() => handleOpenStory(favoriteStories[0])}
                  >
                    <Ionicons name="play" size={16} color="#FFFFFF" />
                    <Text style={styles.routineButtonText}>Iniciar</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Lista de Favoritos ou Estado Vazio */}
              {favoriteStories.length === 0 ? (
                <View style={styles.emptyBox}>
                  <View style={styles.emptyHeartCircle}>
                    <Ionicons name="heart-outline" size={44} color="#D45079" />
                  </View>
                  <Text style={styles.emptyTitle}>Nenhuma história favoritada ainda</Text>
                  <Text style={styles.emptySubtitle}>
                    Toque no coração em qualquer narrativa para guardá-la aqui e criar sua rotina diária de poder.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyActionButton}
                    onPress={() => setActiveTab('library')}
                  >
                    <Text style={styles.emptyActionText}>Explorar Biblioteca</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.storiesGrid}>
                  {favoriteStories.map((story) => (
                    <TouchableOpacity
                      key={story.id}
                      style={styles.libraryCard}
                      activeOpacity={0.88}
                      onPress={() => handleOpenStory(story)}
                    >
                      <View style={styles.libraryCardTop}>
                        <View style={styles.libraryCategoryBadge}>
                          <Text style={styles.libraryCategoryBadgeText}>
                            {story.category || 'FAVORITO'}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(story.id);
                          }}
                        >
                          <Ionicons name="heart" size={20} color="#D45079" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.libraryCardTitle} numberOfLines={2}>
                        {story.title}
                      </Text>

                      <Text style={styles.libraryCardSnippet} numberOfLines={2}>
                        {story.script_text}
                      </Text>

                      <View style={styles.libraryCardBottom}>
                        <View style={styles.libraryTimeMeta}>
                          <Ionicons name="time-outline" size={14} color={Colors.textMuted} />
                          <Text style={styles.libraryTimeText}>3 min • 432Hz Alfa</Text>
                        </View>

                        <View style={styles.libraryPlayBtn}>
                          <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginLeft: 2 }} />
                          <Text style={styles.libraryPlayText}>Ouvir Agora</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ================= ABA 4: PERFIL & DIÁRIO DE SINCRONICIDADES (SPRINT 6 & 7) ================= */}
          {activeTab === 'profile' && (
            <View style={styles.tabContainer}>
              {/* Cartão de Perfil do Usuário */}
              <View style={styles.profileUserCard}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileAvatarText}>{userName.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{userName}</Text>
                  <Text style={styles.profileEmail}>
                    {subscriptionTier === 'premium' ? 'Membro Premium ⭐' : 'Membro Explorador (432Hz)'}
                  </Text>
                  <Text style={styles.profileMeta}>Conectado com {partnerName} • Akasha 2026</Text>
                </View>
              </View>

              {/* Métricas de Retenção & Streaks */}
              <View style={styles.metricsRow}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>🔥</Text>
                  <Text style={styles.metricValue}>{streakDays} Dias</Text>
                  <Text style={styles.metricLabel}>Sequência Diária</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>✨</Text>
                  <Text style={styles.metricValue}>{synchronicities.length}</Text>
                  <Text style={styles.metricLabel}>Sincronicidades</Text>
                </View>

                <View style={styles.metricCard}>
                  <Text style={styles.metricIcon}>🎧</Text>
                  <Text style={styles.metricValue}>432Hz</Text>
                  <Text style={styles.metricLabel}>Sintonia Alfa</Text>
                </View>
              </View>

              {/* Diário de Sincronicidades ("Manifestou!") */}
              <View style={styles.synchronicitySection}>
                <View style={styles.syncSectionHeader}>
                  <View>
                    <Text style={styles.syncSectionTitle}>✨ Diário de Sincronicidades</Text>
                    <Text style={styles.syncSectionSubtitle}>
                      Momentos em que a narrativa se tornou realidade
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addSyncButton}
                    onPress={() => setShowAddSyncModal(true)}
                  >
                    <Ionicons name="add" size={18} color="#FFFFFF" />
                    <Text style={styles.addSyncButtonText}>Registrar</Text>
                  </TouchableOpacity>
                </View>

                {synchronicities.length === 0 ? (
                  <View style={styles.emptySyncBox}>
                    <Text style={styles.emptySyncText}>
                      Quando algo da sua história acontecer na vida real, registre aqui para ancorar o sentimento de realização.
                    </Text>
                  </View>
                ) : (
                  synchronicities.map((item) => (
                    <View key={item.id} style={styles.syncItemCard}>
                      <View style={styles.syncItemTop}>
                        <View style={styles.syncTag}>
                          <Ionicons name="sparkles" size={12} color="#D4AF37" />
                          <Text style={styles.syncTagText}>Manifestou!</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Text style={styles.syncDate}>
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleDeleteSynchronicity(item.id)}
                          >
                            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {item.storyTitle && (
                        <Text style={styles.syncStoryRef}>Origem: {item.storyTitle}</Text>
                      )}

                      <Text style={styles.syncText}>{item.text}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Cartão de Assinatura & Clonagem (Sprint 7) */}
              <View style={styles.subscriptionBanner}>
                <View style={styles.subBannerHeader}>
                  <Ionicons name="ribbon-outline" size={24} color={Colors.accentGold} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.subBannerTitle}>
                      {subscriptionTier === 'premium'
                        ? 'Plano Premium Ativo'
                        : 'Desbloqueie Sua Própria Voz'}
                    </Text>
                    <Text style={styles.subBannerSubtitle}>
                      {subscriptionTier === 'premium'
                        ? 'Acesso irrestrito a vozes de estúdio e clonagem ElevenLabs.'
                        : 'Ouça suas manifestações narradas por você mesmo com IA de estúdio.'}
                    </Text>
                  </View>
                </View>

                {subscriptionTier === 'free' ? (
                  <TouchableOpacity
                    style={styles.subUpgradeBtn}
                    onPress={() => setShowPaywallModal(true)}
                  >
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    <Text style={styles.subUpgradeBtnText}>Fazer Upgrade Premium</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.subManageBtn}
                    onPress={() => setShowVoiceModal(true)}
                  >
                    <Ionicons name="mic-outline" size={16} color={Colors.primaryButton} />
                    <Text style={styles.subManageBtnText}>Gerenciar Minha Voz Clonada</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* ================= BARRA DE NAVEGAÇÃO INFERIOR EM 4 ABAS ================= */}
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

        {/* ================= MODAL: REGISTRAR NOVA SINCRONICIDADE (SPRINT 6) ================= */}
        <Modal
          visible={showAddSyncModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowAddSyncModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>✨ Registrar Sincronicidade</Text>
              <Text style={styles.modalSubtitle}>
                O que você sentiu, ouviu ou presenciou que confirmou a sua manifestação?
              </Text>

              <TextInput
                style={styles.modalSingleInput}
                placeholder="Título ou tema (ex.: Proposta aprovada, Abraço da Simone...)"
                placeholderTextColor={Colors.textMuted}
                value={newSyncTitle}
                onChangeText={setNewSyncTitle}
              />

              <TextInput
                style={styles.modalMultilineInput}
                placeholder="Descreva a sincronia com riqueza de detalhes e sentimento de gratidão..."
                placeholderTextColor={Colors.textMuted}
                value={newSyncText}
                onChangeText={setNewSyncText}
                multiline
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowAddSyncModal(false)}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalSaveButton,
                    !newSyncText.trim() && { opacity: 0.5 },
                  ]}
                  disabled={!newSyncText.trim()}
                  onPress={handleSaveManualSynchronicity}
                >
                  <Text style={styles.modalSaveText}>Registrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ================= MODAL: PAYWALL & ASSINATURAS (SPRINT 7) ================= */}
        <Modal
          visible={showPaywallModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPaywallModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.paywallCard}>
              <TouchableOpacity
                style={styles.paywallCloseBtn}
                onPress={() => setShowPaywallModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.paywallIconBox}>
                <Ionicons name="sparkles" size={32} color="#D4AF37" />
              </View>

              <Text style={styles.paywallTitle}>Akasha Premium</Text>
              <Text style={styles.paywallSubtitle}>
                Sua mente, sua frequência, sua própria voz manifestada.
              </Text>

              <View style={styles.benefitsList}>
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                  <Text style={styles.benefitText}>
                    <Text style={{ fontWeight: '700' }}>Clonagem de Voz Própria:</Text> Ouça suas histórias com a sua própria voz.
                  </Text>
                </View>
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                  <Text style={styles.benefitText}>
                    <Text style={{ fontWeight: '700' }}>Vozes de Estúdio ElevenLabs:</Text> Timbre humano de altíssima expressão.
                  </Text>
                </View>
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                  <Text style={styles.benefitText}>
                    <Text style={{ fontWeight: '700' }}>Frequências Ilimitadas:</Text> 432Hz Alfa, 528Hz Milagre e 963Hz Conexão.
                  </Text>
                </View>
                <View style={styles.benefitRow}>
                  <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
                  <Text style={styles.benefitText}>
                    <Text style={{ fontWeight: '700' }}>Diário Ilimitado:</Text> Registro perpétuo de sincronicidades.
                  </Text>
                </View>
              </View>

              {/* Planos */}
              <View style={styles.plansContainer}>
                <TouchableOpacity
                  style={[styles.planCard, styles.planCardActive]}
                  onPress={handleUpgradeToPremium}
                >
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>MAIS POPULAR • 53% OFF</Text>
                  </View>
                  <Text style={styles.planPeriod}>Plano Anual</Text>
                  <Text style={styles.planPrice}>
                    R$ 199,90 <Text style={styles.planFreq}>/ ano</Text>
                  </Text>
                  <Text style={styles.planInstallment}>(Equivalente a R$ 16,65 / mês)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.planCard}
                  onPress={handleUpgradeToPremium}
                >
                  <Text style={styles.planPeriod}>Plano Mensal</Text>
                  <Text style={styles.planPrice}>
                    R$ 35,90 <Text style={styles.planFreq}>/ mês</Text>
                  </Text>
                  <Text style={styles.planInstallment}>Cancele quando quiser</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.paywallCta}
                onPress={handleUpgradeToPremium}
              >
                <Text style={styles.paywallCtaText}>Começar 7 Dias Grátis</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ================= MODAL: CLONAGEM DE VOZ & VOZES DE ESTÚDIO (SPRINT 7) ================= */}
        <Modal
          visible={showVoiceModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowVoiceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.paywallCard}>
              <TouchableOpacity
                style={styles.paywallCloseBtn}
                onPress={() => setShowVoiceModal(false)}
              >
                <Ionicons name="close" size={24} color={Colors.textPrimary} />
              </TouchableOpacity>

              <Text style={styles.paywallTitle}>Voz do Narrador</Text>
              <Text style={styles.paywallSubtitle}>
                Escolha o timbre que melhor guia o seu estado meditativo.
              </Text>

              {/* Lista de Vozes */}
              <View style={styles.voicesList}>
                {[
                  { id: 'nova', name: 'Nova', desc: 'Voz suave, acolhedora e etérea' },
                  { id: 'shimmer', name: 'Shimmer', desc: 'Expressiva, calorosa e brilhante' },
                  { id: 'onyx', name: 'Onyx', desc: 'Grave, profunda e serena' },
                  { id: 'clone', name: 'Minha Própria Voz (Clonada)', desc: 'Treinada via ElevenLabs com 10s da sua voz' },
                ].map((v) => (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.voiceItem,
                      selectedVoice === v.id && styles.voiceItemActive,
                    ]}
                    onPress={() => setSelectedVoice(v.id)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.voiceName,
                          selectedVoice === v.id && styles.voiceNameActive,
                        ]}
                      >
                        {v.name}
                      </Text>
                      <Text style={styles.voiceDesc}>{v.desc}</Text>
                    </View>
                    <Ionicons
                      name={
                        selectedVoice === v.id
                          ? 'radio-button-on'
                          : 'radio-button-off'
                      }
                      size={20}
                      color={
                        selectedVoice === v.id
                          ? Colors.primaryButton
                          : Colors.textMuted
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Interface de Gravação de 10s para Clonagem */}
              <View style={styles.voiceRecordingBox}>
                <Text style={styles.recordingTitle}>Gravar Amostra de 10s</Text>
                <Text style={styles.recordingSubtitle}>
                  Fale uma frase naturalmente para a IA calibrar sua cadência.
                </Text>

                <TouchableOpacity
                  style={[
                    styles.recordCircleBtn,
                    isRecordingVoice && styles.recordCircleBtnActive,
                  ]}
                  onPress={handleStartVoiceCloneRecording}
                  disabled={isRecordingVoice}
                >
                  <Ionicons
                    name={isRecordingVoice ? 'mic' : 'mic-outline'}
                    size={28}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>

                {isRecordingVoice ? (
                  <Text style={styles.recordingTimerText}>
                    Gravando... {voiceRecordProgress}%
                  </Text>
                ) : voiceRecordProgress === 100 ? (
                  <Text style={styles.recordingSuccessText}>
                    ✅ Amostra calibrada com sucesso!
                  </Text>
                ) : (
                  <Text style={styles.recordingHint}>
                    Toque para iniciar a gravação de 10 segundos
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.paywallCta}
                onPress={() => setShowVoiceModal(false)}
              >
                <Text style={styles.paywallCtaText}>Confirmar Voz</Text>
              </TouchableOpacity>
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
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#EED6DC',
  },
  greetingGreeting: {
    fontSize: 10,
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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  profileBadgeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  upgradePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  upgradePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mainScroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // HERO CARD
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

  // ================= ESTILOS DAS SUB-ABAS (SPRINT 6) =================
  tabContainer: {
    paddingTop: 10,
  },
  tabHeaderBox: {
    marginBottom: 16,
  },
  tabHeading: {
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  tabSubheading: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#EED6DC',
    marginBottom: 14,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: Colors.textPrimary,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  categoryPillsScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  categoryPillActive: {
    backgroundColor: Colors.primaryButton,
    borderColor: Colors.primaryButton,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
  },
  storiesGrid: {
    gap: 12,
    marginTop: 4,
  },
  libraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0DCE2',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  libraryCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  libraryCategoryBadge: {
    backgroundColor: '#FCEEF2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  libraryCategoryBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.accentPink,
  },
  libraryCardTitle: {
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  libraryCardSnippet: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  libraryCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5E8EC',
    paddingTop: 10,
  },
  libraryTimeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  libraryTimeText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  libraryPlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryButton,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 4,
  },
  libraryPlayText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  routineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38121F',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  routineBannerTitle: {
    fontSize: 15,
    fontFamily: 'serif',
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  routineBannerSubtitle: {
    fontSize: 11.5,
    color: '#F0C2D0',
  },
  routineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#D45079',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  routineButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyHeartCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FCEEF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
  },
  emptyActionButton: {
    marginTop: 10,
    backgroundColor: Colors.primaryButton,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  emptyActionText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ================= ESTILOS DE PERFIL, STREAKS & SINCRONICIDADES =================
  profileUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#EED6DC',
    marginBottom: 14,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FCEEF2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accentPink,
  },
  profileAvatarText: {
    fontSize: 22,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.primaryButton,
  },
  profileName: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  profileEmail: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4AF37',
    marginTop: 1,
  },
  profileMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  metricIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  synchronicitySection: {
    marginTop: 4,
    marginBottom: 16,
  },
  syncSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  syncSectionTitle: {
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  syncSectionSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  addSyncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryButton,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  addSyncButtonText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptySyncBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  emptySyncText: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },
  syncItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EED6DC',
    marginBottom: 10,
  },
  syncItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  syncTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F0D478',
  },
  syncTagText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B8860B',
  },
  syncDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  syncStoryRef: {
    fontSize: 11.5,
    fontFamily: 'serif',
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  syncText: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  subscriptionBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#EED6DC',
    marginTop: 6,
  },
  subBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  subBannerTitle: {
    fontSize: 15,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subBannerSubtitle: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  subUpgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    borderRadius: 999,
  },
  subUpgradeBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FCEEF2',
    paddingVertical: 10,
    borderRadius: 999,
  },
  subManageBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.primaryButton,
  },

  // ================= MODAIS =================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 8, 16, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  modalSingleInput: {
    backgroundColor: '#FBF5F7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#EED6DC',
    marginBottom: 10,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  modalMultilineInput: {
    backgroundColor: '#FBF5F7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: '#EED6DC',
    minHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 16,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modalCancelText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  modalSaveButton: {
    backgroundColor: Colors.primaryButton,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
  },
  modalSaveText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // PAYWALL CARD
  paywallCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
  },
  paywallCloseBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
  },
  paywallIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  paywallTitle: {
    fontSize: 22,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  paywallSubtitle: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  benefitsList: {
    width: '100%',
    gap: 10,
    marginBottom: 18,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 12,
    color: Colors.textPrimary,
    flex: 1,
  },
  plansContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  planCard: {
    flex: 1,
    backgroundColor: '#FBF5F7',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#EED6DC',
    position: 'relative',
    alignItems: 'center',
  },
  planCardActive: {
    borderColor: '#D4AF37',
    backgroundColor: '#FFFDF5',
  },
  planBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  planBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  planPeriod: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  planPrice: {
    fontSize: 16,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.primaryButton,
    marginTop: 4,
  },
  planFreq: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  planInstallment: {
    fontSize: 9.5,
    color: Colors.textMuted,
    marginTop: 2,
  },
  paywallCta: {
    width: '100%',
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  paywallCtaText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // VOICES LIST
  voicesList: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  voiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF5F7',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EED6DC',
  },
  voiceItemActive: {
    backgroundColor: '#FFFDF5',
    borderColor: '#D4AF37',
  },
  voiceName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  voiceNameActive: {
    color: Colors.primaryButton,
  },
  voiceDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  voiceRecordingBox: {
    width: '100%',
    backgroundColor: '#FCEEF2',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  recordingTitle: {
    fontSize: 13,
    fontFamily: 'serif',
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  recordingSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  recordCircleBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryButton,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordCircleBtnActive: {
    backgroundColor: '#E53935',
  },
  recordingTimerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E53935',
  },
  recordingSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2E7D32',
  },
  recordingHint: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },

  // BOTTOM NAVIGATION
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
