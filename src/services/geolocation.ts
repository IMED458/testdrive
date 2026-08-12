/**
 * რეალური GPS — browser Geolocation API.
 *
 * ადრე პროექტში navigator.geolocation საერთოდ არ გამოიყენებოდა:
 * მდებარეობა ყალბად „მოძრაობდა" მარშრუტის წერტილებზე ყოველ 3 წამში.
 * აქ არის ერთადერთი ადგილი, სადაც მოწყობილობის მდებარეობა იკითხება.
 *
 * პრინციპები:
 * — პირველივე უხარისხო წერტილი არ ითვლება საბოლოოდ; სისტემა უკეთესს ელოდება
 * — accuracy ყოველთვის თან ახლავს კოორდინატს და გადაწყვეტილებებში მონაწილეობს
 * — ერთი watch ერთ დროს; გამოწერის გაუქმებისას clearWatch აუცილებელია
 */
import type { Coordinates } from '../types';
import { calculateDistanceMeters } from '../engine/GeoEngine';

export type GeoPermissionState = 'UNKNOWN' | 'PROMPT' | 'GRANTED' | 'DENIED' | 'UNSUPPORTED';

export type GeoStatus =
  | 'IDLE'
  | 'REQUESTING_PERMISSION'
  | 'ACQUIRING'
  | 'IMPROVING'
  | 'READY'
  | 'DENIED'
  | 'UNAVAILABLE'
  | 'TIMEOUT';

export interface GeoFix {
  coords: Coordinates;
  accuracy: number;
  /** მოწყობილობის სიჩქარე მ/წმ (თუ აქვს) */
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface GeoState {
  status: GeoStatus;
  permission: GeoPermissionState;
  fix: GeoFix | null;
  /** ბოლო ნედლი წერტილი — გაფილტვრამდე, დიაგნოსტიკისთვის */
  rawFix: GeoFix | null;
  errorMessage: string | null;
  /** რამდენი წერტილი მივიღეთ ამ სესიაზე */
  readingCount: number;
}

/** ამაზე უარესი სიზუსტე გადაწყვეტილებისთვის გამოუსადეგარია */
export const ACCURACY_UNUSABLE_M = 200;
/** ამაზე უკეთესი სიზუსტე საკმარისია „მზადაა" სტატუსისთვის */
export const ACCURACY_GOOD_M = 30;

const KA_ERRORS: Record<number, string> = {
  1: 'მდებარეობაზე წვდომა აკრძალულია. ჩართე ლოკაცია ბრაუზერისა და მოწყობილობის პარამეტრებში.',
  2: 'მდებარეობა მიუწვდომელია. შეამოწმე, ჩართულია თუ არა GPS.',
  3: 'მდებარეობის განსაზღვრა დაგვიანდა. გადადი ღია ცის ქვეშ და სცადე ხელახლა.',
};

function statusFromError(code: number): GeoStatus {
  if (code === 1) return 'DENIED';
  if (code === 3) return 'TIMEOUT';
  return 'UNAVAILABLE';
}

/**
 * მდებარეობის სერვისი — ერთი გლობალური ეგზემპლარი.
 * რამდენიმე კომპონენტს შეუძლია გამოწერა; watchPosition მაინც ერთია.
 */
class GeolocationService {
  private state: GeoState = {
    status: 'IDLE',
    permission: 'UNKNOWN',
    fix: null,
    rawFix: null,
    errorMessage: null,
    readingCount: 0,
  };

  private watchId: number | null = null;
  private listeners = new Set<(s: GeoState) => void>();
  /** ბოლო წერტილები — გასაშუალოებისა და jitter-ის ჩასახშობად */
  private recent: GeoFix[] = [];

  get snapshot(): GeoState {
    return this.state;
  }

  isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'geolocation' in navigator;
  }

  /** უსაფრთხო კონტექსტი — HTTPS ან localhost; სხვაგან Geolocation არ მუშაობს */
  isSecureContext(): boolean {
    if (typeof window === 'undefined') return false;
    return window.isSecureContext === true;
  }

  subscribe(cb: (s: GeoState) => void): () => void {
    this.listeners.add(cb);
    cb(this.state);
    return () => {
      this.listeners.delete(cb);
      // ბოლო გამომწერის გასვლისას თვალყური ჩერდება — ბატარეა არ იხარჯება
      if (this.listeners.size === 0) this.stop();
    };
  }

