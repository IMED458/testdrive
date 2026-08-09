/**
 * Firebase Authentication — რეალური ანგარიშები.
 *
 * როლი ინახება Firestore-ის `users` დოკუმენტში და არა კლიენტში.
 * რეგისტრაციისას როლი ყოველთვის STUDENT ან INSTRUCTOR — ADMIN-ს
 * ხელით ანიჭებს არსებული ადმინი (იხ. firestore.rules).
 */
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db as firestore, COLLECTIONS } from './firebase';
import { clearUserScopedCache, hydrate } from './cloudStore';
import { isBootstrapAdminEmail } from '../config/admins';
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
    'auth/popup-closed-by-user': 'შესვლის ფანჯარა დაიხურა. სცადე ხელახლა.',
    'auth/cancelled-popup-request': 'შესვლის ფანჯარა გაუქმდა. სცადე ხელახლა.',
    'auth/popup-blocked': 'ბრაუზერმა ფანჯარა დაბლოკა — გადამისამართებით ვცდილობთ.',
    'auth/unauthorized-domain':
      'ეს დომენი Firebase-ში ნებადართული არ არის (Authentication → Settings → Authorized domains).',
    'auth/account-exists-with-different-credential':
      'ამ ელ. ფოსტით ანგარიში სხვა მეთოდით არსებობს. შედი ელ. ფოსტითა და პაროლით.',
    // ავთენტიფიკაცია გაიარა, მაგრამ Firestore-მა ჩაწერა აკრძალა
    'permission-denied':
      'ბაზაში ჩაწერა აკრძალულია. საჭიროა უსაფრთხოების წესების განთავსება: firebase deploy --only firestore:rules,storage',
  };
  return map[code] ?? 'დაფიქსირდა შეცდომა. სცადე ხელახლა.';
}

/** Google-ით შესვლის შედეგი: ან მზა პროფილი, ან პროფილის შევსების მოთხოვნა */
export type GoogleSignInResult =
  | { status: 'EXISTING'; user: User }
  | {
      status: 'NEEDS_PROFILE';
      prefill: { firstName: string; lastName: string; email: string; phone?: string };
    };

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
    // საწყისი ადმინის ფოსტა ავტომატურად ADMIN-ია (იხ. config/admins.ts)
    role: isBootstrapAdminEmail(input.email) ? 'ADMIN' : input.role,
    preferredCity: input.preferredCity,
    category: input.category,
    transmission: input.transmission,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(firestore, COLLECTIONS.users, cred.user.uid), profile);
  await hydrate(cred.user.uid);
  return profile;
}

/**
 * ელ. ფოსტით შესვლა.
 *
 * პროფილი შეიძლება არ არსებობდეს (მაგ. ანგარიში კონსოლიდან შეიქმნა, ან
 * რეგისტრაციისას Firestore-ში ჩაწერა ჩავარდა) — ასეთ შემთხვევაში
 * ბრუნდება NEEDS_PROFILE და მომხმარებელი პროფილს ავსებს.
 */
export async function loginUser(email: string, password: string): Promise<GoogleSignInResult> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
  const profile = await fetchUserProfile(cred.user);

  if (!profile) {
    const [first = '', ...rest] = (cred.user.displayName ?? '').split(' ');
    return {
      status: 'NEEDS_PROFILE',
      prefill: {
        firstName: first,
        lastName: rest.join(' '),
        email: cred.user.email ?? '',
        phone: cred.user.phoneNumber ?? undefined,
      },
    };
  }

  await hydrate(cred.user.uid);
  return { status: 'EXISTING', user: profile };
}

/**
 * Google-ით შესვლა.
 *
 * პირველ ჯერზე პროფილი ავტომატურად არ იქმნება — მომხმარებელს ჯერ
 * მოეთხოვება როლი, ქალაქი, კატეგორია და ტრანსმისია (completeGoogleProfile).
 * მეორე შესვლაზე არსებული პროფილი ბრუნდება და კითხვები აღარ ისმება.
 */
