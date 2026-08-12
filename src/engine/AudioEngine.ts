import { DEFAULT_AUDIO_ASSETS } from '../data/initialData';
import { AudioAsset } from '../types';

/**
 * AudioEngine — ქართული ხმოვანი მითითებები.
 *
 * გასწორებული პრობლემები:
 * — autoplay policy: ბრაუზერი ხმას ბლოკავს მომხმარებლის პირველ ჟესტამდე.
 *   ახლა პირველივე click/touch/keydown-ზე ხდება unlock (AudioContext.resume +
 *   უხმო ელემენტის დაკვრა), შემდეგ ხმა თავისუფლად ირთვება.
 * — playBeep ყოველ გამოძახებაზე ახალ AudioContext-ს ქმნიდა (გაჟონვა და
 *   ბრაუზერის ლიმიტის ამოწურვა); ახლა ერთი საერთო კონტექსტია.
 * — ერთი და იგივე ხმა ზედიზედ ორჯერ არ ისმის (dedupe ფანჯარა).
 * — TTS-ის ხმების სია ასინქრონულად იტვირთება — გათვალისწინებულია.
 * — mute/volume ინახება და გვერდის გადატვირთვის შემდეგ აღდგება.
 */

const PREFS_KEY = 'driving_sim_audio_prefs';
/** ამ ფანჯარაში იმავე ხმის განმეორება იგნორირდება (ms) */
const DEDUPE_WINDOW_MS = 1200;

interface AudioPrefs {
  muted: boolean;
  volume: number;
}

function loadPrefs(): AudioPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<AudioPrefs>;
      return {
        muted: typeof p.muted === 'boolean' ? p.muted : false,
        volume: typeof p.volume === 'number' ? Math.max(0, Math.min(1, p.volume)) : 1,
      };
    }
  } catch {
    // დაზიანებული პარამეტრები — ნაგულისხმევზე გადავდივართ
  }
  return { muted: false, volume: 1 };
}

class AudioEngineManager {
  private prefs: AudioPrefs = loadPrefs();
  private audioCache: Map<string, AudioAsset> = new Map();
  private preloadedFiles: Map<string, HTMLAudioElement> = new Map();

  private currentAudio: HTMLAudioElement | null = null;
  private lastSpokenKey: string | null = null;
  private lastSpokenText: string | null = null;

  /** dedupe: key → ბოლო დაკვრის დრო */
  private lastPlayedAt: Map<string, number> = new Map();

  private ctx: AudioContext | null = null;
  private unlocked = false;
  private unlockBound = false;

  constructor() {
    DEFAULT_AUDIO_ASSETS.forEach((a) => this.audioCache.set(a.key, a));
  }

  /* ─────────────── autoplay unlock ─────────────── */

  /**
   * პირველივე მომხმარებლის ჟესტზე ხმის სისტემის გახსნა.
   * აპლიკაციის ჩატვირთვისთანავე უნდა გამოიძახოს (main.tsx).
   */
  public installUnlockHandlers(): void {
    if (this.unlockBound || typeof window === 'undefined') return;
    this.unlockBound = true;

    const unlock = () => {
      void this.unlock();
    };

    // passive — გვერდის სქროლს არ აფერხებს
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock);