  private emit(patch: Partial<GeoState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l(this.state));
  }

  /** ნებართვის მდგომარეობა კითხვის გარეშე (სადაც ბრაუზერი აძლევს) */
  async queryPermission(): Promise<GeoPermissionState> {
    if (!this.isSupported()) {
      this.emit({ permission: 'UNSUPPORTED', status: 'UNAVAILABLE' });
      return 'UNSUPPORTED';
    }
    try {
      const perms = (navigator as Navigator & { permissions?: Permissions }).permissions;
      if (!perms?.query) return 'UNKNOWN';
      const res = await perms.query({ name: 'geolocation' as PermissionName });
      const map: Record<PermissionState, GeoPermissionState> = {
        granted: 'GRANTED',
        denied: 'DENIED',
        prompt: 'PROMPT',
      };
      const value = map[res.state];
      this.emit({ permission: value });
      // ნებართვის ცვლილება პარამეტრებში — მდგომარეობა უნდა განახლდეს
      res.onchange = () => this.emit({ permission: map[res.state] });
      return value;
    } catch {
      return 'UNKNOWN';
    }
  }

  /**
   * უწყვეტი თვალყური. ორჯერ გამოძახება ახალ watch-ს არ ქმნის.
   * enableHighAccuracy: true — გამოცდაზე ზუსტი მდებარეობა კრიტიკულია.
   */
  start(): void {
    if (this.watchId !== null) return;

    if (!this.isSupported()) {
      this.emit({
        status: 'UNAVAILABLE',
        permission: 'UNSUPPORTED',
        errorMessage: 'ბრაუზერი მდებარეობის განსაზღვრას არ უჭერს მხარს.',
      });
      return;
    }

    if (!this.isSecureContext()) {
      this.emit({
        status: 'UNAVAILABLE',
        errorMessage:
          'მდებარეობა მხოლოდ დაცულ კავშირზე (HTTPS) მუშაობს. გახსენი საიტი https-ით.',
      });
      return;
    }

    this.emit({ status: 'REQUESTING_PERMISSION', errorMessage: null });

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.onPosition(pos),
      (err) => this.onError(err),
      {
        enableHighAccuracy: true,
        // maximumAge: 0 — ქეშირებული ძველი წერტილი მოძრაობისას მავნეა
        maximumAge: 0,
        timeout: 20000,
      },
    );
  }

  stop(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.recent = [];
    // ძველი წერტილი უნდა წაიშალოს — თორემ ხელახლა ჩართვისას მოძველებული
    // მდებარეობა მიმდინარედ გამოჩნდებოდა და ფილტრსაც ამახინჯებდა
    this.emit({ status: 'IDLE', fix: null, rawFix: null, readingCount: 0 });
  }

  /** ერთჯერადი წერტილი — მზადყოფნის შემოწმებისთვის */
  getOnce(timeoutMs = 15000): Promise<GeoFix> {
    return new Promise((resolve, reject) => {
      if (!this.isSupported()) {
        reject(new Error('ბრაუზერი მდებარეობის განსაზღვრას არ უჭერს მხარს.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const fix = toFix(pos);
          this.emit({ permission: 'GRANTED', rawFix: fix });
          resolve(fix);
        },
        (err) => {
          this.onError(err);
          reject(new Error(KA_ERRORS[err.code] ?? 'მდებარეობა ვერ განისაზღვრა.'));
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: timeoutMs },
      );
    });
  }

  private onError(err: GeolocationPositionError): void {
    this.emit({
      status: statusFromError(err.code),
      permission: err.code === 1 ? 'DENIED' : this.state.permission,
      errorMessage: KA_ERRORS[err.code] ?? 'მდებარეობა ვერ განისაზღვრა.',
    });
  }

  private onPosition(pos: GeolocationPosition): void {
    const fix = toFix(pos);
    const filtered = this.filter(fix);

    this.emit({
      permission: 'GRANTED',
      errorMessage: null,
      rawFix: fix,
      fix: filtered,
      readingCount: this.state.readingCount + 1,
      status:
        filtered.accuracy <= ACCURACY_GOOD_M
          ? 'READY'
          : filtered.accuracy <= ACCURACY_UNUSABLE_M
            ? 'IMPROVING'
            : 'ACQUIRING',
    });
  }

  /**
   * გაფილტვრა — jitter-ის ჩახშობა რეალური მოძრაობის დაკარგვის გარეშე.
   *
   * 1. აშკარად უხარისხო წერტილი (>200 მ) იგნორირდება, თუ უკეთესი ახალი გვაქვს.
   * 2. თუ ახალი წერტილი წინაზე მნიშვნელოვნად უარესია და ახლოსაა — ძველი რჩება.
   * 3. მცირე მერყეობა (ცდომილების ფარგლებში) სიზუსტით შეწონილი საშუალოთი იშლება.
   * 4. რეალური გადაადგილება (მანძილი > ცდომილება) მაშინვე გადმოეცემა.
   */
  private filter(fix: GeoFix): GeoFix {
    const prev = this.state.fix;

    // ისტორია — მხოლოდ ბოლო 5 წერტილი და მხოლოდ 15 წამის სიღრმეზე
    this.recent.push(fix);
    this.recent = this.recent.filter((f) => fix.timestamp - f.timestamp <= 15000).slice(-5);

    if (!prev) return fix;

    const moved = calculateDistanceMeters(prev.coords, fix.coords);

    // მოწყობილობის საკუთარი სიჩქარე — ყველაზე საიმედო ნიშანი, როცა ხელმისაწვდომია
    if (fix.speed !== null && fix.speed > 1.5) return fix;

    // აშკარა გადაადგილება — ცდომილებაზე მნიშვნელოვნად დიდი ნახტომი
    if (moved > Math.max(fix.accuracy, prev.accuracy) * 1.5) return fix;

    // ახალი წერტილი საგრძნობლად უარესია და ადგილზე ვდგავართ — ძველს ვინარჩუნებთ
    if (fix.accuracy > prev.accuracy * 2 && fix.accuracy > ACCURACY_GOOD_M) {
      return prev;
    }

    const usable = this.recent.filter((f) => f.accuracy <= ACCURACY_UNUSABLE_M);
    if (usable.length < 3) return fix;

    /*
     * ხეტიალი თუ მგზავრობა?
     * წერტილები რომ ერთ ადგილას მერყეობს, ჯამური გავლილი გზა დიდია,
     * საწყისიდან საბოლოო წერტილამდე მანძილი კი მცირე. სწორედ ეს განასხვავებს
     * GPS-ის ხმაურს რეალური მოძრაობისგან, რომელშიც ორივე თითქმის ტოლია.
     * გლუვდება მხოლოდ ხეტიალი — მოძრაობა დაუყოვნებლივ გადმოეცემა.
     */
    let pathLength = 0;
    for (let i = 1; i < usable.length; i++) {
      pathLength += calculateDistanceMeters(usable[i - 1]!.coords, usable[i]!.coords);
    }
    const netDisplacement = calculateDistanceMeters(usable[0]!.coords, fix.coords);
    const isWandering = pathLength > 0 && netDisplacement < pathLength * 0.5;
    if (!isWandering) return fix;

    let wSum = 0;
    let lat = 0;
    let lng = 0;
    for (const f of usable) {
      const w = 1 / Math.max(f.accuracy, 1);
      wSum += w;
      lat += f.coords.lat * w;
      lng += f.coords.lng * w;
    }

    return {
      ...fix,
      coords: { lat: lat / wSum, lng: lng / wSum },
      // საშუალოს ცდომილება საუკეთესოზე უარესი არ არის
      accuracy: Math.min(...usable.map((f) => f.accuracy)),
    };
  }
}

function toFix(pos: GeolocationPosition): GeoFix {
  return {
    coords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
    accuracy: pos.coords.accuracy,
    speed: pos.coords.speed,
    heading: pos.coords.heading,
    timestamp: pos.timestamp,
  };
}

export const Geo = new GeolocationService();

/** ქართული აღწერა სტატუსისთვის — ინტერფეისში ერთნაირად გამოსაჩენად */
export function describeGeoStatus(s: GeoState): string {
  switch (s.status) {
    case 'IDLE':
      return 'მდებარეობა გამორთულია';
    case 'REQUESTING_PERMISSION':
      return 'ველოდებით ნებართვას…';
    case 'ACQUIRING':
      return 'მდებარეობის განსაზღვრა…';
    case 'IMPROVING':
      return 'ვეძებთ უფრო ზუსტ მდებარეობას…';
    case 'READY':
      return `მდებარეობა ზუსტია (±${Math.round(s.fix?.accuracy ?? 0)} მ)`;
    case 'DENIED':
    case 'UNAVAILABLE':
    case 'TIMEOUT':
      return s.errorMessage ?? 'მდებარეობა მიუწვდომელია';
  }
}
