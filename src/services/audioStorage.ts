/**
 * ხმოვანი ფაილების მართვა — ატვირთვა Firebase Storage-ში, მეტამონაცემები Firestore-ში.
 *
 * ადმინი თითოეულ ხმოვან key-ს ურთავს ჩაწერილ ფაილს.
 * აპლიკაცია ჯერ ეძებს ატვირთულ ფაილს; თუ არ არის — ბრაუზერის სინთეზურ ხმაზე გადადის.
 */
import { doc, getDocs, collection, setDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, COLLECTIONS } from './firebase';
import type { AudioAsset } from '../types';

/** დაშვებული ფორმატები — ბრაუზერების უმეტესობა ყველას უკრავს */
export const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm'];
export const MAX_AUDIO_BYTES = 5 * 1024 * 1024; // 5 მბ — ერთი ფრაზისთვის სავსებით საკმარისია

export interface AudioUploadResult {
  url: string;
  storagePath: string;
  durationSeconds?: number;
}

export function validateAudioFile(file: File): string | null {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return 'დაშვებულია მხოლოდ ხმოვანი ფაილი (mp3, m4a, wav, ogg).';
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return 'ფაილი ძალიან დიდია — მაქსიმუმი 5 მბ.';
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

export async function uploadAudio(
  key: string,
  file: File,
  uploadedBy: string,
): Promise<AudioUploadResult> {
  const error = validateAudioFile(file);
  if (error) throw new Error(error);

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'mp3';
  const storagePath = `audio/ka/${key}.${ext}`;
  const fileRef = ref(storage, storagePath);

  await uploadBytes(fileRef, file, { contentType: file.type });
  const url = await getDownloadURL(fileRef);
  const durationSeconds = await readDuration(file);

  await setDoc(
    doc(db, COLLECTIONS.audio, key),
    {
      key,
      url,
      storagePath,
      isCustomUploaded: true,
      uploadedAt: new Date().toISOString(),
      uploadedBy,
      ...(durationSeconds ? { durationSeconds } : {}),
    },
    { merge: true },
  );

  return { url, storagePath, ...(durationSeconds ? { durationSeconds } : {}) };
}

export async function deleteAudio(key: string, storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // ფაილი შესაძლოა უკვე წაშლილია — მეტამონაცემი მაინც უნდა გაიწმინდოს
  }
  await deleteDoc(doc(db, COLLECTIONS.audio, key));
}

/** ატვირთული ხმების რუკა: key → მეტამონაცემები */
export async function fetchUploadedAudio(): Promise<Record<string, Partial<AudioAsset>>> {
  const snap = await getDocs(collection(db, COLLECTIONS.audio));
  const map: Record<string, Partial<AudioAsset>> = {};
  snap.forEach((d) => {
    map[d.id] = d.data() as Partial<AudioAsset>;
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
