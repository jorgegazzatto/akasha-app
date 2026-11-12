/**
 * Akasha App - Motor de Áudio Universal (Web Audio API & Síntese Sensorial)
 * Suporta o Mixer Sonoro de 2 Camadas:
 * - Camada 1: Voz do Narrador (pt-BR sensorial com controle de volume e pausa)
 * - Camada 2: Frequência Harmônica 432Hz/528Hz pura sintetizada em tempo real + Ambientes
 */

class AkashaAudioEngine {
  private audioCtx: AudioContext | null = null;
  private oscNode1: OscillatorNode | null = null;
  private oscNode2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;

  // Estado de Voz
  private voiceUtterance: SpeechSynthesisUtterance | null = null;
  private isVoicePlaying: boolean = false;
  private currentSentenceIndex: number = 0;
  private sentences: string[] = [];
  private onSentenceCallback: ((index: number) => void) | null = null;
  private onFinishedCallback: (() => void) | null = null;

  private voiceVolume: number = 1.0;
  private ambientVolume: number = 0.6;
  private currentTrack: string = '432hz';

  // Inicializa o AudioContext com tratamento de autoplay do navegador
  private initAudioContext() {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!this.audioCtx) {
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  // ================= CAMADA 2: AMBIENTE & FREQUÊNCIA 432HZ / 528HZ =================

  public startAmbient(track: string = '432hz', volume: number = 0.6) {
    this.currentTrack = track;
    this.ambientVolume = volume;

    if (typeof window === 'undefined') return;
    this.initAudioContext();
    if (!this.audioCtx) return;

    this.stopAmbient();

    try {
      this.ambientGain = this.audioCtx.createGain();
      this.ambientGain.gain.setValueAtTime(volume * 0.18, this.audioCtx.currentTime);
      this.ambientGain.connect(this.audioCtx.destination);

      if (track === '432hz' || track === '528hz') {
        const baseFreq = track === '432hz' ? 432 : 528;

        // Oscilador 1: Tom fundamental puro (cura / alinhamento)
        this.oscNode1 = this.audioCtx.createOscillator();
        this.oscNode1.type = 'sine';
        this.oscNode1.frequency.setValueAtTime(baseFreq, this.audioCtx.currentTime);
        this.oscNode1.connect(this.ambientGain);
        this.oscNode1.start();

        // Oscilador 2: Harmônico superior suave para profundidade meditativa
        this.oscNode2 = this.audioCtx.createOscillator();
        this.oscNode2.type = 'sine';
        this.oscNode2.frequency.setValueAtTime(baseFreq * 2, this.audioCtx.currentTime);
        const harmGain = this.audioCtx.createGain();
        harmGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
        this.oscNode2.connect(harmGain);
        harmGain.connect(this.ambientGain);
        this.oscNode2.start();

      } else {
        // Sons da Natureza (Chuva, Lareira, Ondas) gerados proceduralmente via buffer rosa/filtrado
        this.startProceduralNature(track);
      }
    } catch (e) {
      console.warn('Erro ao iniciar camada ambiente:', e);
    }
  }

  private startProceduralNature(track: string) {
    if (!this.audioCtx || !this.ambientGain) return;

    const bufferSize = this.audioCtx.sampleRate * 2;
    const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.08;
      b2 = 0.85 * b2 + white * 0.15;
      output[i] = (b0 + b1 + b2) * 0.5;
    }

    const whiteNoise = this.audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filtro passa-baixa para suavidade
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(track === 'waves' ? 450 : track === 'rain' ? 800 : 350, this.audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  public setAmbientVolume(volume: number) {
    this.ambientVolume = volume;
    if (this.ambientGain && this.audioCtx) {
      this.ambientGain.gain.setValueAtTime(volume * 0.18, this.audioCtx.currentTime);
    }
  }

  public stopAmbient() {
    try {
      if (this.oscNode1) {
        this.oscNode1.stop();
        this.oscNode1.disconnect();
        this.oscNode1 = null;
      }
      if (this.oscNode2) {
        this.oscNode2.stop();
        this.oscNode2.disconnect();
        this.oscNode2 = null;
      }
      if (this.noiseNode) {
        (this.noiseNode as any).stop?.();
        this.noiseNode.disconnect();
        this.noiseNode = null;
      }
    } catch {}
  }

  // ================= CAMADA 1: VOZ DO NARRADOR (LOCUÇÃO SENSORIAL) =================

  public stopVoice() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  public startVoice(
    sentences: string[],
    startIndex: number = 0,
    volume: number = 1.0,
    onSentence: (index: number) => void,
    onFinished: () => void
  ) {
    this.sentences = sentences;
    this.currentSentenceIndex = startIndex;
    this.voiceVolume = volume;
    this.onSentenceCallback = onSentence;
    this.onFinishedCallback = onFinished;
    this.isVoicePlaying = true;

    this.stopVoice();
    this.playNextSentence();
  }

  private playNextSentence() {
    if (!this.isVoicePlaying) return;
    if (this.currentSentenceIndex >= this.sentences.length) {
      this.isVoicePlaying = false;
      if (this.onFinishedCallback) this.onFinishedCallback();
      return;
    }

    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Notifica a frase atual para iluminação do Karaokê
    if (this.onSentenceCallback) {
      this.onSentenceCallback(this.currentSentenceIndex);
    }

    const textToSpeak = this.sentences[this.currentSentenceIndex];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.88; // Cadência meditativa serena
    utterance.pitch = 0.98; // Tom natural acolhedor
    utterance.volume = this.voiceVolume;

    // Tenta encontrar uma voz de alta fidelidade em português
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(
      (v) => v.lang.includes('pt-BR') || v.lang.includes('pt_BR') || v.lang.includes('pt')
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onend = () => {
      if (this.isVoicePlaying) {
        this.currentSentenceIndex++;
        // Pequena pausa respiratória de 600ms entre frases
        setTimeout(() => {
          this.playNextSentence();
        }, 600);
      }
    };

    utterance.onerror = (e) => {
      console.warn('Erro na síntese vocal:', e);
      if (this.isVoicePlaying) {
        this.currentSentenceIndex++;
        this.playNextSentence();
      }
    };

    this.voiceUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public setVoiceVolume(volume: number) {
    this.voiceVolume = volume;
    if (this.voiceUtterance) {
      this.voiceUtterance.volume = volume;
    }
  }

  public pause() {
    this.isVoicePlaying = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.stopAmbient();
  }

  public resume() {
    this.isVoicePlaying = true;
    this.startAmbient(this.currentTrack, this.ambientVolume);
    this.playNextSentence();
  }

  public stopAll() {
    this.isVoicePlaying = false;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    this.stopAmbient();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try {
        this.audioCtx.suspend();
      } catch {}
    }
  }

  public seekSentence(index: number) {
    this.currentSentenceIndex = Math.max(0, Math.min(this.sentences.length - 1, index));
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (this.isVoicePlaying) {
      this.playNextSentence();
    } else {
      if (this.onSentenceCallback) {
        this.onSentenceCallback(this.currentSentenceIndex);
      }
    }
  }
}

export const audioEngine = new AkashaAudioEngine();