    // ტაბიდან დაბრუნებისას iOS/Android კონტექსტს აჩერებს — ხელახლა ვხსნით
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.unlocked) {
        void this.ctx?.resume().catch(() => undefined);
      }
    });
  }

  /** ხმის სისტემის გახსნა — უსაფრთხოა მრავალჯერ გამოძახება */
  public async unlock(): Promise<boolean> {
    try {
      const Ctor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor && !this.ctx) this.ctx = new Ctor();
      if (this.ctx?.state === 'suspended') await this.ctx.resume();

      // iOS Safari-ს სჭირდება რეალური დაკვრა ჟესტის შიგნით
      if (!this.unlocked) {
        const silent = new Audio(
          'data:audio/mp4;base64,AAAAHGZ0eXBNNEEgAAAAAE00QSBtcDQyaXNvbQAAAAhmcmVl',
        );
        silent.volume = 0;
        await silent.play().catch(() => undefined);
        silent.pause();
      }

      this.unlocked = true;
      return true;
    } catch {
      return false;
    }
  }

  public isUnlocked(): boolean {
    return this.unlocked;
  }

  /* ─────────────── ატვირთული ხმები ─────────────── */

  /** ადმინში ატვირთული ჩანაწერების მიბმა — ჩაწერილი ხმა სინთეზურზე უპირატესია */
  public applyUploadedAssets(assets: AudioAsset[]): void {
    assets.forEach((a) => {
      this.audioCache.set(a.key, a);
      if (a.url) {
        const existing = this.preloadedFiles.get(a.key);
        if (existing?.src === a.url) return;
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

  public recordedCount(): number {
    return this.preloadedFiles.size;
  }

  /** მარშრუტის ხმების წინასწარი ჩატვირთვა — გზაჯვარედინზე დაყოვნება დაუშვებელია */
  public preloadRouteAudio(audioKeys: string[]): void {
    audioKeys.forEach((key) => {
      const asset = this.audioCache.get(key);
      if (!asset) {
        // გატეხილი გასაღები დუმილში არ უნდა დაიკარგოს
        console.warn('[AudioEngine] უცნობი ხმოვანი გასაღები:', key);
        return;
      }
      if (asset.url && !this.preloadedFiles.has(key)) {
        const el = new Audio(asset.url);
        el.preload = 'auto';
        this.preloadedFiles.set(key, el);
      }
    });
  }

  /* ─────────────── პარამეტრები ─────────────── */

  public setMuted(muted: boolean): void {
    this.prefs.muted = muted;
    this.persist();
    if (muted) this.stop();
  }

  public getIsMuted(): boolean {
    return this.prefs.muted;
  }

  public setVolume(vol: number): void {
    this.prefs.volume = Math.max(0, Math.min(1, vol));
    if (this.currentAudio) this.currentAudio.volume = this.prefs.volume;
    this.persist();
  }

  public getVolume(): number {
    return this.prefs.volume;
  }

  private persist(): void {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(this.prefs));
    } catch {
      // კვოტა — პარამეტრი სესიაზე მაინც მოქმედებს
    }
  }

  /* ─────────────── დაკვრა ─────────────── */

  public stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * ხმოვანი მითითების დაკვრა key-ით ან პირდაპირი ტექსტით.
   * @param options.force — dedupe-ის გვერდის ავლა (მაგ. „გამეორება" ღილაკი)
   */
  public playInstruction(
    audioKeyOrText: string,
    options: { force?: boolean } = {},
  ): Promise<void> {
    if (this.prefs.muted) return Promise.resolve();

    // ერთი და იგივე ხმა ზედიზედ — მაგ. GPS-ის ხშირი განახლებისას
    const now = Date.now();
    const last = this.lastPlayedAt.get(audioKeyOrText) ?? 0;
    if (!options.force && now - last < DEDUPE_WINDOW_MS) return Promise.resolve();
    this.lastPlayedAt.set(audioKeyOrText, now);

    const asset = this.audioCache.get(audioKeyOrText);
    const textToSpeak = asset ? asset.textKa : audioKeyOrText;

    if (!asset && /^[A-Z0-9_]+$/.test(audioKeyOrText)) {
      // გატეხილი გასაღები — TTS-ს „TURN_LEFT" წაეკითხებოდა
      console.warn('[AudioEngine] გასაღები ვერ მოიძებნა, დუმილი:', audioKeyOrText);
      return Promise.resolve();
    }

    this.lastSpokenKey = asset ? audioKeyOrText : null;
    this.lastSpokenText = textToSpeak;

    return new Promise((resolve) => {
      const recorded = this.preloadedFiles.get(audioKeyOrText);
      if (recorded) {
        this.stop();
        const el = recorded.cloneNode(true) as HTMLAudioElement;
        el.volume = this.prefs.volume;
        this.currentAudio = el;

        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          if (this.currentAudio === el) this.currentAudio = null;
          resolve();
        };

        el.onended = done;
        el.onerror = () => {
          // ჩანაწერი ვერ დაიკრა — გამოცდა არ უნდა შეწყდეს
          if (settled) return;
          settled = true;
          this.speakFallback(textToSpeak, resolve);
        };

        void el.play().catch(() => {
          if (settled) return;
          settled = true;
          this.speakFallback(textToSpeak, resolve);
        });
        return;
      }

      this.speakFallback(textToSpeak, resolve);
    });
  }

  /** სათადარიგო გზა — ბრაუზერის სინთეზური ხმა */
  private speakFallback(text: string, resolve: () => void): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'ka-GE';
    utter.volume = this.prefs.volume;
    utter.rate = 0.95;

    // ხმების სია ასინქრონულია — პირველ გამოძახებაზე ცარიელი შეიძლება იყოს
    const voices = window.speechSynthesis.getVoices();
    const kaVoice = voices.find((v) => v.lang.toLowerCase().startsWith('ka'));
    if (kaVoice) utter.voice = kaVoice;

    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    utter.onend = done;
    utter.onerror = done;

    // ზოგ ბრაუზერში onend არ ისვრება — დამცავი ტაიმერი
    const guardMs = Math.max(3000, text.length * 120);
    setTimeout(done, guardMs);

    window.speechSynthesis.speak(utter);
  }

  /** ბოლო მითითების გამეორება — dedupe-ს გვერდს უვლის */
  public replayLastInstruction(): void {
    if (this.lastSpokenKey) {
      void this.playInstruction(this.lastSpokenKey, { force: true });
    } else if (this.lastSpokenText) {
      void this.playInstruction(this.lastSpokenText, { force: true });
    }
  }

  /** მოკლე სიგნალი — ერთი საერთო AudioContext, ახალი ეგზემპლარების გარეშე */
  public playBeep(type: 'CHECKPOINT' | 'ERROR' | 'PASS'): void {
    if (this.prefs.muted || !this.ctx) return;

    try {
      if (this.ctx.state === 'suspended') void this.ctx.resume();

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type === 'ERROR' ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(
        type === 'ERROR' ? 220 : type === 'PASS' ? 880 : 587,
        this.ctx.currentTime,
      );

      gain.gain.setValueAtTime(0.15 * this.prefs.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
      // კვანძების გათავისუფლება — გაჟონვის თავიდან ასაცილებლად
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch {
      // Web Audio მიუწვდომელია — სიგნალი არასავალდებულოა
    }
  }
}

export const AudioEngine = new AudioEngineManager();
