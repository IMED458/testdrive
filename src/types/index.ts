/**
 * საქართველოს ქალაქის მართვის გამოცდის ვებ-სიმულატორი - Types
 */

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN';

export type DrivingCategory = 'B' | 'BE' | 'C' | 'CE' | 'D';
export type TransmissionType = 'MANUAL' | 'AUTOMATIC' | 'BOTH';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  preferredCity: string;
  category: DrivingCategory;
  transmission: TransmissionType;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  instructorId?: string;
  preferredCity: string;
  category: DrivingCategory;
  transmission: TransmissionType;
  preparationScore: number; // 0 - 100
  totalSimulations: number;
  totalPasses: number;
  totalFails: number;
  totalDrivingMinutes: number;
  frequentMistakes: string[];
  notes?: string;
  createdAt: string;
}

export interface InstructorProfile {
  id: string;
  userId: string;
  drivingSchool?: string;
  mainCity: string;
  categories: DrivingCategory[];
  transmission: TransmissionType;
  phone: string;
  activeStudentsCount: number;
  rating?: number;
}

export type RouteStatus = 'ACTIVE' | 'TEMPORARILY_AFFECTED' | 'ARCHIVED' | 'DRAFT' | 'UNDER_REVIEW';

export interface Coordinates {
  lat: number;
  lng: number;
}

export type ManeuverType =
  | 'LEFT_TURN'
  | 'RIGHT_TURN'
  | 'LANE_CHANGE_LEFT'
  | 'LANE_CHANGE_RIGHT'
  | 'STOP_SIGN'
  | 'PEDESTRIAN_CROSSING'
  | 'ROUNDABOUT'
  | 'INTERSECTION'
  | 'PARKING'
  | 'START_MOVEMENT'
  | 'STOP_MOVEMENT'
  | 'U_TURN'
  | 'HILL_START'
  | 'MERGING'
  | 'EXITING_MINOR_ROAD'
  | 'GENERAL_OBSERVATION';

export interface RouteInstruction {
  id: string;
  order: number;
  location: Coordinates;
  triggerRadiusMeters: number;
  instructionText: string;
  audioKey: string;
  maneuverType: ManeuverType;
  preWarningMeters?: number;
  hazardNote?: string;
  speedLimit?: number;
}

export interface Checkpoint {
  id: string;
  name: string;
  location: Coordinates;
  radiusMeters: number;
  requiredStopMeters?: number;
  minStationarySeconds?: number;
  maneuverType?: ManeuverType;
}

export interface RoadWarning {
  id: string;
  city: string;
  routeNumber: number;
  locationName: string;
  coordinates: Coordinates;
  warningText: string;
  reportedAt: string;
  verifiedAt: string;
  source: string;
  isActive: boolean;
}

/** მონაცემის სანდოობის დონე — გამოგონილი და დადასტურებული არასოდეს აირევა */
export type TrustLevel =
  | 'OFFICIAL_DOCUMENT'
  | 'MANUALLY_VERIFIED'
  | 'MANUALLY_DIGITIZED'
  | 'FIELD_VERIFIED'
  | 'ESTIMATED'
  | 'PENDING_REVIEW';

export interface RouteVersion {
  id: string;
  city: string; // e.g. "Telavi", "Rustavi", "Tbilisi"
  routeNumber: number;
  category: DrivingCategory;
  versionDate: string; // "2026-07-22"
  validFrom: string;
  validUntil?: string | null;
  status: RouteStatus;
  officialSourceUrl: string;
  lastVerifiedDate: string;
  polyline: Coordinates[];
  startPoint: Coordinates;
  finishPoint: Coordinates;
  instructions: RouteInstruction[];
  checkpoints: Checkpoint[];
  speedZones: { name: string; polyline: Coordinates[]; speedLimit: number }[];
  hazardNotes: string[];
  /** ოფიციალურ რუკაზე წაკითხული ქუჩები — წყაროს მიხედვით */
  officialStreets?: { nameKa: string; trust: TrustLevel }[];
  /** ოფიციალური რასტრული რუკის ფაილი public/official-maps/-ში */
  officialMapAsset?: string;
  sourceDocument?: string;
  trust?: {
    officialMap: TrustLevel;
    polyline: TrustLevel;
    streetNames: TrustLevel;
    startPoint: TrustLevel;
  };
  /** გეომეტრიის შენიშვნა — რატომ არ არის დადასტურებული */
  geometryNoteKa?: string;
}

export type ErrorSeverity = 'LIGHT' | 'SERIOUS' | 'DISQUALIFYING';

export interface ExamRule {
  id: string;
  code: string;
  nameKa: string;
  category: string; // 'Observation', 'Indicators', 'Speed', 'Lane', 'Priority', 'StopSign', 'VehicleControl', etc.
  severity: ErrorSeverity;
  points: number;
  descriptionKa: string;
  officialReference?: string;
  isAutomaticDetection: boolean;
  isInstructorEvaluated: boolean;
}

