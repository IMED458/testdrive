/**
 * მონაცემთა შრე — Firestore-ზე, სინქრონული API-ის შენარჩუნებით.
 *
 * წაკითხვა ხდება მეხსიერების ქეშიდან (cloudStore), ჩაწერა — პირდაპირ Firestore-ში.
 * ამიტომ ფუნქციების ხელმოწერები უცვლელია და კომპონენტების გადაწერა არ დასჭირდა.
 *
 * ცნობარები (მარშრუტები, წესები, კითხვები, ხმები) ლოკალურად ითესება, თუ
 * Firestore ცარიელია — ასე აპლიკაცია მუშაობს ბაზის შევსებამდეც.
 */
import {
  User,
  StudentProfile,
  InstructorProfile,
  RouteVersion,
  ExamRuleSet,
  ExamSession,
  ConsentRecord,
  LessonNote,
  RoadWarning,
  TechnicalQuestion,
  AudioAsset,
  AuditLog,
  UserRole,
} from '../types';
import {
  TELAVI_ROUTES,
  DEFAULT_GEORGIA_RULESET,
  TECHNICAL_QUESTIONS,
  DEFAULT_AUDIO_ASSETS,
  DEFAULT_ROAD_WARNINGS,
} from '../data/initialData';
import { COLLECTIONS } from './firebase';
import { readAll, readOne, seedIfEmpty, writeOne } from './cloudStore';

const CURRENT_USER_KEY = 'driving_sim_current_user';

/** ცნობარების ლოკალური თესვა — Firestore-ის ცარიელობისას */
export function initDatabase() {
  seedIfEmpty(COLLECTIONS.routes, TELAVI_ROUTES as unknown as { id: string }[]);
  seedIfEmpty(COLLECTIONS.ruleSets, [DEFAULT_GEORGIA_RULESET] as unknown as { id: string }[]);
  seedIfEmpty(
    COLLECTIONS.questions,
    TECHNICAL_QUESTIONS as unknown as { id: string }[],
  );
  seedIfEmpty(
    COLLECTIONS.audio,
    DEFAULT_AUDIO_ASSETS.map((a) => ({ ...a, id: a.key })) as unknown as { id: string }[],
  );
  seedIfEmpty(COLLECTIONS.warnings, DEFAULT_ROAD_WARNINGS as unknown as { id: string }[]);
}

/* ─────────────────── მომხმარებელი ─────────────────── */

/** ავტორიზებული მომხმარებელი; ავთენტიფიკაციას მართავს services/auth.ts */
export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null) {
  if (user) localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(CURRENT_USER_KEY);
}

export function getAllUsers(): User[] {
  return readAll<User>(COLLECTIONS.users);
}

export const getDemoUsers = getAllUsers;

export function saveUser(user: User) {
  writeOne(COLLECTIONS.users, user.id, user as unknown as Record<string, unknown>);
}

/* ─────────────────── მოსწავლის პროფილი ─────────────────── */

export function getStudentProfiles(): StudentProfile[] {
  return readAll<StudentProfile>(COLLECTIONS.studentProfiles);
}

export function getStudentProfileByUserId(userId: string): StudentProfile | undefined {
  return getStudentProfiles().find((p) => p.userId === userId);
}

/** პროფილი არ არსებობს — იქმნება ცარიელი, ნულოვანი სტატისტიკით */
export function ensureStudentProfile(user: User): StudentProfile {
  const existing = getStudentProfileByUserId(user.id);
  if (existing) return existing;

  const profile: StudentProfile = {
    id: `sp-${user.id}`,
    userId: user.id,
    preferredCity: user.preferredCity,
    category: user.category,
    transmission: user.transmission,
    preparationScore: 0,
    totalSimulations: 0,
    totalPasses: 0,
    totalFails: 0,
    totalDrivingMinutes: 0,
    frequentMistakes: [],
    createdAt: new Date().toISOString(),
  };
  saveStudentProfile(profile);
  return profile;
}

export function saveStudentProfile(profile: StudentProfile) {
  writeOne(
    COLLECTIONS.studentProfiles,
    profile.id,
    profile as unknown as Record<string, unknown>,
  );
}

export function getInstructorProfiles(): InstructorProfile[] {
  return readAll<InstructorProfile>(COLLECTIONS.instructorProfiles);
}

export function getInstructorProfileByUserId(userId: string): InstructorProfile | undefined {
  return getInstructorProfiles().find((p) => p.userId === userId);
}

export function saveInstructorProfile(profile: InstructorProfile) {
  writeOne(
    COLLECTIONS.instructorProfiles,
    profile.id,
    profile as unknown as Record<string, unknown>,
  );
}

/* ─────────────────── თანხმობა ─────────────────── */

export function getConsents(): ConsentRecord[] {
  return readAll<ConsentRecord>(COLLECTIONS.consents);
}

export function saveConsent(consent: ConsentRecord) {
  writeOne(COLLECTIONS.consents, consent.id, consent as unknown as Record<string, unknown>);
  // ლოკალური ასლი — გვერდის გადატვირთვისას ფანჯარა ხელახლა არ უნდა გამოჩნდეს
  try {
    localStorage.setItem(`consent_${consent.userId}_${consent.disclaimerVersion}`, '1');
  } catch {
    /* კვოტა */
  }
}

