import { DEFAULT_AUDIO_ASSETS } from '../data/initialData';
import { AudioAsset } from '../types';

/**
 * AudioEngine - Embedded Georgian voice instructions & audio playback
 */

class AudioEngineManager {
  private isMuted = false;
  private volume = 1.0;
  private audioCache: Map<string, AudioAsset> = new Map();
  private lastSpokenKey: string | null = null;
  private lastSpokenText: string | null = null;
  /** ატვირთული ფაილები — key → HTMLAudioElement, წინასწარ ჩატვირთული */
  private preloadedFiles: Map<string, HTMLAudioElement> = new Map();
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.initDefaultAssets();
  }

  private initDefaultAssets() {
    DEFAULT_AUDIO_ASSETS.forEach((asset) => {
      this.audioCache.set(asset.key, asset);
    });
  }

  /**
   * ადმინში ატვირთული ხმების მიბმა.
   * ჩაწერილი ქართული ხმა ყოველთვის უპირატესია სინთეზურთან შედარებით.
   */
  public applyUploadedAssets(assets: AudioAsset[]) {
    assets.forEach((a) => {
      this.audioCache.set(a.key, a);
      if (a.url) {
        const el = new Audio(a.url);
        el.preload = 'auto';
        this.preloadedFiles.set(a.key, el);
      } else {
        this.preloadedFiles.delete(a.key);
      }
    });
  }

  public hasRecordedVoice(key: string): boolean {
    return this.preloadedFiles.has(key);
  }

  /** რამდენ ფრაზას აქვს ჩაწერილი ხმა — ადმინის ინდიკატორისთვის */
  public recordedCount(): number {
    return this.preloadedFiles.size;
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Preloads all required audio assets for a route to prevent latency on intersections
   */
  public preloadRouteAudio(audioKeys: string[]) {
    audioKeys.forEach((key) => {
      if (!this.audioCache.has(key)) {
        const found = DEFAULT_AUDIO_ASSETS.find((a) => a.key === key);
        if (found) {
          this.audioCache.set(key, found);
        }
      }
      // ატვირთული ფაილი წინასწარ ჩაიტვირთოს — გზაჯვარედინზე დაყოვნება დაუშვებელია
      const cached = this.audioCache.get(key);
      if (cached?.url && !this.preloadedFiles.has(key)) {
        const el = new Audio(cached.url);
        el.preload = 'auto';
        this.preloadedFiles.set(key, el);
      }
    });
  }

  /**
   * Speaks or plays Georgian voice instruction by key or custom text
   */
  public playInstruction(audioKeyOrText: string): Promise<void> {
    if (this.isMuted) return Promise.resolve();

    return new Promise((resolve) => {
      let textToSpeak = audioKeyOrText;

      const asset = this.audioCache.get(audioKeyOrText);
      if (asset) {
        textToSpeak = asset.textKa;
      }

      this.lastSpokenKey = this.audioCache.has(audioKeyOrText) ? audioKeyOrText : null;
      this.lastSpokenText = textToSpeak;

      // 1) ჩაწერილი ქართული ხმა — მთავარი გზა
      const recorded = this.preloadedFiles.get(audioKeyOrText);
      if (recorded) {
        this.stop();
        const el = recorded.cloneNode(true) as HTMLAudioElement;
        el.volume = this.volume;
        this.currentAudio = el;
        el.onended = () => resolve();
        el.onerror = () => {
          // ფაილი ვერ დაიკრა — გადავდივართ სინთეზურ ხმაზე, გამოცდა არ უნდა შეწყდეს
          this.speakFallback(textToSpeak, resolve);
        };
        void el.play().catch(() => this.speakFallback(textToSpeak, resolve));
        return;
      }

      // 2) სათადარიგო: ბრაუზერის სინთეზური ხმა
      this.speakFallback(textToSpeak, resolve);
    });
  }

  private speakFallback(textToSpeak: string, resolve: () => void) {
    {
      // Web Speech API fallback for Georgian speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop prior audio

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = 'ka-GE';
        utterance.volume = this.volume;
        utterance.rate = 0.95; // Clear, calm rate

        // Find Georgian voice if available
        const voices = window.speechSynthesis.getVoices();
        const kaVoice = voices.find((v) => v.lang.startsWith('ka'));
        if (kaVoice) {
          utterance.voice = kaVoice;
        }

        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();

        window.speechSynthesis.speak(utterance);
      } else {
        console.log('[AudioEngine] Play instruction:', textToSpeak);
        resolve();
      }
    }
  }

  /**
   * Replays the last spoken voice instruction
   */
  public replayLastInstruction() {
    if (this.lastSpokenKey) {
      void this.playInstruction(this.lastSpokenKey);
    } else if (this.lastSpokenText) {
      void this.playInstruction(this.lastSpokenText);
    }
  }

  /**
   * Play simple beep audio signal for error or checkpoint
   */
  public playBeep(type: 'CHECKPOINT' | 'ERROR' | 'PASS') {
    if (this.isMuted) return;

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type === 'ERROR' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(
        type === 'ERROR' ? 220 : type === 'PASS' ? 880 : 587,
        audioCtx.currentTime
      );

      gain.gain.setValueAtTime(0.15 * this.volume, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Ignore if web audio context restricted
    }
  }
}

export const AudioEngine = new AudioEngineManager();
