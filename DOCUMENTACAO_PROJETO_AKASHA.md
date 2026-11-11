# AKASHA APP — GUIA MESTRE DE PRODUTO, ARQUITETURA E ENGENHARIA

> **Versão do Documento:** 1.0  
> **Status:** Arquitetura Aprovada & Pronta para Implementação  
> **Ambiente de Desenvolvimento:** OpenIDE / VS Code  
> **Classificação:** Guia Canônico do Projeto  

---

## 1. VISÃO GERAL & TESE DE PRODUTO

O **Akasha App** é uma plataforma multiplataforma (Mobile, Tablet e Web) de desenvolvimento pessoal, alinhamento mental e manifestação através de **narrativas sensoriais em áudio imersivo, geradas sob medida por Inteligência Artificial**.

### 1.1 A Tese Central
A neurociência e a psicologia cognitiva demonstram que o cérebro humano reage a estímulos sensoriais vívidos imaginados de maneira idêntica à realidade vivenciada. Ao ouvir narrativas em **primeira pessoa no presente** (*"Eu vejo...", "Eu sinto...", "Eu celebro..."*), contendo dados reais da vida do usuário (nome de pessoas amadas, cidades desejadas, desafios superados), o subconsciente estabelece um ancoramento emocional profundo, gerando calma, clareza e reprogramação de hábitos.

### 1.2 Identidade & Atmosfera Visual
- **Paleta de Cores:** Tons suaves e etéreos (gradientes rosa quartzo, pêssego, toques de champanhe e vinho profundo para textos).
- **Tipografia:** Elegante contraste entre títulos em **Serif refinada** (*Playfair Display* / *Cormorant*) e textos/inputs em **Sans-Serif geométrica limpa** (*Inter* / *Plus Jakarta Sans*).
- **Sensação:** Íntima, acolhedora, premium, zen e transformadora.

---

## 2. EXPERIÊNCIA DO USUÁRIO & FLUXOS (UX/UI)

### 2.1 Engenharia do Onboarding (Deep Profiling Sem Fadiga)
O onboarding constrói a alma do usuário no app. Para evitar a desistência comum em formulários longos, o Akasha introduz **inovações-chave**:

1. **Entrada de Voz Alternativa ("Fale com o Akasha"):**
   - Em todas as telas com perguntas abertas, o usuário pode escolher **gravar um áudio de 20 a 30 segundos** em vez de digitar no teclado.
   - O áudio é transcrito automaticamente no backend via **Whisper/Gemini Audio**, tornando a experiência íntima, rápida e terapêutica.
2. **Pílulas de Inspiração / Quebra de Bloqueio:**
   - Sugestões clicáveis abaixo do campo de texto (ex.: *"Transição de carreira"*, *"Comprar meu imóvel"*, *"Paz mental matinal"*).
3. **Mapeamento Psicológico em 5 Dimensões:**
   - **Identidade:** Nome (com acolhimento personalizado), gênero, orientação, idade, filhos.
   - **Carreira:** Ocupação e sentimento atual em relação ao trabalho.
   - **Conflito & Resiliência:** Autodescrição aberta, momentos que moldaram a pessoa, dores e desafios do momento presente.
   - **Coadjuvantes Afetivos:** Status amoroso, nome da pessoa amada (*Simone*), qualidades admiradas e pessoas desejadas no futuro.
   - **O Sonho Manifestado:** Cidades dos sonhos, estilo de lar (Farmhouse, Penthouse, etc.) e aspirações profundas.

### 2.2 Transição com Micro-Meditação (Feedback Ativo)
Enquanto a IA orquestra o roteiro e gera o áudio (~20-30s):
- **Feedback narrativo em etapas:** *"✨ Conectando suas intenções..."* -> *"🏡 Desenhando seu refúgio na fazenda..."* -> *"🎧 Harmonizando frequências e voz..."*.
- **Esfera de Respiração Consciente:** Animação suave para respiração no padrão 4-7-8 (inspire... segure... expire...), preparando o estado fisiológico do usuário para ouvir a história.

### 2.3 Dashboard Home & Core Retention Loop
1. **Prompt Hero:** *"Jorge, o que você deseja manifestar hoje?"* com botão de envio rápido para gerar novas histórias sob demanda.
2. **Trending Manifestations:** Tags em pílula com temas em alta (*"$10k weeks"*, *"Euro summer"*, *"Going viral"*).
3. **Carrossel "For You":** Cards fotográficos verticais elegantes. Títulos gerados com as variáveis do onboarding (ex.: *"I watch Simone pour coffee on our farmhouse porch"*).
4. **Mecânica de Retenção Diária (24h Refresh):** Contador regressivo no centro da tela (*"All stories refresh in 07:24:59"*), estimulando o usuário a ouvir diariamente antes da virada do ciclo.
5. **Navegação Inferior em 4 Abas:**
   - 🏠 **Home:** Feed diário e prompt de criação.
   - 📖 **Biblioteca:** Catálogo de todas as manifestações criadas, divididas por áreas.
   - ⭐ **Favoritos:** Áudios favoritos para escuta repetida nas rotinas matinais/noturnas.
   - 👤 **Perfil:** Edição de desejos, dados pessoais, assinaturas e clonagem de voz.

