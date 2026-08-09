import {
  ExamSession,
  ExamMode,
  RouteVersion,
  ExamRuleSet,
  ExamErrorEvent,
  ErrorSeverity,
  Coordinates,
  ManeuverType,
  InstructorEvaluation,
  ExamEvent,
} from '../types';
import { RouteEngine } from './RouteEngine';
import { evaluateExamResult } from './RulesEngine';
import { AudioEngine } from './AudioEngine';
import { evaluateGpsQuality } from './GeoEngine';

export type ExamEngineStage =
  | 'IDLE'
  | 'SAFETY_CONSENT'
  | 'PRE_CHECK'
  | 'GPS_CHECK'
  | 'AUDIO_CHECK'
  | 'TECH_QUESTIONS'
  | 'DRIVING'
  | 'PAUSED'
  | 'COMPLETED';

export class ExamEngine {
  private session: ExamSession;
  private routeEngine: RouteEngine;
  private ruleSet: ExamRuleSet;
  private stage: ExamEngineStage = 'IDLE';
  private timerInterval: any = null;

  constructor(
    userId: string,
    userName: string,
    mode: ExamMode,
    route: RouteVersion,
    ruleSet: ExamRuleSet,
    instructorId?: string,
    instructorName?: string
  ) {
    this.ruleSet = ruleSet;
    this.routeEngine = new RouteEngine(route);

    this.session = {
      id: 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      userName,
      instructorId,
      instructorName,
      mode,
      city: route.city,
      routeNumber: route.routeNumber,
      routeVersionId: route.id,
      ruleSetId: ruleSet.id,
      category: route.category,
      transmission: 'MANUAL',
      startedAt: new Date().toISOString(),
      durationSeconds: 0,
      result: 'INCOMPLETE',
      lightErrorCount: 0,
      seriousErrorCount: 0,
      disqualifyingErrorCount: 0,
      errorEvents: [],
      events: [
        {
          id: 'evt-start',
          type: 'EXAM_STARTED',
          timestamp: new Date().toISOString(),
          elapsedSeconds: 0,
        },
      ],
      evaluations: [],
      gpsQuality: 'GOOD',
      pathHistory: [route.startPoint],
      whatWentWell: [],
      needsImprovement: [],
    };
  }

  public getSession(): ExamSession {
    return this.session;
  }

  public getStage(): ExamEngineStage {
    return this.stage;
  }

  public setStage(stage: ExamEngineStage) {
    this.stage = stage;
  }

  public getRouteEngine(): RouteEngine {
    return this.routeEngine;
  }

