/**
 * Akasha App - Serviço Universal de Armazenamento Local
 * Suporta Web (localStorage) e ambientes nativos/fallback em memória
 */

export interface SynchronicityNote {
  id: string;
  storyId?: string;
  storyTitle?: string;
  text: string;
  date: string; // ISO string
}

export interface UserPreferences {
  streakDays: number;
  lastActiveDate: string;
  preferredFrequency: string; // '432hz' | '528hz'
  voiceMode: 'standard_432' | 'studio_premium' | 'clone';
  subscriptionTier: 'free' | 'premium';
}

class AkashaStorageService {
  private memoryStore: Record<string, string> = {};

  private getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fallback em caso de restrições de sandbox/cookies
    }
    return this.memoryStore[key] || null;
  }

  private setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fallback
    }
    this.memoryStore[key] = value;
  }

  // ================= SINCRONICIDADES ("MANIFESTOU!") =================

  getSynchronicities(): SynchronicityNote[] {
    const raw = this.getItem('@akasha_synchronicities');
    if (!raw) {
      // Sincronicidades padrão acolhedoras para o primeiro uso
      return [
        {
          id: 'sync-1',
          storyTitle: 'Eu assisto Simone colocar café na varanda da nossa fazenda',
          text: 'Simone acordou mais cedo hoje, fez café e me chamou para ver o sol nascendo na varanda. A sensação de paz foi idêntica ao que senti ouvindo o áudio ontem à noite.',
          date: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'sync-2',
          storyTitle: 'Eu celebro a colheita abundante e a liberdade de tempo',
          text: 'Fechamos uma proposta importante pela manhã com tranquilidade absoluta. Senti exatamente a certeza ancorada no exercício.',
          date: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  addSynchronicity(note: Omit<SynchronicityNote, 'id' | 'date'> & { date?: string }): SynchronicityNote {
    const current = this.getSynchronicities();
    const newEntry: SynchronicityNote = {
      id: `sync-${Date.now()}`,
      storyId: note.storyId,
      storyTitle: note.storyTitle || 'Manifestação Realizada',
      text: note.text,
      date: note.date || new Date().toISOString(),
    };
    const updated = [newEntry, ...current];
    this.setItem('@akasha_synchronicities', JSON.stringify(updated));
    return newEntry;
  }

  deleteSynchronicity(id: string): void {
    const current = this.getSynchronicities();
    const filtered = current.filter((s) => s.id !== id);
    this.setItem('@akasha_synchronicities', JSON.stringify(filtered));
  }

  // ================= STREAKS & PREFERÊNCIAS =================

  getUserPreferences(): UserPreferences {
    const raw = this.getItem('@akasha_user_prefs');
    if (!raw) {
      return {
        streakDays: 7,
        lastActiveDate: new Date().toISOString().split('T')[0],
        preferredFrequency: '432hz',
        voiceMode: 'standard_432',
        subscriptionTier: 'free',
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        streakDays: 7,
        lastActiveDate: new Date().toISOString().split('T')[0],
        preferredFrequency: '432hz',
        voiceMode: 'standard_432',
        subscriptionTier: 'free',
      };
    }
  }

  saveUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
    const current = this.getUserPreferences();
    const updated = { ...current, ...prefs };
    this.setItem('@akasha_user_prefs', JSON.stringify(updated));
    return updated;
  }
}

export const akashaStorage = new AkashaStorageService();