### 2.4 O Player de Áudio Imersivo
- **Mixer Sonoro de Duas Camadas:**
  - *Canal 1:* Volume da Voz do Narrador (0 a 100%).
  - *Canal 2:* Trilha Sonora Ambiente selecionável (Chuva suave, Lareira, Ondas do mar ou Frequências Binaurais: 432Hz para cura / 528Hz para transformação).
- **Legendas Sincronizadas (Estilo Karaokê):** As palavras e frases se iluminam em sincronia com a voz, aumentando o foco mental.
- **Diário de Sincronicidades ("Manifestou!"):** Botão onde o usuário registra quando algo da narrativa se concretiza na vida real.
- **Micro Check-in Pós-Escuta:** Avaliação de 1 toque sobre o estado de espírito (*Inspirado, Em paz, Confiante*).

---

## 3. ARQUITETURA DE SISTEMAS & STACK TECNOLÓGICA

```
┌────────────────────────────────────────────────────────────────────────┐
│                   APLICAÇÃO UNIVERSAL (EXPO / REACT NATIVE)            │
│       [ Smartphone (iOS / Android) ]   [ Tablet ]   [ PC / Web PWA ]   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST / WebSockets
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       SUA VPS (DOCKER + NGINX)                         │
│                                                                        │
│   [ Nginx Reverse Proxy (SSL Certbot) ]                                │
│                     │                                                  │
│   [ API Backend (FastAPI / Python) ] ───► [ PostgreSQL (Banco) ]       │
│                     │                                                  │
│   [ Redis + Celery / RQ (Fila de Áudio) ]                              │
│         │                  │                                           │
│         ▼                  ▼                                           │
│  [ FFmpeg Audio ]   [ Whisper / STT ]                                  │
└─────────┬──────────────────┬───────────────────────────────────────────┘
          │                  │
          ▼                  ▼
┌──────────────────┐  ┌─────────────────────┐  ┌────────────────────────┐
│   OPENAI / GEMINI│  │    ELEVENLABS API   │  │  CLOUDFLARE R2 / S3    │
│  (Roteiro em 1ªP)│  │ (Vozes & Clonagem)  │  │(Streaming CDN de MP3)  │
└──────────────────┘  └─────────────────────┘  └────────────────────────┘
```

### 3.1 Frontend Universal (Código Único)
- **Tecnologia:** **React Native com Expo (Expo Router + Web)**.
- **Vantagem Estratégica:** Uma única base de código em TypeScript que roda nativamente no iOS, Android e no Navegador Desktop/Tablet como Web App Responsivo (PWA).
- **Reprodução em Segundo Plano:** Utilização de `react-native-track-player` ou `expo-av` para manter a reprodução ativa com a tela do celular apagada ou trocando de aba no PC.

### 3.2 Backend na VPS (Sua Infraestrutura Privada)
- **Tecnologia:** **Python (FastAPI)** conteinerizado via Docker Compose.
- **Serviços na VPS:**
  1. `api`: FastAPI assíncrono (validações, endpoints de perfil, streaming e auth).
  2. `worker`: Processamento assíncrono de geração de áudios pesados sem travar as requisições do usuário.
  3. `redis`: Fila de tarefas para o worker.
  4. `db`: PostgreSQL para persistência de dados.
  5. `nginx`: Proxy reverso gerenciando certificados SSL Let's Encrypt automaticamente.

### 3.3 Storage e Distribuição de Áudio (Proteção da VPS)
- Os arquivos `.mp3` pós-processados são enviados automaticamente para **Cloudflare R2** (armazenamento compatível com S3 com **custo zero de egress/tráfego de rede**).
- Os clientes (Web/Mobile) fazem o streaming diretamente pela CDN da Cloudflare, mantendo a largura de banda da sua VPS 100% livre.

---

## 4. ESTRATÉGIA HÍBRIDA DE VOZ & ECONOMIA UNITÁRIA (UNIT ECONOMICS)

Para garantir **máximo realismo emocional com custo operacional mínimo**, adota-se a arquitetura de **Vozes em 3 Camadas**:

### 4.1 Camada 1: Custo Otimizado para Entrada e Escala
- **Motores:** **OpenAI TTS-1-HD** (vozes `nova`, `shimmer`, `onyx`) ou **ElevenLabs Flash v2.5** / **Google Journey**.
- **Custo Médio:** ~US$ 0,07 (~R$ 0,40) por história de 3 minutos (2.500 caracteres).
- **Aplicação:** Utilizado nas histórias do onboarding gratuito, no feed padrão diário e nos testes.

### 4.2 Camada 2: O Tratamento de Estúdio no Backend (FFmpeg)
Para evitar que a voz soe sintética ou mecânica, o backend aplica um pipeline de pós-produção em Python/FFmpeg:
1. **Equalização Warm:** Realce de frequências baixas (150-250Hz) para sensação de intimidade e proximidade auricular.
2. **Reverb de Sala Suave:** Elimina a aridez do áudio digital.
3. **Masterização com Trilha Subliminar:** Inserção em volume calibrado da frequência harmônica (432Hz) sob a fala.
*Resultado:* Uma voz econômica soa com qualidade idêntica a produções profissionais de estúdio.