export function hasUserAcceptedConsent(userId: string, disclaimerVersion = '2026-v1'): boolean {
  if (localStorage.getItem(`consent_${userId}_${disclaimerVersion}`) === '1') return true;
  return getConsents().some(
    (c) => c.userId === userId && c.disclaimerVersion === disclaimerVersion,
  );
}

/* ─────────────────── მარშრუტები ─────────────────── */

export function getRoutes(): RouteVersion[] {
  initDatabase();
  return readAll<RouteVersion>(COLLECTIONS.routes).sort(
    (a, b) => a.routeNumber - b.routeNumber,
  );
}

export function getRoutesByCity(city: string): RouteVersion[] {
  return getRoutes().filter((r) => r.city.toLowerCase() === city.toLowerCase());
}

export function saveRoute(route: RouteVersion) {
  writeOne(COLLECTIONS.routes, route.id, route as unknown as Record<string, unknown>);
}

export function getRoadWarnings(): RoadWarning[] {
  initDatabase();
  return readAll<RoadWarning>(COLLECTIONS.warnings);
}

export function saveRoadWarning(warning: RoadWarning) {
  writeOne(COLLECTIONS.warnings, warning.id, warning as unknown as Record<string, unknown>);
}

/* ─────────────────── წესები ─────────────────── */

export function getRuleSets(): ExamRuleSet[] {
  initDatabase();
  return readAll<ExamRuleSet>(COLLECTIONS.ruleSets);
}

export const getRulesets = getRuleSets;

export function getActiveRuleSet(): ExamRuleSet {
  return getRuleSets()[0] ?? DEFAULT_GEORGIA_RULESET;
}

export const getRuleSet = getActiveRuleSet;
export const hasAcceptedConsent = hasUserAcceptedConsent;

export function saveRuleSet(ruleSet: ExamRuleSet) {
  writeOne(COLLECTIONS.ruleSets, ruleSet.id, ruleSet as unknown as Record<string, unknown>);
}

/* ─────────────────── საგამოცდო სესიები ─────────────────── */

export function getExamSessions(): ExamSession[] {
  return readAll<ExamSession>(COLLECTIONS.sessions).sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );
}

export function saveExamSession(session: ExamSession) {
  writeOne(COLLECTIONS.sessions, session.id, session as unknown as Record<string, unknown>);

  // სესიის შემდეგ მოსწავლის სტატისტიკა გადაითვლება რეალური მონაცემებით
  const profile = getStudentProfileByUserId(session.userId);
  if (!profile || session.result === 'INCOMPLETE') return;

  const own = getExamSessions().filter(
    (s) => s.userId === session.userId && s.result !== 'INCOMPLETE',
  );
  const passes = own.filter((s) => s.result === 'PASS').length;
  const fails = own.filter((s) => s.result === 'FAIL').length;
  const minutes = Math.round(own.reduce((sum, s) => sum + s.durationSeconds, 0) / 60);

  const mistakes = new Map<string, number>();
  own.forEach((s) =>
    s.errorEvents?.forEach((e) => {
      if (e.isUndone) return;
      mistakes.set(e.ruleNameKa, (mistakes.get(e.ruleNameKa) ?? 0) + 1);
    }),
  );
  const frequent = [...mistakes.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  saveStudentProfile({
    ...profile,
    totalSimulations: own.length,
    totalPasses: passes,
    totalFails: fails,
    totalDrivingMinutes: minutes,
    frequentMistakes: frequent,
    preparationScore: own.length === 0 ? 0 : Math.round((passes / own.length) * 100),
  });
}

export function getExamSessionsByUserId(userId: string): ExamSession[] {
  return getExamSessions().filter((s) => s.userId === userId);
}

/* ─────────────────── ცნობარები ─────────────────── */

export function getTechnicalQuestions(): TechnicalQuestion[] {
  initDatabase();
  return readAll<TechnicalQuestion>(COLLECTIONS.questions);
}

export function getAudioAssets(): AudioAsset[] {
  initDatabase();
  return readAll<AudioAsset>(COLLECTIONS.audio);
}

/* ─────────────────── გაკვეთილის შენიშვნები ─────────────────── */

export function getLessonNotes(studentProfileId: string): LessonNote[] {
  return readAll<LessonNote>(COLLECTIONS.lessonNotes).filter(
    (n) => n.studentProfileId === studentProfileId,
  );
}

export function saveLessonNote(note: LessonNote) {
  writeOne(COLLECTIONS.lessonNotes, note.id, note as unknown as Record<string, unknown>);
}

/* ─────────────────── აუდიტი ─────────────────── */

export function addAuditLog(
  userId: string,
  userRole: UserRole,
  action: string,
  details: string,
) {
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId,
    userRole,
    action,
    details,
    timestamp: new Date().toISOString(),
  };
  writeOne(COLLECTIONS.audit, log.id, log as unknown as Record<string, unknown>);
}

export function getAuditLogs(): AuditLog[] {
  return readAll<AuditLog>(COLLECTIONS.audit).sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

/** ადმინის ინსტრუმენტი — ლოკალური ცნობარები Firestore-ში ატვირთვა */
export async function pushSeedToCloud(): Promise<void> {
  getRoutes().forEach(saveRoute);
  getRuleSets().forEach(saveRuleSet);
  getRoadWarnings().forEach(saveRoadWarning);
  getTechnicalQuestions().forEach((q) =>
    writeOne(COLLECTIONS.questions, q.id, q as unknown as Record<string, unknown>),
  );
}
