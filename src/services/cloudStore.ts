/**
 * Firestore-ის ქეშირებული შრე.
 *
 * პრობლემა: მთელი ინტერფეისი სინქრონულ `db.getX()` ფუნქციებს იყენებს,
 * Firestore კი ასინქრონულია. ყველა კომპონენტის გადაწერა რისკიანი იქნებოდა.
 *
 * გადაწყვეტა: აპლიკაციის გაშვებისას მონაცემები ერთხელ ჩაიტვირთება მეხსიერების
 * ქეშში და მასზე ეწერება onSnapshot გამოწერა. სინქრონული getX() კითხულობს ქეშს,
 * saveX() კი წერს Firestore-ში და ქეშსაც მაშინვე აახლებს (ოპტიმისტურად).
 * localStorage რჩება ოფლაინ-სარკედ — ინტერნეტის გათიშვისას სიმულაცია არ წყდება.
 */
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db as firestore, COLLECTIONS } from './firebase';

type Row = { id: string } & Record<string, unknown>;

const cache = new Map<string, Map<string, Row>>();
const subs: Unsubscribe[] = [];
let listeners: (() => void)[] = [];

function bucket(name: string): Map<string, Row> {
  let b = cache.get(name);
  if (!b) {
    b = new Map();
    cache.set(name, b);
  }
  return b;
}

function mirrorKey(name: string): string {
  return `cloud_mirror_${name}`;
}

/** ოფლაინ-სარკე: ბოლო ცნობილი მდგომარეობა ბრაუზერში */
function saveMirror(name: string): void {
  try {
    localStorage.setItem(mirrorKey(name), JSON.stringify([...bucket(name).values()]));
  } catch {
    // კვოტა ამოიწურა — ქეში მაინც მუშაობს მეხსიერებაში
  }
}

function loadMirror(name: string): void {
  try {
    const raw = localStorage.getItem(mirrorKey(name));
    if (!raw) return;
    const rows = JSON.parse(raw) as Row[];
    const b = bucket(name);
    rows.forEach((r) => b.set(r.id, r));
  } catch {
    // დაზიანებული სარკე იგნორირდება
  }
}

export function notifyChanged(): void {
  listeners.forEach((l) => l());
}

/** ცვლილებებზე გამოწერა — App ამით იძულებით ხელახლა ხატავს */
export function onCloudChange(cb: () => void): () => void {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function readAll<T>(name: string): T[] {
  return [...bucket(name).values()] as unknown as T[];
}

export function readOne<T>(name: string, id: string): T | undefined {
  return bucket(name).get(id) as unknown as T | undefined;
}

/** ლოკალურად მაშინვე, ღრუბელში ფონურად — ინტერფეისი არ ელოდება ქსელს */
export function writeOne(name: string, id: string, data: Record<string, unknown>): void {
  bucket(name).set(id, { ...data, id } as Row);
  saveMirror(name);
  notifyChanged();

  void setDoc(doc(firestore, name, id), { ...data, id }, { merge: true }).catch(() => {
    // ქსელი გაითიშა — მონაცემი სარკეშია და Firestore SDK თავად დააგზავნის კავშირის აღდგენისას
  });
}

export function seedIfEmpty(name: string, rows: Row[]): void {
  const b = bucket(name);
  if (b.size > 0) return;
  rows.forEach((r) => b.set(r.id, r));
  saveMirror(name);
}

/** ცნობარები — ყველასთვის საერთო, ერთხელ იკითხება */
const PUBLIC_COLLECTIONS = [
  COLLECTIONS.routes,
  COLLECTIONS.ruleSets,
  COLLECTIONS.questions,
  COLLECTIONS.audio,
  COLLECTIONS.warnings,
];

/** მომხმარებელზე მიბმული — მხოლოდ საკუთარი ჩანაწერები */
export async function hydrate(uid: string | null): Promise<void> {
  PUBLIC_COLLECTIONS.forEach(loadMirror);
  [COLLECTIONS.users, COLLECTIONS.sessions, COLLECTIONS.studentProfiles].forEach(loadMirror);

  await Promise.all(
    PUBLIC_COLLECTIONS.map(async (name) => {
      try {
        const snap = await getDocs(collection(firestore, name));
        if (snap.empty) return; // ცარიელია — ლოკალური seed რჩება
        const b = bucket(name);
        b.clear();
        snap.forEach((d) => b.set(d.id, { ...(d.data() as Row), id: d.id }));
        saveMirror(name);
      } catch {
        // წვდომა ან ქსელი — სარკე გამოიყენება
      }
    }),
  );

  if (uid) await subscribeUserData(uid);
  notifyChanged();
}

async function subscribeUserData(uid: string): Promise<void> {
  unsubscribeAll();

  // საკუთარი მომხმარებლის ჩანაწერი
  subs.push(
    onSnapshot(
      doc(firestore, COLLECTIONS.users, uid),
      (d) => {
        if (d.exists()) {
          bucket(COLLECTIONS.users).set(uid, { ...(d.data() as Row), id: uid });
          saveMirror(COLLECTIONS.users);
          notifyChanged();
        }
      },
      () => {},
    ),
  );

  // საკუთარი სესიები
  subs.push(
    onSnapshot(
      query(collection(firestore, COLLECTIONS.sessions), where('userId', '==', uid)),
      (snap) => {
        const b = bucket(COLLECTIONS.sessions);
        snap.forEach((d) => b.set(d.id, { ...(d.data() as Row), id: d.id }));
        saveMirror(COLLECTIONS.sessions);
        notifyChanged();
      },
      () => {},
    ),
  );

  // საკუთარი მოსწავლის პროფილი
  subs.push(
    onSnapshot(
      query(collection(firestore, COLLECTIONS.studentProfiles), where('userId', '==', uid)),
      (snap) => {
        const b = bucket(COLLECTIONS.studentProfiles);
        snap.forEach((d) => b.set(d.id, { ...(d.data() as Row), id: d.id }));
        saveMirror(COLLECTIONS.studentProfiles);
        notifyChanged();
      },
      () => {},
    ),
  );

  // ინსტრუქტორისთვის — მისი მოსწავლეები (წესები სხვისას არ დაუშვებს)
  subs.push(
    onSnapshot(
      query(collection(firestore, COLLECTIONS.studentProfiles), where('instructorId', '==', uid)),
      (snap) => {
        const b = bucket(COLLECTIONS.studentProfiles);
        snap.forEach((d) => b.set(d.id, { ...(d.data() as Row), id: d.id }));
        saveMirror(COLLECTIONS.studentProfiles);
        notifyChanged();
      },
      () => {},
    ),
  );
}

export function unsubscribeAll(): void {
  subs.forEach((u) => u());
  subs.length = 0;
}

/** გასვლისას მომხმარებელზე მიბმული მონაცემები უნდა გაიწმინდოს */
export function clearUserScopedCache(): void {
  unsubscribeAll();
  [COLLECTIONS.sessions, COLLECTIONS.studentProfiles, COLLECTIONS.users].forEach((name) => {
    bucket(name).clear();
    localStorage.removeItem(mirrorKey(name));
  });
  notifyChanged();
}
