import { Coordinates } from '../types';

/**
 * GeoEngine - Mathematical and spatial GPS tracking calculations
 */

// Earth radius in meters
const EARTH_RADIUS_METERS = 6371000;

export function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates exact distance between two coordinates using Haversine formula (in meters)
 */
export function calculateDistanceMeters(coord1: Coordinates, coord2: Coordinates): number {
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Checks if current GPS point is within radius meters of a target coordinate
 */
export function isPointInRadius(
  currentPoint: Coordinates,
  targetPoint: Coordinates,
  radiusMeters: number
): boolean {
  return calculateDistanceMeters(currentPoint, targetPoint) <= radiusMeters;
}

/**
 * Calculates shortest distance from a point to a polyline segment (in meters)
 */
export function distanceToPolyline(point: Coordinates, polyline: Coordinates[]): number {
  if (!polyline || polyline.length === 0) return Infinity;
  let minDistance = Infinity;

  for (let i = 0; i < polyline.length - 1; i++) {
    const p1 = polyline[i];
    const p2 = polyline[i + 1];
    const dist = distanceToSegment(point, p1, p2);
    if (dist < minDistance) {
      minDistance = dist;
    }
  }

  return minDistance;
}

function distanceToSegment(p: Coordinates, v: Coordinates, w: Coordinates): number {
  if (calculateDistanceMeters(v, w) === 0) return calculateDistanceMeters(p, v);

  /*
   * გრძედის გრადუსი მერიდიანისკენ მოკლდება cos(lat)-ჯერ.
   * ამ შესწორების გარეშე პროექცია მახინჯდება — თელავის განედზე (41.9°)
   * გრძედის ერთი გრადუსი განედის გრადუსის მხოლოდ ~74%-ია,
   * ამიტომ მარშრუტიდან გადახვევის მანძილი არასწორად ითვლებოდა.
   */
  const latScale = Math.cos(toRadians((v.lat + w.lat) / 2));

  const dx = (w.lng - v.lng) * latScale;
  const dy = w.lat - v.lat;
  const px = (p.lng - v.lng) * latScale;
  const py = p.lat - v.lat;

  let t = (px * dx + py * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));

  const projection: Coordinates = {
    lat: v.lat + t * dy,
    lng: v.lng + t * (w.lng - v.lng),
  };

  return calculateDistanceMeters(p, projection);
}

/**
 * Evaluates GPS Quality based on accuracy accuracyMeters
 */
export function evaluateGpsQuality(accuracyMeters: number): 'GOOD' | 'AVERAGE' | 'POOR' {
  if (accuracyMeters <= 10) return 'GOOD';
  if (accuracyMeters <= 25) return 'AVERAGE';
  return 'POOR';
}

/**
 * Estimates speed in km/h from two positions and timestamp difference (seconds)
 */
export function calculateSpeedKmh(
  prevCoord: Coordinates,
  currCoord: Coordinates,
  timeDiffSeconds: number
): number {
  if (timeDiffSeconds <= 0) return 0;
  const distMeters = calculateDistanceMeters(prevCoord, currCoord);
  const speedMps = distMeters / timeDiffSeconds;
  return Math.round(speedMps * 3.6);
}
