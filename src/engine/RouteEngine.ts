import {
  RouteVersion,
  RouteInstruction,
  Checkpoint,
  Coordinates,
  ManeuverType,
} from '../types';
import {
  calculateDistanceMeters,
  distanceToPolyline,
  isPointInRadius,
  calculateSpeedKmh,
} from './GeoEngine';

export interface RouteEngineState {
  currentInstructionIndex: number;
  completedInstructions: string[]; // instruction IDs
  completedCheckpoints: string[]; // checkpoint IDs
  activeManeuver: ManeuverType | null;
  activeInstruction: RouteInstruction | null;
  activeCheckpoint: Checkpoint | null;
  isOffRoute: boolean;
  offRouteDistanceMeters: number;
  currentSpeedKmh: number;
  progressPercentage: number;
  stopZoneState?: {
    checkpointId: string;
    enteredAtSeconds: number;
    stationarySeconds: number;
    isFullyStopped: boolean;
  };
}

/** ზედიზედ რამდენი წერტილი უნდა ადასტურებდეს ზონაში შესვლას */
const ARRIVAL_CONFIRMATIONS = 2;
/** მარშრუტიდან გადახვევის ზღვარი და დაბრუნების ჰისტერეზისი (მ) */
const OFF_ROUTE_ENTER_M = 45;
const OFF_ROUTE_EXIT_M = 30;
/** ამაზე უარესი სიზუსტით ზონაში შესვლა არ დასტურდება */
const MAX_TRUSTED_ACCURACY_M = 75;

export class RouteEngine {
  private route: RouteVersion;
  private state: RouteEngineState;
  private prevPosition: Coordinates | null = null;
  private prevTimestampSeconds = 0;
  /** კანდიდატი ზონები — id → ზედიზედ დადასტურებების რაოდენობა */
  private pendingArrivals = new Map<string, number>();

  constructor(route: RouteVersion) {
    this.route = route;
    this.state = {
      currentInstructionIndex: 0,
      completedInstructions: [],
      completedCheckpoints: [],
      activeManeuver: route.instructions[0]?.maneuverType || null,
      activeInstruction: route.instructions[0] || null,
      activeCheckpoint: null,
      isOffRoute: false,
      offRouteDistanceMeters: 0,
      currentSpeedKmh: 0,
      progressPercentage: 0,
    };
  }

  public getRoute(): RouteVersion {
    return this.route;
  }

  public getState(): RouteEngineState {
    return this.state;
  }

  /**
   * Updates state with new GPS location
   * Returns triggered events (e.g., audio instruction to play, off route alert, checkpoint reached)
   */
  public updateLocation(
    currentLocation: Coordinates,
    elapsedSeconds: number,
    accuracyMeters = 0
  ): {
    triggeredInstruction?: RouteInstruction;
    reachedCheckpoint?: Checkpoint;
    offRouteWarning?: boolean;
    speedWarning?: number; // exceeded speed
  } {
    const events: {
      triggeredInstruction?: RouteInstruction;
      reachedCheckpoint?: Checkpoint;
      offRouteWarning?: boolean;
      speedWarning?: number;
    } = {};

    // 1. Calculate speed
    if (this.prevPosition && elapsedSeconds > this.prevTimestampSeconds) {
      const dt = elapsedSeconds - this.prevTimestampSeconds;
      this.state.currentSpeedKmh = calculateSpeedKmh(this.prevPosition, currentLocation, dt);
    }
    this.prevPosition = currentLocation;
    this.prevTimestampSeconds = elapsedSeconds;

    // 2. Route deviation check (> 45 meters from polyline)
    const distToPolyline = distanceToPolyline(currentLocation, this.route.polyline);
    this.state.offRouteDistanceMeters = Math.round(distToPolyline);

    /*
     * ჰისტერეზისი: შესვლა 45 მ-ზე, დაბრუნება 30 მ-ზე.
     * ერთი ზღვრით GPS-ის მერყეობა ზღვარზე გაფრთხილებას მრავალჯერ ისვრიდა.
     * ასევე ცდომილება აკლდება — ±100 მ სიზუსტით გადახვევა ვერ დადასტურდება.
     */
    const effectiveDeviation = Math.max(0, distToPolyline - accuracyMeters);

    if (!this.state.isOffRoute && effectiveDeviation > OFF_ROUTE_ENTER_M) {
      this.state.isOffRoute = true;
      events.offRouteWarning = true;
    } else if (this.state.isOffRoute && distToPolyline < OFF_ROUTE_EXIT_M) {
      this.state.isOffRoute = false;
    }

    // 3. Instructions geofence trigger
    const uncompletedInstructions = this.route.instructions.filter(
      (i) => !this.state.completedInstructions.includes(i.id)
    );

    for (const inst of uncompletedInstructions) {
      const dist = calculateDistanceMeters(currentLocation, inst.location);
      const radius = inst.triggerRadiusMeters || 25;

      if (this.confirmArrival(inst.id, dist, radius, accuracyMeters)) {
        this.state.completedInstructions.push(inst.id);
        this.state.activeInstruction = inst;
        this.state.activeManeuver = inst.maneuverType;
        events.triggeredInstruction = inst;
        break;
      }
    }

    // 4. Checkpoints trigger
    const uncompletedCheckpoints = this.route.checkpoints.filter(
      (cp) => !this.state.completedCheckpoints.includes(cp.id)
    );

    for (const cp of uncompletedCheckpoints) {
      const dist = calculateDistanceMeters(currentLocation, cp.location);
      if (this.confirmArrival(cp.id, dist, cp.radiusMeters, accuracyMeters)) {
        this.state.completedCheckpoints.push(cp.id);
        this.state.activeCheckpoint = cp;
        events.reachedCheckpoint = cp;
        break;
      }
    }

    // 5. Calculate progress percentage
    if (this.route.instructions.length > 0) {
      this.state.progressPercentage = Math.round(
        (this.state.completedInstructions.length / this.route.instructions.length) * 100
      );
    } else {
      // Fallback distance to finish
      const distToFinish = calculateDistanceMeters(currentLocation, this.route.finishPoint);
      if (distToFinish < 25) {
        this.state.progressPercentage = 100;
      }
    }

    return events;
  }

  /**
   * ზონაში შესვლის დადასტურება.
   *
   * ერთი ცუდი წერტილი საკმარისი არ არის — საჭიროა ზედიზედ რამდენიმე.
   * ცდომილება რადიუსს ამატებს მხოლოდ იმ ზღვრამდე, სადამდეც მას ვენდობით:
   * თუ სამიზნე 20 მ-შია, ცდომილება კი ±150 მ, მისვლა ვერ დადასტურდება.
   */
  private confirmArrival(
    id: string,
    distanceMeters: number,
    radiusMeters: number,
    accuracyMeters: number
  ): boolean {
    const trusted = accuracyMeters <= MAX_TRUSTED_ACCURACY_M;
    const inside = distanceMeters <= radiusMeters;

    if (!inside || !trusted) {
      this.pendingArrivals.delete(id);
      return false;
    }

    // მკვეთრად ზუსტი წერტილი ზონის სიღრმეში — დაუყოვნებლივ ჩაითვლება
    const deepInside = distanceMeters + accuracyMeters <= radiusMeters;
    const count = (this.pendingArrivals.get(id) ?? 0) + 1;
    this.pendingArrivals.set(id, count);

    if (deepInside || count >= ARRIVAL_CONFIRMATIONS) {
      this.pendingArrivals.delete(id);
      return true;
    }
    return false;
  }
}
