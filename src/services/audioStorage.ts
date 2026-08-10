/**
 * ხმოვანი ფაილების მართვა — Firestore-ში, base64-ად.
 *
 * რატომ არა Firebase Storage: ის Blaze (ფასიან) გეგმას მოითხოვს.
 * რატომ არა Cloudinary: ცალკე ანგარიში, API-გასაღები და საჯაროდ
 * ბოროტად გამოსაყენებელი unsigned upload preset დასჭირდებოდა.
 *
 * ერთი ხმოვანი ფრაზა 2–3 წამია (~20–40 კბ). Firestore-ის დოკუმენტის
 * ლიმიტი 1 მბ-ია, ანუ თითო ფრაზა თავისუფლად ეტევა ცალკე დოკუმენტში.
 * base64 მოცულობას ~33%-ით ზრდის, ამიტომ ნედლი ლიმიტი 400 კბ-ია.
 */
import { doc, getDocs, collection, setDoc, deleteDoc } from 'firebase/firestore';
import { db, COLLECTIONS } from './firebase';
import type { AudioAsset } from '../types';

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/webm',
];

/** ნედლი ფაილის ლიმიტი — base64-ის შემდეგ ~533 კბ, დოკუმენტის 1 მბ-ში ეტევა */
export const MAX_AUDIO_BYTES = 400 * 1024;

export interface AudioUploadResult {
  url: string;
  durationSeconds?: number;
  sizeBytes: number;
}

export function validateAudioFile(file: File): string | null {
  const typeOk =
    ALLOWED_AUDIO_TYPES.includes(file.type) || /\.(mp3|m4a|wav|ogg|webm)$/i.test(file.name);
  if (!typeOk) {
    return 'დაშვებულია მხოლოდ ხმოვანი ფაილი (mp3, m4a, wav, ogg).';
  }
  if (file.size > MAX_AUDIO_BYTES) {
    const kb = Math.round(file.size / 1024);
    return `ფაილი ძალიან დიდია (${kb} კბ). მაქსიმუმი 400 კბ. შეამცირე ბიტრეიტი 64 kbps-მდე და გადაიყვანე mono — ერთი ფრაზისთვის სავსებით საკმარისია.`;
  }
  return null;
}

/** ხმის ხანგრძლივობა — ატვირთვამდე, ლოკალურად */
export function readDuration(file: File): Promise<number | undefined> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const el = new Audio();
    const done = (v?: number) => {
      URL.revokeObjectURL(url);
      resolve(v);
    };
    el.onloadedmetadata = () => done(Number.isFinite(el.duration) ? el.duration : undefined);
    el.onerror = () => done(undefined);
    el.src = url;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('ფაილის წაკითხვა ვერ მოხერხდა.'));
    reader.readAsDataURL(file);
  });
}

export async function uploadAudio(
  key: string,
  file: File,
  uploadedBy: string,
): Promise<AudioUploadResult> {
  const error = validateAudioFile(file);
  if (error) throw new Error(error);

  const dataUrl = await readAsDataUrl(file);
  const durationSeconds = await readDuration(file);

  try {
    // data: URI პირდაპირ url ველში — <audio src> მას ისევე უკრავს, როგორც ბმულს
    await setDoc(
      doc(db, COLLECTIONS.audio, key),
      {
        key,
        url: dataUrl,
        isCustomUploaded: true,
        uploadedAt: new Date().toISOString(),
        uploadedBy,
        sizeBytes: file.size,
        ...(durationSeconds ? { durationSeconds } : {}),
      },
      { merge: true },
    );
  } catch (err) {
    if ((err as { code?: string })?.code === 'permission-denied') {
      throw new Error(
        'ბაზამ ჩაწერა უარყო. საჭიროა: (1) ADMIN როლი და (2) firestore.rules-ის განახლებული ვერსია კონსოლში.',
      );
    }
    throw err;
  }

  return { url: dataUrl, sizeBytes: file.size, ...(durationSeconds ? { durationSeconds } : {}) };
}

export async function deleteAudio(key: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.audio, key));
}

/** ატვირთული ხმების რუკა: key → მეტამონაცემები */
export async function fetchUploadedAudio(): Promise<Record<string, Partial<AudioAsset>>> {
  const snap = await getDocs(collection(db, COLLECTIONS.audio));
  const map: Record<string, Partial<AudioAsset>> = {};
  snap.forEach((d) => {
    const data = d.data() as Partial<AudioAsset>;
    if (data.url) map[d.id] = data;
  });
  return map;
}

/** ნაგულისხმევ სიას ადებს ატვირთულ ფაილებს */
export function mergeAudioAssets(
  defaults: AudioAsset[],
  uploaded: Record<string, Partial<AudioAsset>>,
): AudioAsset[] {
  return defaults.map((a) => ({ ...a, ...(uploaded[a.key] ?? {}) }));
}
