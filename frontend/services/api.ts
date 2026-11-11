/**
 * Akasha App - Cliente de API para o Backend na VPS
 * Conecta ao Dokploy / FastAPI sob SSL: https://apiakh.elohdigital.com.br
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://apiakh.elohdigital.com.br/api/v1';

export interface UserCreatePayload {
  email: string;
  full_name?: string;
  password?: string;
}

export interface UserProfilePayload {
  identity_name: string;
  gender?: string;
  sexuality?: string;
  age?: number;
  has_kids?: boolean;
  occupation?: string;
  career_sentiment?: string;
  personal_description?: string;
  past_defining_moment?: string;
  current_struggle?: string;
  relationship_status?: string;
  partner_name?: string;
  partner_qualities?: string;
  dream_cities?: string[];
  dream_home_type?: string;
  core_values?: string[];
  raw_profile_data?: Record<string, any>;
}

export interface StoryResponse {
  id: string;
  user_id: string;
  title: string;
  category: string;
  script_text: string;
  act_1_anchoring?: string;
  act_2_manifestation?: string;
  act_3_gratitude?: string;
  audio_url?: string;
  duration_seconds: number;
  cover_image_url?: string;
  voice_used?: string;
  ambient_track?: string;
  is_favorite: boolean;
  created_at: string;
}

export class AkashaApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Health Check da API
   */
  async checkHealth(): Promise<{ status: string; environment: string }> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
    return res.json();
  }

  /**
   * Cria ou localiza um usuário
   */
  async createOrGetUser(payload: UserCreatePayload): Promise<any> {
    const res = await fetch(`${this.baseUrl}/users/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email,
        full_name: payload.full_name || 'Explorador Akasha',
        password: payload.password || 'akasha_secure_2026',
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Erro ao criar usuário: ${err}`);
    }
    return res.json();
  }

  /**
   * Salva o perfil psicológico completo do onboarding (5 dimensões)
   */
  async saveProfile(userId: string, profile: UserProfilePayload): Promise<any> {
    const res = await fetch(`${this.baseUrl}/users/${userId}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Erro ao salvar perfil: ${err}`);
    }
    return res.json();
  }

  /**
   * Obtém o perfil salvo do usuário
   */
  async getProfile(userId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/users/${userId}/profile`);
    if (!res.ok) throw new Error(`Erro ao obter perfil: ${res.status}`);
    return res.json();
  }

  /**
   * Gera uma história de manifestação em 3 atos em 1ª pessoa no presente
   */
  async generateStory(userId: string, category: string = 'Abundância & Amor'): Promise<StoryResponse> {
    const res = await fetch(`${this.baseUrl}/stories/generate/${userId}?category=${encodeURIComponent(category)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Erro ao gerar história: ${err}`);
    }
    return res.json();
  }

  /**
   * Obtém as histórias diárias de manifestação do usuário (ciclo de 24h)
   */
  async getDailyStories(userId: string): Promise<StoryResponse[]> {
    const res = await fetch(`${this.baseUrl}/stories/user/${userId}/daily`);
    if (!res.ok) throw new Error(`Erro ao obter histórias diárias: ${res.status}`);
    return res.json();
  }

  /**
   * Alterna o status de favorito de uma história
   */
  async toggleFavorite(storyId: string): Promise<StoryResponse> {
    const res = await fetch(`${this.baseUrl}/stories/${storyId}/favorite`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`Erro ao favoritar história: ${res.status}`);
    return res.json();
  }

  /**
   * Obtém a URL de streaming de áudio com suporte a HTTP 206
   */
  getAudioStreamUrl(filename: string): string {
    return `${this.baseUrl}/audio/stream/${filename}`;
  }
}

export const api = new AkashaApiClient();