export interface ExamRuleSet {
  id: string;
  name: string; // e.g., "საქართველოს B კატეგორიის პრაქტიკული გამოცდის წესები"
  version: string; // "2026-06"
  lightErrorFailThreshold: number; // e.g., 10 light errors = Fail
  seriousErrorFailThreshold: number; // e.g., 1 serious error = Fail
  disqualificationFailThreshold: number; // 1 = Fail
  rules: ExamRule[];
  activeFrom: string;
}

export type ExamMode = 'SELF_TEST' | 'COMPANION' | 'INSTRUCTOR_TEST' | 'LEARNING';
export type ExamResultStatus = 'PASS' | 'FAIL' | 'TRAINING_ONLY' | 'INCOMPLETE';

export interface ExamErrorEvent {
  id: string;
  ruleId: string;
  ruleCode: string;
  ruleNameKa: string;
  severity: ErrorSeverity;
  timestamp: string;
  elapsedSeconds: number;
  location?: Coordinates;
  maneuverType?: ManeuverType;
  source: 'AUTO_GPS' | 'INSTRUCTOR' | 'COMPANION' | 'SYSTEM';
  note?: string;
  isUndone?: boolean;
}

export interface ExamEvent {
  id: string;
  type:
    | 'EXAM_STARTED'
    | 'GPS_ACQUIRED'
    | 'ROUTE_STARTED'
    | 'INSTRUCTION_PLAYED'
    | 'CHECKPOINT_REACHED'
    | 'SPEED_WARNING'
    | 'ROUTE_DEVIATION'
    | 'STOP_DETECTED'
    | 'INSTRUCTOR_EVALUATION'
    | 'ERROR_ADDED'
    | 'ERROR_REMOVED'
    | 'EXAM_PAUSED'
    | 'EXAM_RESUMED'
    | 'EXAM_FAILED'
    | 'EXAM_COMPLETED';
  timestamp: string;
  elapsedSeconds: number;
  location?: Coordinates;
  metadata?: Record<string, any>;
}

export interface InstructorEvaluation {
  id: string;
  sessionId: string;
  maneuverType: ManeuverType;
  checkpointId?: string;
  mirrorChecked: boolean;
  blindSpotChecked: boolean;
  indicatorUsed: boolean;
  indicatorTimely: boolean;
  lanePositionCorrect: boolean;
  speedAppropriate: boolean;
  priorityRespected: boolean;
  stoppedAtStopSign?: boolean;
  stoppedDurationSeconds?: number;
  notes?: string;
  evaluatedAt: string;
}

export interface ExamSession {
  id: string;
  userId: string;
  userName: string;
  studentProfileId?: string;
  instructorId?: string;
  instructorName?: string;
  companionName?: string;
  mode: ExamMode;
  city: string;
  routeNumber: number;
  routeVersionId: string;
  ruleSetId: string;
  category: DrivingCategory;
  transmission: TransmissionType;
  startedAt: string;
  finishedAt?: string;
  durationSeconds: number;
  result: ExamResultStatus;
  lightErrorCount: number;
  seriousErrorCount: number;
  disqualifyingErrorCount: number;
  errorEvents: ExamErrorEvent[];
  events: ExamEvent[];
  evaluations: InstructorEvaluation[];
  gpsQuality: 'GOOD' | 'AVERAGE' | 'POOR';
  pathHistory: Coordinates[];
  whatWentWell: string[];
  needsImprovement: string[];
  instructorNotes?: string;
  technicalQuestionsAnswered?: { questionId: string; isCorrect: boolean }[];
}

/** რეალურ გამოცდაზე ტექნიკური კითხვა ზეპირია ან ჩვენებით — არა სატესტო */
export type TechResponseMode = 'VERBAL' | 'DEMONSTRATION' | 'MIXED';

export interface TechnicalQuestion {
  id: string;
  category: DrivingCategory;
  questionKa: string;
  /** სწორი პასუხის შინაარსი — გამომცდელი ადარებს მოსწავლის პასუხს */
  answerKa: string;
  responseMode: TechResponseMode;
  /** არასავალდებულო სატესტო ვარიანტები — მხოლოდ თვითშემოწმების რეჟიმისთვის */
  optionsKa?: string[];
  correctOptionIndex?: number;
  explanationKa?: string;
  officialSourceUrl?: string;
  sourceDocument?: string;
}

export interface AudioAsset {
  key: string;
  titleKa: string;
  /** ზუსტად ეს ტექსტი უნდა ჩაიწეროს ხმაში */
  textKa: string;
  /** ატვირთული ჩანაწერი — base64 data: URI (Firestore-ში ინახება) */
  url?: string;
  isCustomUploaded?: boolean;
  sizeBytes?: number;
  uploadedAt?: string;
  uploadedBy?: string;
  durationSeconds?: number;
  /** ჯგუფი ადმინის ინტერფეისში დასალაგებლად */
  group?: 'CORE' | 'MANEUVER' | 'HAZARD' | 'SYSTEM' | 'TECHNICAL';
}

export interface ConsentRecord {
  id: string;
  userId: string;
  disclaimerVersion: string;
  acceptedAt: string;
  termsAccepted: boolean;
  simulatorAcknowledged: boolean;
  roadConditionsAcknowledged: boolean;
}

export interface LessonNote {
  id: string;
  studentProfileId: string;
  instructorId: string;
  text: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}