export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let cred;
  try {
    cred = await signInWithPopup(auth, provider);
  } catch (err) {
    const code = (err as { code?: string })?.code ?? '';
    // ზოგი ბრაუზერი popup-ს ბლოკავს — გადამისამართება სათადარიგო გზაა
    if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, provider);
      throw err;
    }
    throw err;
  }

  const snap = await getDoc(doc(firestore, COLLECTIONS.users, cred.user.uid));
  if (snap.exists()) {
    // მეორე და შემდეგი შესვლა — პროფილი დამახსოვრებულია
    const existing = snap.data() as User;
    await hydrate(cred.user.uid);
    return { status: 'EXISTING', user: existing };
  }

  // პირველი შესვლა — Google-იდან ვიღებთ მხოლოდ სახელს/ფოსტას,
  // დანარჩენს მომხმარებელი თავად ავსებს
  const [first = '', ...rest] = (cred.user.displayName ?? '').split(' ');
  return {
    status: 'NEEDS_PROFILE',
    prefill: {
      firstName: first,
      lastName: rest.join(' '),
      email: cred.user.email ?? '',
      phone: cred.user.phoneNumber ?? undefined,
    },
  };
}

/** Google-ით პირველი შესვლის შემდეგ პროფილის დასრულება */
export async function completeGoogleProfile(input: {
  firstName: string;
  lastName: string;
  phone?: string;
  preferredCity: string;
  category: DrivingCategory;
  transmission: TransmissionType;
  role: 'STUDENT' | 'INSTRUCTOR';
}): Promise<User> {
  const fbUser = auth.currentUser;
  if (!fbUser) throw new Error('სესია არ მოიძებნა. სცადე ხელახლა შესვლა.');

  const profile: User = {
    id: fbUser.uid,
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    email: fbUser.email ?? '',
    phone: input.phone?.trim() || undefined,
    role: isBootstrapAdminEmail(fbUser.email) ? 'ADMIN' : input.role,
    preferredCity: input.preferredCity,
    category: input.category,
    transmission: input.transmission,
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(firestore, COLLECTIONS.users, fbUser.uid), profile);
  await hydrate(fbUser.uid);
  return profile;
}

export async function logoutUser(): Promise<void> {
  clearUserScopedCache();
  await signOut(auth);
}

/**
 * Firestore-ის პროფილი. თუ არ არსებობს — null.
 *
 * განზრახ არ იქმნება ავტომატური ჩანაწერი: Google-ით პირველ შესვლაზე
 * მომხმარებელმა თავად უნდა აირჩიოს როლი, კატეგორია და ტრანსმისია.
 */
async function fetchUserProfile(fbUser: FirebaseUser): Promise<User | null> {
  const snap = await getDoc(doc(firestore, COLLECTIONS.users, fbUser.uid));
  if (!snap.exists()) return null;

  const profile = snap.data() as User;

  // საწყისი ადმინი — თუ ჩანაწერი ჯერ ADMIN არ არის, ავწევთ და შევინახავთ
  if (isBootstrapAdminEmail(fbUser.email) && profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
    const upgraded: User = { ...profile, role: 'ADMIN' };
    try {
      await setDoc(doc(firestore, COLLECTIONS.users, fbUser.uid), upgraded, { merge: true });
    } catch {
      // ჩაწერა ვერ მოხერხდა — როლი მაინც მოქმედებს ამ სესიაზე
    }
    return upgraded;
  }
  return profile;
}

export interface PendingProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

/**
 * ავტორიზაციის მდგომარეობის თვალყური — გვერდის გადატვირთვისას სესია რჩება.
 * pending ივსება, როცა Firebase-ში ანგარიშია, პროფილი კი ჯერ არა.
 */
export function watchAuth(
  cb: (user: User | null, role: UserRole | null, pending: PendingProfile | null) => void,
): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      cb(null, null, null);
      return;
    }
    try {
      const profile = await fetchUserProfile(fbUser);
      if (!profile) {
        const [first = '', ...rest] = (fbUser.displayName ?? '').split(' ');
        cb(null, null, {
          firstName: first,
          lastName: rest.join(' '),
          email: fbUser.email ?? '',
          phone: fbUser.phoneNumber ?? undefined,
        });
        return;
      }
      await hydrate(fbUser.uid);
      cb(profile, profile.role, null);
    } catch {
      cb(null, null, null);
    }
  });
}
