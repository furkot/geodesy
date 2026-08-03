import { wrap360 } from './wrap.js';

// Earth radius according to Google Maps API docs
// https://developers.google.com/maps/documentation/javascript/reference/geometry#spherical
export const EARTH_RADIUS = 6378137;

/**
 * Returns the distance along the surface of the earth between `from` and `to` points.
 *
 * Uses haversine formula: a = sin²(Δφ/2) + cosφ1·cosφ2 · sin²(Δλ/2); d = 2 · atan2(√a, √(a-1)).
 *
 * @param   {[number, number]} from - [longitude, latitude] of source point.
 * @param   {[number, number]} to - [longitude, latitude] of destination point.
 * @param   {number} [radius=EARTH_RADIUS] - Radius of earth (defaults to mean radius in metres).
 * @returns {number} Distance between this point and destination point, in same units as radius.
 * @throws  {TypeError} Invalid radius.
 *
 * @example
 *   const p1 = [0.119, 52.205];
 *   const p2 = [2.351, 48.857];
 *   const d = distance(p1, p2);       // 404.3×10³ m
 *   const m = distance(p1, p2, 3959); // 251.2 miles
 */
export function distance(from, to, radius = EARTH_RADIUS) {
  // a = sin²(Δφ/2) + cos(φ1)⋅cos(φ2)⋅sin²(Δλ/2)
  // δ = 2·atan2(√(a), √(1−a))
  // see mathforum.org/library/drmath/view/51879.html for derivation

  const λ1 = toRadians(from[0]);
  const φ1 = toRadians(from[1]);
  const λ2 = toRadians(to[0]);
  const φ2 = toRadians(to[1]);
  const Δφ = φ2 - φ1;
  const Δλ = λ2 - λ1;

  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

/**
 * Returns the initial bearing from point to destination point.
 *
 * @param   {[number, number]} from - [longitude, latitude] of source point.
 * @param   {[number, number]} to - [longitude, latitude] of destination point.
 * @returns {number} Initial bearing in degrees from north (0°..360°).
 *
 * @example
 *   const p1 = [0.119, 52.205];
 *   const p2 = [2.351, 48.857];
 *   const b1 = initialBearing(p1, p2); // 156.2°
 */
export function initialBearing(from, to) {
  if (from[0] === to[0] && from[1] === to[1]) {
    return Number.NaN; // coincident points
  }

  // tanθ = sinΔλ⋅cosφ2 / cosφ1⋅sinφ2 − sinφ1⋅cosφ2⋅cosΔλ
  // see mathforum.org/library/drmath/view/55417.html for derivation

  const φ1 = toRadians(from[1]);
  const φ2 = toRadians(to[1]);
  const Δλ = toRadians(to[0] - from[0]);

  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const θ = Math.atan2(y, x);

  const bearing = toDegrees(θ);

  return wrap360(bearing);
}

/**
 * Returns how far ‘this’ point is along a path from from start-point, heading towards end-point.
 * That is, if a perpendicular is drawn from ‘this’ point to the (great circle) path, the
 * along-track distance is the distance from the start point to where the perpendicular crosses
 * the path.
 *
 * @param   {[number, number]} point
 * @param   {[number, number]} start - Start point of great circle path.
 * @param   {[number, number]} end - End point of great circle path.
 * @param   {number} [radius=EARTH_RADIUS] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance along great circle to point nearest ‘this’ point.
 *
 * @example
 *   const pCurrent = [-0.7972, 53.2611];
 *   const p1 = [-1.7297, 53.3206];
 *   const p2 = [ 0.1334, 53.1887];
 *   const d = alongTrackDistance(pCurrent, p1, p2);  // 62.331 km
 */
export function alongTrackDistance(point, start, end, radius = EARTH_RADIUS) {
  if (start[0] === point[0] && start[1] === point[1]) {
    return 0;
  }

  const δ13 = distance(start, point, radius) / radius;
  const θ13 = toRadians(initialBearing(start, point));
  const θ12 = toRadians(initialBearing(start, end));

  const δxt = Math.asin(Math.sin(δ13) * Math.sin(θ13 - θ12));

  const δat = Math.acos(Math.cos(δ13) / Math.abs(Math.cos(δxt)));

  return δat * Math.sign(Math.cos(θ12 - θ13)) * radius;
}

/**
 * Returns (signed) distance from point to great circle defined by start-point and
 * end-point.
 *
 * @param   {[number, number]} point
 * @param   {[number, number]} start - Start point of great circle path.
 * @param   {[number, number]} end - End point of great circle path.
 * @param   {number} [radius=EARTH_RADIUS] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance to great circle (-ve if to left, +ve if to right of path).
 *
 * @example
 *   const pCurrent = [-0.7972, 53.2611];
 *   const p1 = [-1.7297, 53.3206];
 *   const p2 = [ 0.1334, 53.1887];
 *   const d = crossTrackDistanceTo(pCurrent, p1, p2);  // -307.5 m
 */
export function crossTrackDistance(point, start, end, radius = EARTH_RADIUS) {
  if (start[0] === point[0] && start[1] === point[1]) {
    return 0;
  }

  const δ13 = distance(point, start, radius) / radius;
  const θ13 = toRadians(initialBearing(start, point));
  const θ12 = toRadians(initialBearing(start, end));

  const δxt = Math.asin(Math.sin(δ13) * Math.sin(θ13 - θ12));

  return δxt * radius;
}

/**
 * Returns the point at given fraction between start point and end point.
 *
 * @param   {[number, number]} start - Latitude/longitude of start point.
 * @param   {[number, number]} end - Latitude/longitude of destination point.
 * @param   {number} fraction - Fraction between the two points (0 = this point, 1 = specified point).
 * @returns {[number, number]} Intermediate point between this point and destination point.
 *
 * @example
 *   const p1 = [0.119, 52.205];
 *   const p2 = [2.351, 48.857];
 *   const pInt = intermediatePoint(p1, p2, 0.25); // [ 0.7073, 51.3721 ]
 */
export function intermediatePoint(start, end, fraction) {
  if (start[0] === end[0] && start[1] === end[1]) {
    return [...start]; // coincident points
  }

  const λ1 = toRadians(start[0]);
  const φ1 = toRadians(start[1]);
  const λ2 = toRadians(end[0]);
  const φ2 = toRadians(end[1]);

  // distance between points
  const Δφ = φ2 - φ1;
  const Δλ = λ2 - λ1;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const A = Math.sin((1 - fraction) * δ) / Math.sin(δ);
  const B = Math.sin(fraction * δ) / Math.sin(δ);

  const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
  const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
  const z = A * Math.sin(φ1) + B * Math.sin(φ2);

  const φ3 = Math.atan2(z, Math.sqrt(x * x + y * y));
  const λ3 = Math.atan2(y, x);

  const lat = toDegrees(φ3);
  const lon = toDegrees(λ3);

  return [lon, lat];
}

function toRadians(n) {
  return (n * Math.PI) / 180;
}

function toDegrees(n) {
  return (n * 180) / Math.PI;
}
