import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/theme';
import { ProgressBar } from '../../components/ProgressBar';
import { PillButton } from '../../components/PillButton';
import { VoiceInputField } from '../../components/VoiceInputField';
import { InspirationPills } from '../../components/InspirationPills';
import { api, UserProfilePayload } from '../../services/api';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 15;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados das 5 Dimensões Psicológicas
  const [formData, setFormData] = useState({
    // Dimensão 1: Identidade
    name: '',
    gender: '',
    sexuality: '',
    ageGroup: '',
    ageNumber: 30,
    hasKids: false,
    hasKidsText: '',

    // Dimensão 2: Carreira
    occupation: '',
    careerSentiment: '',

    // Dimensão 3: Conflito & Resiliência
    personalDescription: '',
    pastDefiningMoment: '',
    currentStruggle: '',

    // Dimensão 4: Coadjuvantes Afetivos
    relationshipStatus: '',
    partnerName: '',
    partnerQualities: '',

    // Dimensão 5: O Sonho
    dreamCities: [] as string[],
    dreamHomeType: '',
    coreValues: [] as string[],
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'dreamCities' | 'coreValues', item: string) => {
    setFormData((prev) => {
      const list = prev[field];
      if (list.includes(item)) {
        return { ...prev, [field]: list.filter((i) => i !== item) };
      } else {
        return { ...prev, [field]: [...list, item] };
      }
    });
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      // Conclusão do Onboarding (Etapa 15) -> Envio para a API
      await submitOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const email = `${formData.name.toLowerCase().replace(/\s+/g, '') || 'explorador'}_${Date.now()}@akasha.internal`;
      
      // 1. Cria o usuário na VPS
      const user = await api.createOrGetUser({
        email,
        full_name: formData.name || 'Alma Akasha',
      });

      // 2. Prepara o payload do perfil nas 5 dimensões
      const profilePayload: UserProfilePayload = {
        identity_name: formData.name,
        gender: formData.gender,
        sexuality: formData.sexuality,
        age: formData.ageNumber,
        has_kids: formData.hasKids,
        occupation: formData.occupation,
        career_sentiment: formData.careerSentiment,
        personal_description: formData.personalDescription,
        past_defining_moment: formData.pastDefiningMoment,
        current_struggle: formData.currentStruggle,
        relationship_status: formData.relationshipStatus,
        partner_name: formData.partnerName,
        partner_qualities: formData.partnerQualities,
        dream_cities: formData.dreamCities.length > 0 ? formData.dreamCities : ['Serra da Mantiqueira'],
        dream_home_type: formData.dreamHomeType || 'Fazenda rústica aconchegante',
        core_values: formData.coreValues.length > 0 ? formData.coreValues : ['Paz', 'Amor', 'Presença'],
        raw_profile_data: formData,
      };

      // 3. Salva o perfil na VPS
      await api.saveProfile(user.id, profilePayload);

      // 4. Navega para a tela de espera mágica e geração de roteiro
      router.push({
        pathname: '/transition',
        params: {
          userId: user.id,
          name: formData.name,
          partnerName: formData.partnerName,
          dreamHome: formData.dreamHomeType,
        },
      });
    } catch (err: any) {
      console.error('Erro no onboarding:', err);
      // Fallback gracioso para continuar caso esteja offline
      router.push({
        pathname: '/transition',
        params: {
          userId: '5d53a8e9-6ca9-4952-82fa-c9f3bd8b3c88',
          name: formData.name || 'Jorge',
          partnerName: formData.partnerName || 'Simone',
          dreamHome: formData.dreamHomeType || 'Fazenda',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ProgressBar
          currentStep={step}
          totalSteps={totalSteps}
          onBack={handleBack}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ================= ETAPA 1: NOME ================= */}
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Primeiro, como devemos te chamar?</Text>
              <Text style={styles.subtitle}>
                Seu nome será o elo condutor e a assinatura de todas as suas narrativas sonoras.
              </Text>
              <VoiceInputField
                value={formData.name}
                onChangeText={(text) => updateField('name', text)}
                onSubmit={() => formData.name.trim() && handleNext()}
                placeholder="Seu nome ou apelido carinhoso..."
                autoFocus
              />
            </View>
          )}

          {/* ================= ETAPA 2: ACOLHIMENTO ================= */}
          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Que alegria ter você aqui, {formData.name || 'amigo(a)'}.</Text>
              <Text style={styles.bodyPoetic}>
                Este é o seu refúgio sagrado para acalmar a mente, alinhar sua energia e vivenciar sensorialmente a realidade que você está criando.
              </Text>
              <Text style={styles.subtitle}>
                A seguir, faremos algumas perguntas breves para calibrar a sua essência. Você pode digitar ou simplesmente falar pelo microfone.
              </Text>
              <TouchableOpacity style={styles.primaryActionButton} onPress={handleNext}>
                <Text style={styles.primaryActionButtonText}>Iniciar Meu Alinhamento</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= ETAPA 3: IDENTIDADE DE GÊNERO ================= */}
          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Como você se identifica?</Text>
              <Text style={styles.subtitle}>Usamos para calibrar os pronomes e a atmosfera dos roteiros.</Text>
              <View style={styles.optionsWrap}>
                {['Mulher', 'Homem', 'Não-binário', 'Prefiro não especificar'].map((opt) => (
                  <PillButton
                    key={opt}
                    label={opt}
                    selected={formData.gender === opt}
                    onPress={() => {
                      updateField('gender', opt);
                      handleNext();
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ================= ETAPA 4: ORIENTAÇÃO AFETIVA ================= */}
          {step === 4 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Qual a sua orientação afetiva?</Text>
              <Text style={styles.subtitle}>Para que as histórias de amor e convivência sejam autênticas para você.</Text>
              <View style={styles.optionsWrap}>
                {['Heterossexual', 'Homossexual', 'Bissexual / Pansexual', 'Outro'].map((opt) => (
                  <PillButton
                    key={opt}
                    label={opt}
                    selected={formData.sexuality === opt}
                    onPress={() => {
                      updateField('sexuality', opt);
                      handleNext();
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ================= ETAPA 5: FAIXA ETÁRIA ================= */}
          {step === 5 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Qual é a sua fase de vida?</Text>
              <Text style={styles.subtitle}>Ajuda a calibrar o ritmo e a maturidade dos temas abordados.</Text>
              <View style={styles.optionsWrap}>
                {[
                  { label: '18 a 24 anos', age: 22 },
                  { label: '25 a 34 anos', age: 30 },
                  { label: '35 a 44 anos', age: 40 },
                  { label: '45 a 54 anos', age: 50 },
                  { label: '55+ anos de sabedoria', age: 60 },
                ].map((item) => (
                  <PillButton
                    key={item.label}
                    label={item.label}
                    selected={formData.ageGroup === item.label}
                    onPress={() => {
                      updateField('ageGroup', item.label);
                      updateField('ageNumber', item.age);
                      handleNext();
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ================= ETAPA 6: FILHOS ================= */}
          {step === 6 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Você tem ou deseja ter filhos?</Text>
              <Text style={styles.subtitle}>A família e as pessoas queridas podem surgir nas suas manhãs e celebrações.</Text>
              <View style={styles.optionsWrap}>
                {[
                  { label: 'Sim, tenho filhos amados', val: true },
                  { label: 'Não tenho filhos', val: false },
                  { label: 'Pretendo ter no momento certo', val: true },
                ].map((item) => (
                  <PillButton
                    key={item.label}
                    label={item.label}
                    selected={formData.hasKidsText === item.label}
                    onPress={() => {
                      updateField('hasKidsText', item.label);
                      updateField('hasKids', item.val);
                      handleNext();
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ================= ETAPA 7: CARREIRA / ATIVIDADE ================= */}
          {step === 7 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Qual é o seu trabalho ou profissão atual?</Text>
              <Text style={styles.subtitle}>Para te colocar no centro de realizações e impacto profissional.</Text>
              <VoiceInputField
                value={formData.occupation}
                onChangeText={(text) => updateField('occupation', text)}
                onSubmit={() => formData.occupation.trim() && handleNext()}
                placeholder="Ex.: Empreendedor digital, Arquiteto, Médico..."
              />
              <InspirationPills
                items={[
                  'Empreendedor(a) & Negócios',
                  'Criador(a) / Artista',
                  'Líder Executivo(a)',
                  'Profissional de Tecnologia',
                  'Saúde & Bem-estar',
                  'Consultoria & Autônomo',
                ]}
                onSelect={(item) => updateField('occupation', item)}
              />
            </View>
          )}

          {/* ================= ETAPA 8: SENTIMENTO NA CARREIRA ================= */}
          {step === 8 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Como você se sente com sua carreira hoje?</Text>
              <Text style={styles.subtitle}>Identificamos o estado atual para criar o salto quântico de alívio.</Text>
              <View style={styles.optionsWrap}>
                {[
                  'Realizado(a) querendo multiplicar meu impacto',
                  'Em transição para o meu verdadeiro propósito',
                  'Em busca de clareza e novas oportunidades',
                  'Sentindo sobrecarga / Buscando leveza e equilíbrio',
                ].map((opt) => (
                  <PillButton
                    key={opt}
                    label={opt}
                    selected={formData.careerSentiment === opt}
                    onPress={() => {
                      updateField('careerSentiment', opt);
                      handleNext();
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ================= ETAPA 9: AUTODESCRIÇÃO ================= */}
          {step === 9 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Como você se descreve em poucas palavras?</Text>
              <Text style={styles.subtitle}>Suas qualidades autênticas que brilham nas histórias.</Text>
              <VoiceInputField
                value={formData.personalDescription}
                onChangeText={(text) => updateField('personalDescription', text)}
                onSubmit={() => formData.personalDescription.trim() && handleNext()}
                placeholder="Ex.: Focado, afetuoso, visionário, apaixonado por liberdade..."
                multiline
              />
              <InspirationPills
                items={[
                  'Resiliente e sonhador(a)',
                  'Sensível, intuitivo(a) e leal',
                  'Líder empático e focado',
                  'Amante da paz e da liberdade',
                ]}
                onSelect={(item) => updateField('personalDescription', item)}
              />
            </View>
          )}

          {/* ================= ETAPA 10: MOMENTO MARCANTE DO PASSADO ================= */}
          {step === 10 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Que vitória do passado provou a sua força?</Text>
              <Text style={styles.subtitle}>Lembrar de onde você já venceu ancora a certeza do futuro.</Text>
              <VoiceInputField
                value={formData.pastDefiningMoment}
                onChangeText={(text) => updateField('pastDefiningMoment', text)}
                onSubmit={() => formData.pastDefiningMoment.trim() && handleNext()}
                placeholder="Ex.: Quando recomecei do zero e venci, uma virada financeira..."
                multiline
              />
              <InspirationPills
                items={[
                  'Superação de uma crise financeira',
                  'A coragem de recomeçar do zero',
                  'Reconstrução após um momento difícil',
                  'Conquista da minha independência',
                ]}
                onSelect={(item) => updateField('pastDefiningMoment', item)}
              />
            </View>
          )}

          {/* ================= ETAPA 11: DESAFIO ATUAL (A TRANSMUTAR) ================= */}
          {step === 11 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>O que mais desafia o seu coração hoje?</Text>
              <Text style={styles.subtitle}>O ponto que vamos transmutar em alívio e segurança profunda nas narrativas.</Text>
              <VoiceInputField
                value={formData.currentStruggle}
                onChangeText={(text) => updateField('currentStruggle', text)}
                onSubmit={() => formData.currentStruggle.trim() && handleNext()}
                placeholder="Ex.: Ansiedade com o futuro, medo de arriscar, falta de tempo..."
                multiline
              />
              <InspirationPills
                items={[
                  'Ansiedade e excesso de pensamentos no amanhã',
                  'Insegurança financeira ou receio de dar o salto',
                  'Falta de tempo com quem mais amo',
                  'Autocobrança e sensação de pressa',
                ]}
                onSelect={(item) => updateField('currentStruggle', item)}
              />
            </View>
          )}

          {/* ================= ETAPA 12: STATUS AFETIVO ================= */}
          {step === 12 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Como está o seu coração hoje?</Text>
              <Text style={styles.subtitle}>O amor e o carinho compartilhado elevam a vibração da manifestação.</Text>
              <View style={styles.optionsWrap}>
                {[
                  'Em um relacionamento feliz e estável',
                  'Namorando apaixonado(a)',
                  'Solteiro(a) vivendo meu autoconhecimento',
                  'Aberto(a) e pronto(a) para encontrar meu amor',
                ].map((opt) => (
                  <PillButton
                    key={opt}
                    label={opt}
                    selected={formData.relationshipStatus === opt}
                    onPress={() => {
                      updateField('relationshipStatus', opt);
                      handleNext();
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          {/* ================= ETAPA 13: PESSOA AMADA OU PARCEIRO(A) IDEAL ================= */}
          {step === 13 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Quem compartilha a vida com você?</Text>
              <Text style={styles.subtitle}>
                Digite o nome da pessoa amada (ex.: <em>Simone</em>) ou as qualidades que você mais admira.
              </Text>
              <VoiceInputField
                value={formData.partnerName}
                onChangeText={(text) => updateField('partnerName', text)}
                onSubmit={() => handleNext()}
                placeholder="Ex.: Simone (minha parceira de vida e cumplicidade)..."
              />
              <InspirationPills
                items={[
                  'Simone - amor calmo e riso fácil',
                  'Parceria leve, apoio mútuo e carinho',
                  'Olhar acolhedor e presença segura',
                  'Alguém que sonha e constrói junto',
                ]}
                onSelect={(item) => updateField('partnerName', item)}
              />
              <TouchableOpacity style={styles.primaryActionButton} onPress={handleNext}>
                <Text style={styles.primaryActionButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= ETAPA 14: CIDADES DOS SONHOS ================= */}
          {step === 14 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Onde você se vê vivendo ou descansando?</Text>
              <Text style={styles.subtitle}>Selecione um ou mais destinos que fazem seus olhos brilharem.</Text>
              <View style={styles.pillsMultiWrap}>
                {[
                  'Serra da Mantiqueira',
                  'Fazenda no Interior',
                  'Costa Amalfitana',
                  'Paris',
                  'Nova York',
                  'Bali',
                  'Florença',
                  'Praia do Rosa',
                  'Lisboa',
                ].map((city) => (
                  <PillButton
                    key={city}
                    label={city}
                    selected={formData.dreamCities.includes(city)}
                    onPress={() => toggleArrayItem('dreamCities', city)}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={[
                  styles.primaryActionButton,
                  formData.dreamCities.length === 0 && styles.primaryActionButtonDisabled,
                ]}
                onPress={handleNext}
                disabled={formData.dreamCities.length === 0}
              >
                <Text style={styles.primaryActionButtonText}>Avançar para o Último Passo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ================= ETAPA 15: LAR DOS SONHOS & VALORES CENTRAIS ================= */}
          {step === 15 && (
            <View style={styles.card}>
              <Text style={styles.titleSerif}>Como é o seu refúgio e o que te guia?</Text>
              <Text style={styles.subtitle}>Escolha o estilo de lar onde você celebrará suas manhãs.</Text>
              
              <Text style={styles.sectionLabel}>Estilo do Lar:</Text>
              <View style={styles.optionsWrap}>
                {[
                  'Fazenda rústica aconchegante com varanda',
                  'Penthouse contemporânea com vista panorâmica',
                  'Casa de praia ampla e envidraçada',
                  'Chalé zen nas montanhas com lareira',
                ].map((home) => (
                  <PillButton
                    key={home}
                    label={home}
                    selected={formData.dreamHomeType === home}
                    onPress={() => updateField('dreamHomeType', home)}
                  />
                ))}
              </View>

              <Text style={styles.sectionLabel}>Valores Centrais de Vida (Selecione):</Text>
              <View style={styles.pillsMultiWrap}>
                {['Paz Interior', 'Amor Verdadeiro', 'Liberdade', 'Abundância', 'Presença'].map((val) => (
                  <PillButton
                    key={val}
                    label={val}
                    selected={formData.coreValues.includes(val)}
                    onPress={() => toggleArrayItem('coreValues', val)}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={styles.completeButton}
                activeOpacity={0.85}
                onPress={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.completeButtonText}>Concluir & Criar Minhas Histórias ✨</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 28,
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F2DDE3',
  },
  titleSerif: {
    fontFamily: 'serif',
    fontSize: 26,
    color: Colors.textPrimary,
    lineHeight: 33,
    marginBottom: 8,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14.5,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 18,
  },
  bodyPoetic: {
    fontSize: 15.5,
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  optionsWrap: {
    width: '100%',
    marginVertical: 4,
  },
  pillsMultiWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 14,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  primaryActionButton: {
    backgroundColor: Colors.primaryButton,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  primaryActionButtonDisabled: {
    backgroundColor: '#EED6DC',
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#38121F',
    paddingVertical: 18,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
    shadowColor: Colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