  /**
   * Starts live timer and driving phase
   */
  public startDriving() {
    this.stage = 'DRIVING';
    this.session.startedAt = new Date().toISOString();
    this.addSystemEvent('ROUTE_STARTED');

    // Play start audio
    AudioEngine.playInstruction('START_EXAM');

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.stage === 'DRIVING') {
        this.session.durationSeconds += 1;
      }
    }, 1000);
  }

  public pauseExam() {
    if (this.stage === 'DRIVING') {
      this.stage = 'PAUSED';
      this.addSystemEvent('EXAM_PAUSED');
    }
  }

  public resumeExam() {
    if (this.stage === 'PAUSED') {
      this.stage = 'DRIVING';
      this.addSystemEvent('EXAM_RESUMED');
    }
  }

  /**
   * Updates GPS position during driving
   */
  public updateGpsPosition(coords: Coordinates, accuracyMeters = 5) {
    this.session.gpsQuality = evaluateGpsQuality(accuracyMeters);
    this.session.pathHistory.push(coords);

    if (this.stage !== 'DRIVING') return;

    // Route engine update
    const triggers = this.routeEngine.updateLocation(coords, this.session.durationSeconds);

    if (triggers.triggeredInstruction) {
      AudioEngine.playInstruction(triggers.triggeredInstruction.audioKey);
      this.addSystemEvent('INSTRUCTION_PLAYED', {
        instructionText: triggers.triggeredInstruction.instructionText,
        audioKey: triggers.triggeredInstruction.audioKey,
      });
    }

    if (triggers.reachedCheckpoint) {
      AudioEngine.playBeep('CHECKPOINT');
      this.addSystemEvent('CHECKPOINT_REACHED', {
        checkpointName: triggers.reachedCheckpoint.name,
      });
    }

    if (triggers.offRouteWarning) {
      this.addSystemEvent('ROUTE_DEVIATION', {
        distMeters: this.routeEngine.getState().offRouteDistanceMeters,
      });
    }
  }

  /**
   * Logs a new error event (Manual by Instructor/Companion or Auto GPS)
   */
  public addError(
    ruleId: string,
    ruleCode: string,
    ruleNameKa: string,
    severity: ErrorSeverity,
    source: 'AUTO_GPS' | 'INSTRUCTOR' | 'COMPANION' | 'SYSTEM',
    maneuverType?: ManeuverType,
    note?: string
  ): ExamErrorEvent {
    const errorEvent: ExamErrorEvent = {
      id: 'err-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      ruleId,
      ruleCode,
      ruleNameKa,
      severity,
      timestamp: new Date().toISOString(),
      elapsedSeconds: this.session.durationSeconds,
      location: this.session.pathHistory[this.session.pathHistory.length - 1],
      maneuverType,
      source,
      note,
    };

    this.session.errorEvents.push(errorEvent);
    this.addSystemEvent('ERROR_ADDED', { ruleCode, ruleNameKa, severity });

    // Play warning sound
    AudioEngine.playBeep('ERROR');

    // Recalculate results
    this.recalculateScores();

    return errorEvent;
  }

  /**
   * Undo last error event (within 10 seconds window)
   */
  public undoLastError(): boolean {
    const activeErrors = this.session.errorEvents.filter((e) => !e.isUndone);
    if (activeErrors.length === 0) return false;

    const last = activeErrors[activeErrors.length - 1];
    last.isUndone = true;

    this.addSystemEvent('ERROR_REMOVED', { ruleCode: last.ruleCode });
    this.recalculateScores();
    return true;
  }

  /**
   * Records contextual evaluation card from instructor or companion
   */
  public addInstructorEvaluation(evalData: Omit<InstructorEvaluation, 'id' | 'sessionId' | 'evaluatedAt'>) {
    const record: InstructorEvaluation = {
      ...evalData,
      id: 'eval-' + Date.now(),
      sessionId: this.session.id,
      evaluatedAt: new Date().toISOString(),
    };

    this.session.evaluations.push(record);
    this.addSystemEvent('INSTRUCTOR_EVALUATION', { maneuver: evalData.maneuverType });

    // Auto-log error if indicator or mirror was missed
    if (!evalData.indicatorUsed) {
      this.addError(
        'rule-serious-02',
        'IND-03',
        'მოხვევის მაჩვენებლის სრული არჩართვა',
        'SERIOUS',
        'INSTRUCTOR',
        evalData.maneuverType
      );
    } else if (!evalData.indicatorTimely) {
      this.addError(
        'rule-light-03',
        'IND-01',
        'მოხვევის მაჩვენებლის დაგვიანებით ჩართვა',
        'LIGHT',
        'INSTRUCTOR',
        evalData.maneuverType
      );
    }

    if (!evalData.mirrorChecked) {
      this.addError(
        'rule-light-01',
        'OBS-01',
        'სარკეში უყურადღებობა',
        'LIGHT',
        'INSTRUCTOR',
        evalData.maneuverType
      );
    }

    if (evalData.maneuverType === 'STOP_SIGN' && evalData.stoppedAtStopSign === false) {
      this.addError(
        'rule-serious-01',
        'STP-01',
        'STOP ნიშანთან სრული გაჩერების იგნორირება',
        'SERIOUS',
        'INSTRUCTOR',
        'STOP_SIGN'
      );
    }
  }

  /**
   * Recalculates error totals and live pass/fail status
   */
  public recalculateScores() {
    const summary = evaluateExamResult(this.session.errorEvents, this.ruleSet);
    this.session.lightErrorCount = summary.lightErrorCount;
    this.session.seriousErrorCount = summary.seriousErrorCount;
    this.session.disqualifyingErrorCount = summary.disqualifyingErrorCount;

    if (summary.result === 'FAIL' && this.session.result !== 'FAIL') {
      // Auto-fail trigger
      this.addSystemEvent('EXAM_FAILED', { reasons: summary.failureReasonsKa });
    }
  }

  /**
   * Concludes the exam session
   */
  public finishExam(manualResultOverride?: 'PASS' | 'FAIL' | 'TRAINING_ONLY'): ExamSession {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.stage = 'COMPLETED';

    this.session.finishedAt = new Date().toISOString();

    const summary = evaluateExamResult(this.session.errorEvents, this.ruleSet);

    if (manualResultOverride) {
      this.session.result = manualResultOverride;
    } else {
      this.session.result = summary.result;
    }

    this.addSystemEvent('EXAM_COMPLETED', { finalResult: this.session.result });
    AudioEngine.playInstruction('EXAM_FINISHED');

    return this.session;
  }

  private addSystemEvent(type: ExamEvent['type'], metadata?: Record<string, any>) {
    this.session.events.push({
      id: 'evt-' + Date.now(),
      type,
      timestamp: new Date().toISOString(),
      elapsedSeconds: this.session.durationSeconds,
      location: this.session.pathHistory[this.session.pathHistory.length - 1],
      metadata,
    });
  }
}