### 4.3 Camada 3: Premium & Clonagem de Voz
- **Motor:** **ElevenLabs Voice Cloning & Multilingual v2**.
- **Aplicação:** Exclusivo para assinantes pagantes que gravam 10 segundos da própria voz.
- **Viabilidade:** O valor da assinatura mensal (R$ 35,90) cobre com ampla margem o custo de clonagem e gerações personalizadas do assinante.

### 4.4 Cache de Manifestações Populares
Histórias da aba *Trending* com temas universais são geradas uma única vez e servidas a milhares de usuários via cache de CDN, com custo de IA próximo de zero.

---

## 5. MODELO DE DADOS CONCEITUAL (POSTGRESQL)

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_status VARCHAR(50) DEFAULT 'free' -- 'free', 'trial', 'premium'
);

-- Perfil Detalhado do Onboarding
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(50),
    sexuality VARCHAR(50),
    age INT,
    has_kids BOOLEAN,
    occupation TEXT,
    career_sentiment TEXT,
    personal_description TEXT,
    past_defining_moment TEXT,
    current_struggle TEXT,
    relationship_status VARCHAR(50),
    partner_name VARCHAR(100),
    partner_qualities TEXT,
    dream_cities TEXT[],
    dream_home_type VARCHAR(100),
    core_values TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Histórias de Manifestação
CREATE TABLE manifestation_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    script_text TEXT NOT NULL,
    audio_url TEXT NOT NULL,
    duration_seconds INT DEFAULT 180,
    cover_image_url TEXT,
    voice_used VARCHAR(50),
    ambient_track VARCHAR(50),
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diário de Sincronicidades ("Manifestou!")
CREATE TABLE synchronicity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    story_id UUID REFERENCES manifestation_stories(id),
    notes TEXT NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. PROMPT MASTER DO STORYTELLING (LLM PROMPT SYSTEM)

```text
Você é o roteirista mestre do Akasha App. Sua missão é escrever uma narrativa de manifestação imersiva, vívida e emocional em PRIMEIRA PESSOA DO PRESENTE ("Eu vejo...", "Eu sinto...").

DIRETRIZES FUNDAMENTAIS:
1. Tom: Sereno, sensorial, íntimo, empoderador, sem clichês vazios.
2. Formato: Narrativa contínua dividida em 3 atos (Ancoragem no ambiente -> O acontecimento da realização -> Gratidão profunda).
3. Dados do Usuário: Integre com naturalidade os dados do perfil fornecidos (Nome da pessoa amada: {partner_name}, Lar dos sonhos: {dream_home_type}, Cidade: {dream_city}).
4. Transmutação: Aborde sutilmente o desafio superado ({current_struggle}) mostrando o alívio e a conquista do estado atual.
5. Extensão: Entre 350 e 450 palavras (ideal para ~3 minutos de leitura pausada).
6. Ritmo: Inclua pontuações que permitam pausas respiratórias no sintetizador de voz.
```

---

## 7. ROADMAP DE DESENVOLVIMENTO (SPRINTS NO OPENIDE)

### Sprint 1: Fundação & Design System
- [ ] Inicialização do projeto **Expo Universal** com TypeScript.
- [ ] Configuração do Tailwind / NativeWind com a paleta e fontes do Akasha.
- [ ] Construção dos componentes base (Botões, Cards, Inputs, Pílulas).

### Sprint 2: Onboarding Conversacional & Entrada de Voz
- [ ] Telas do Onboarding sequencial (1 tela por pergunta).
- [ ] Componente de gravação de áudio com microfone para transcrição automática.
- [ ] Tela de transição com esfera de respiração guiada (4-7-8).

### Sprint 3: Backend na VPS & Pipeline de Áudio
- [ ] Configuração do Docker Compose na VPS (FastAPI, Redis, PostgreSQL).
- [ ] Endpoint de orquestração do LLM para geração do roteiro em 1ª pessoa.
- [ ] Integração do sintetizador de voz + pós-produção FFmpeg (EQ Warm + 432Hz).
- [ ] Upload automático dos áudios no Cloudflare R2 / CDN.

### Sprint 4: Dashboard, Player Imersivo & Biblioteca
- [ ] Home com carrossel dinâmico "For You", prompt hero e timer de 24h.
- [ ] Player multimídia com controle de duas camadas (Voz + Fundo Ambiente).
- [ ] Legendas sincronizadas na tela.
- [ ] Abas de Biblioteca, Favoritos e Diário de Sincronicidades.

### Sprint 5: Monetização, Clonagem de Voz & Lançamento
- [ ] Modal de vozes e funcionalidade de gravação para clonagem de voz.
- [ ] Paywall e integração com pagamentos recorrentes (Stripe / Google Play / App Store).
- [ ] Deploy do Web App PWA e build das versões mobile (Android APK/AAB e iOS).

---
*Documento registrado para padronização e guia contínuo de desenvolvimento do Akasha App.*
