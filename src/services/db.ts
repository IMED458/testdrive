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
} from '../types';
import {
  DEMO_USERS,
  DEMO_STUDENT_PROFILE,
  DEMO_INSTRUCTOR_PROFILE,
  TELAVI_ROUTES,
  DEFAULT_GEORGIA_RULESET,
  TECHNICAL_QUESTIONS,
  DEFAULT_AUDIO_ASSETS,
  DEFAULT_ROAD_WARNINGS,
} from '../data/initialData';

const KEYS = {
  CURRENT_USER: 'driving_sim_current_user',
  USERS: 'driving_sim_users',
  STUDENT_PROFILES: 'driving_sim_student_profiles',
  INSTRUCTOR_PROFILES: 'driving_sim_instructor_profiles',
  ROUTES: 'driving_sim_routes',
  RULESETS: 'driving_sim_rulesets',
  EXAM_SESSIONS: 'driving_sim_exam_sessions',
  CONSENTS: 'driving_sim_consents',
  LESSON_NOTES: 'driving_sim_lesson_notes',
  ROAD_WARNINGS: 'driving_sim_road_warnings',
  TECH_QUESTIONS: 'driving_sim_tech_questions',
  AUDIO_ASSETS: 'driving_sim_audio_assets',
  AUDIT_LOGS: 'driving_sim_audit_logs',
};

// Initialize default storage if empty
export function initDatabase() {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEMO_USERS));
  }
  if (!localStorage.getItem(KEYS.STUDENT_PROFILES)) {
    localStorage.setItem(KEYS.STUDENT_PROFILES, JSON.stringify([DEMO_STUDENT_PROFILE]));
  }
  if (!localStorage.getItem(KEYS.INSTRUCTOR_PROFILES)) {
    localStorage.setItem(KEYS.INSTRUCTOR_PROFILES, JSON.stringify([DEMO_INSTRUCTOR_PROFILE]));
  }
  if (!localStorage.getItem(KEYS.ROUTES)) {
    localStorage.setItem(KEYS.ROUTES, JSON.stringify(TELAVI_ROUTES));
  }
  if (!localStorage.getItem(KEYS.RULESETS)) {
    localStorage.setItem(KEYS.RULESETS, JSON.stringify([DEFAULT_GEORGIA_RULESET]));
  }
  if (!localStorage.getItem(KEYS.ROAD_WARNINGS)) {
    localStorage.setItem(KEYS.ROAD_WARNINGS, JSON.stringify(DEFAULT_ROAD_WARNINGS));
  }
  if (!localStorage.getItem(KEYS.TECH_QUESTIONS)) {
    localStorage.setItem(KEYS.TECH_QUESTIONS, JSON.stringify(TECHNICAL_QUESTIONS));
  }
  if (!localStorage.getItem(KEYS.AUDIO_ASSETS)) {
    localStorage.setItem(KEYS.AUDIO_ASSETS, JSON.stringify(DEFAULT_AUDIO_ASSETS));
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS[0]));
  }
}

