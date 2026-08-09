/**
 * Firebase — ავთენტიფიკაცია, Firestore, Storage (ხმოვანი ფაილები).
 *
 * ⚠ ეს კონფიგურაცია საჯაროა და ასეც უნდა იყოს — ვებ-აპლიკაციის Firebase კონფიგი
 *   საიდუმლო არ არის. ნამდვილი დაცვა ხდება Firestore/Storage Security Rules-ით
 *   (იხ. firestore.rules და storage.rules). apiKey-ს გაჟონვა თავისთავად რისკი არ არის,
 *   მაგრამ სუსტი წესები არის — ამიტომ წესები აუცილებლად უნდა განთავსდეს.
 */
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBSxtvdCH8rPO48f11HMbW6NQe1ZZ-z4lo',
  authDomain: 'testdrive-de93a.firebaseapp.com',
  projectId: 'testdrive-de93a',
  storageBucket: 'testdrive-de93a.firebasestorage.app',
  messagingSenderId: '691502195095',
  appId: '1:691502195095:web:bb8f220a2c0525305e64d2',
  measurementId: 'G-MSZ3WGTCS2',
};

export const app: FirebaseApp = initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

/** Analytics ცალკე იტვირთება — ბლოკერების დროს აპლიკაცია არ უნდა ჩავარდეს */
export async function initAnalytics(): Promise<void> {
  try {
    const { getAnalytics, isSupported } = await import('firebase/analytics');
    if (await isSupported()) getAnalytics(app);
  } catch {
    // Analytics არასავალდებულოა — ჩავარდნა იგნორირდება
  }
}

export const COLLECTIONS = {
  users: 'users',
  studentProfiles: 'studentProfiles',
  instructorProfiles: 'instructorProfiles',
  sessions: 'examSessions',
  routes: 'routeVersions',
  ruleSets: 'ruleSets',
  questions: 'technicalQuestions',
  audio: 'audioAssets',
  warnings: 'roadWarnings',
  consents: 'consents',
  lessonNotes: 'lessonNotes',
  audit: 'auditLogs',
} as const;
