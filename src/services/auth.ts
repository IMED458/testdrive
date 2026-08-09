/**
 * Firebase Authentication — რეალური ანგარიშები.
 *
 * როლი ინახება Firestore-ის `users` დოკუმენტში და არა კლიენტში.
 * რეგისტრაციისას როლი ყოველთვის STUDENT ან INSTRUCTOR — ADMIN-ს
 * ხელით ანიჭებს არსებული ადმინი (იხ. firestore.rules).
 */
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db as firestore, COLLECTIONS } from './firebase';
import { clearUserScopedCache, hydrate } from './cloudStore';
import type { DrivingCategory, TransmissionType, User, UserRole } from '../types';

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  preferredCity: string;
  category: DrivingCategory;
  transmission: TransmissionType;
  role: 'STUDENT' | 'INSTRUCTOR';
}

/** Firebase-ის შეცდომები ქართულად — კოდები მომხმარებელს არ უნდა ენახოს */
export function translateAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/invalid-email': 'ელ. ფოსტის ფორმატი არასწორია.',
    'auth/user-not-found': 'ამ ელ. ფოსტით ანგარიში ვერ მოიძებნა.',
    'auth/wrong-password': 'პაროლი არასწორია.',
    'auth/invalid-credential': 'ელ. ფოსტა ან პაროლი არასწორია.',
    'auth/email-already-in-use': 'ამ ელ. ფოსტით ანგარიში უკვე არსებობს.',
    'auth/weak-password': 'პაროლი სუსტია — მინიმუმ 6 სიმბოლო.',
    'auth/too-many-requests': 'ბევრი მცდელობა. სცადე ცოტა ხანში.',
    'auth/network-request-failed': 'ქსელთან კავშირი ვერ დამყარდა.',
    'auth/operation-not-allowed':
      'ელ. ფოსტით შესვლა Firebase-ში ჩართული არ არის (Authentication → Sign-in method).',
    // ეს კოდი ჩნდება, როცა Authentication საერთოდ არ არის ჩართული პროექტში
    'auth/configuration-not-found':
      'Firebase Authentication ჯერ არ არის ჩართული. კონსოლში: Authentication → Get started → Email/Password → Enable.',
  };
  return map[code] ?? 'დაფიქსირდა შეცდომა. სცადე ხელახლა.';
}

export async function registerUser(input: RegisterInput): Promise<User> {
  const cred = await createUserWithEmailAndPassword(
    auth,
    input.email.trim(),
    input.password,
  );

  await updateProfile(cred.user, {
    displayName: `${input.firstName} ${input.lastName}`.trim(),
  });

  const profile: User = {
    id: cred.user.uid,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: input.email.trim(),
    phone: input.phone?.trim() || undefined,
    role: input.role,
    preferredCity: input.preferredCity,
    category: input.category,
    transmission: input.transmission,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(firestore, COLLECTIONS.users, cred.user.uid), profile);
  await hydrate(cred.user.uid);
  return profile;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await fetchUserProfile(cred.user);
  await hydrate(cred.user.uid);
  return profile;
}

export async function logoutUser(): Promise<void> {
  clearUserScopedCache();
  await signOut(auth);
}

/**
 * Firestore-ის პროფილი; თუ არ არსებობს (მაგ. ანგარიში კონსოლიდან შეიქმნა),
 * იქმნება მინიმალური ჩანაწერი STUDENT როლით.
 */
async function fetchUserProfile(fbUser: FirebaseUser): Promise<User> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.users, fbUser.uid));
  if (snap.exists()) return snap.data() as User;

  const [first = '', last = ''] = (fbUser.displayName ?? '').split(' ');
  const fallback: User = {
    id: fbUser.uid,
    firstName: first || 'მომხმარებელი',
    lastName: last,
    email: fbUser.email ?? '',
    role: 'STUDENT',
    preferredCity: 'Telavi',
    category: 'B',
    transmission: 'MANUAL',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(firestore, COLLECTIONS.users, fbUser.uid), fallback);
  return fallback;
}

/** ავტორიზაციის მდგომარეობის თვალყური — გვერდის გადატვირთვისას სესია რჩება */
export function watchAuth(cb: (user: User | null, role: UserRole | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      cb(null, null);
      return;
    }
    try {
      const profile = await fetchUserProfile(fbUser);
      await hydrate(fbUser.uid);
      cb(profile, profile.role);
    } catch {
      cb(null, null);
    }
  });
}