// User & Auth Management
export function getCurrentUser(): User {
  initDatabase();
  const raw = localStorage.getItem(KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : DEMO_USERS[0];
}

export function setCurrentUser(user: User) {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
}

export function getAllUsers(): User[] {
  initDatabase();
  const raw = localStorage.getItem(KEYS.USERS);
  return raw ? JSON.parse(raw) : DEMO_USERS;
}

export const getDemoUsers = getAllUsers;

export function saveUser(user: User) {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
}

// Student Profiles
export function getStudentProfiles(): StudentProfile[] {
  initDatabase();
  const raw = localStorage.getItem(KEYS.STUDENT_PROFILES);
  return raw ? JSON.parse(raw) : [DEMO_STUDENT_PROFILE];
}

export const getDemoStudentProfile = (): StudentProfile => getStudentProfiles()[0] || DEMO_STUDENT_PROFILE;

export function getStudentProfileByUserId(userId: string): StudentProfile | undefined {
  return getStudentProfiles().find((p) => p.userId === userId);
}

export function saveStudentProfile(profile: StudentProfile) {
  const profiles = getStudentProfiles();
  const index = profiles.findIndex((p) => p.id === profile.id);
  if (index >= 0) {
    profiles[index] = profile;
  } else {
    profiles.push(profile);
  }
  localStorage.setItem(KEYS.STUDENT_PROFILES, JSON.stringify(profiles));
}

// Instructor Profiles
export function getInstructorProfiles(): InstructorProfile[] {
  initDatabase();
  const raw = localStorage.getItem(KEYS.INSTRUCTOR_PROFILES);
  return raw ? JSON.parse(raw) : [DEMO_INSTRUCTOR_PROFILE];
}

export const getDemoInstructorProfile = (): InstructorProfile => getInstructorProfiles()[0] || DEMO_INSTRUCTOR_PROFILE;

export function getInstructorProfileByUserId(userId: string): InstructorProfile | undefined {
  return getInstructorProfiles().find((p) => p.userId === userId);
}

// Consent Management
export function getConsents(): ConsentRecord[] {
  const raw = localStorage.getItem(KEYS.CONSENTS);
  return raw ? JSON.parse(raw) : [];
}

export function saveConsent(consent: ConsentRecord) {
  const consents = getConsents();
  consents.push(consent);
  localStorage.setItem(KEYS.CONSENTS, JSON.stringify(consents));
}

export function hasUserAcceptedConsent(userId: string, disclaimerVersion = '2026-v1'): boolean {
  const consents = getConsents();
  return consents.some((c) => c.userId === userId && c.disclaimerVersion === disclaimerVersion && c.termsAccepted);
}

// Routes
export function getRoutes(): RouteVersion[] {
  initDatabase();
  const raw = localStorage.getItem(KEYS.ROUTES);
  return raw ? JSON.parse(raw) : TELAVI_ROUTES;
}

export function getRoutesByCity(city: string): RouteVersion[] {
  return getRoutes().filter((r) => r.city.toLowerCase() === city.toLowerCase() && r.status !== 'ARCHIVED');
}

export function saveRoute(route: RouteVersion) {
  const routes = getRoutes();
  const index = routes.findIndex((r) => r.id === route.id);
  if (index >= 0) {
    routes[index] = route;
  } else {
    routes.push(route);
  }
  localStorage.setItem(KEYS.ROUTES, JSON.stringify(routes));
}

// Road Warnings
export function getRoadWarnings(): RoadWarning[] {
  initDatabase();
  const raw = localStorage.getItem(KEYS.ROAD_WARNINGS);
  return raw ? JSON.parse(raw) : DEFAULT_ROAD_WARNINGS;
}

export function saveRoadWarning(warning: RoadWarning) {
  const warnings = getRoadWarnings();
  warnings.push(warning);
  localStorage.setItem(KEYS.ROAD_WARNINGS, JSON.stringify(warnings));
}

// RuleSets
export function getRuleSets(): ExamRuleSet[] {
  initDatabase();
  const raw = localStorage.getItem(KEYS.RULESETS);
  return raw ? JSON.parse(raw) : [DEFAULT_GEORGIA_RULESET];
}

export const getRulesets = getRuleSets;

export function getActiveRuleSet(): ExamRuleSet {
  const sets = getRuleSets();
  return sets[0] || DEFAULT_GEORGIA_RULESET;
}

export const getRuleSet = getActiveRuleSet;
export const hasAcceptedConsent = hasUserAcceptedConsent;

export function saveRuleSet(ruleSet: ExamRuleSet) {
  const sets = getRuleSets();
  const index = sets.findIndex((s) => s.id === ruleSet.id);
  if (index >= 0) {
    sets[index] = ruleSet;
  } else {
    sets.unshift(ruleSet);
  }
  localStorage.setItem(KEYS.RULESETS, JSON.stringify(sets));
}

// Exam Sessions
export function getExamSessions(): ExamSession[] {
  const raw = localStorage.getItem(KEYS.EXAM_SESSIONS);
  return raw ? JSON.parse(raw) : [];
}

export function saveExamSession(session: ExamSession) {
  const sessions = getExamSessions();
  const index = sessions.findIndex((s) => s.id === session.id);
  if (index >= 0) {
    sessions[index] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(KEYS.EXAM_SESSIONS, JSON.stringify(sessions));

  // Recalculate student stats if user is student
  const profile = getStudentProfileByUserId(session.userId);
  if (profile) {
    const userSessions = sessions.filter((s) => s.userId === session.userId && s.result !== 'INCOMPLETE');
    const total = userSessions.length;
    const passes = userSessions.filter((s) => s.result === 'PASS').length;
    const fails = userSessions.filter((s) => s.result === 'FAIL').length;
    const totalSec = userSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

    profile.totalSimulations = total;
    profile.totalPasses = passes;
    profile.totalFails = fails;
    profile.totalDrivingMinutes = Math.round(totalSec / 60);
    profile.preparationScore = total > 0 ? Math.round((passes / total) * 100) : 50;

    saveStudentProfile(profile);
  }
}

export function getExamSessionsByUserId(userId: string): ExamSession[] {
  return getExamSessions().filter((s) => s.userId === userId);
}

// Technical Questions
export function getTechnicalQuestions(): TechnicalQuestion[] {
  initDatabase();
  const raw = localStorage.getItem(KEYS.TECH_QUESTIONS);
  return raw ? JSON.parse(raw) : TECHNICAL_QUESTIONS;
}

// Audio Assets
export function getAudioAssets(): AudioAsset[] {
  initDatabase();
  const raw = localStorage.getItem(KEYS.AUDIO_ASSETS);
  return raw ? JSON.parse(raw) : DEFAULT_AUDIO_ASSETS;
}

// Lesson Notes
export function getLessonNotes(studentProfileId: string): LessonNote[] {
  const raw = localStorage.getItem(KEYS.LESSON_NOTES);
  const notes: LessonNote[] = raw ? JSON.parse(raw) : [];
  return notes.filter((n) => n.studentProfileId === studentProfileId);
}

export function saveLessonNote(note: LessonNote) {
  const raw = localStorage.getItem(KEYS.LESSON_NOTES);
  const notes: LessonNote[] = raw ? JSON.parse(raw) : [];
  notes.unshift(note);
  localStorage.setItem(KEYS.LESSON_NOTES, JSON.stringify(notes));
}

// Audit Logs
export function addAuditLog(userId: string, userRole: any, action: string, details: string) {
  const raw = localStorage.getItem(KEYS.AUDIT_LOGS);
  const logs: AuditLog[] = raw ? JSON.parse(raw) : [];
  logs.unshift({
    id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId,
    userRole,
    action,
    details,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs.slice(0, 200)));
}

export function getAuditLogs(): AuditLog[] {
  const raw = localStorage.getItem(KEYS.AUDIT_LOGS);
  return raw ? JSON.parse(raw) : [];
}
