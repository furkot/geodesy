/**
 * Constrain degrees to range -90..+90 (for latitude); e.g. -91 => -89, 91 => 89.
 *
 * @param {number} x - degrees to wrap
 * @returns degrees within range -90..+90.
 */
export function wrap90(x) {
  if (-90 <= x && x <= 90) {
    return x; // avoid rounding due to arithmetic ops if within range
  }

  // latitude wrapping requires a triangle wave function; a general triangle wave is
  //     f(x) = 4a/p ⋅ | (x-p/4)%p - p/2 | - a
  // where a = amplitude, p = period, % = modulo; however, JavaScript '%' is a remainder operator
  // not a modulo operator - for modulo, replace 'x%n' with '((x%n)+n)%n'
  const a = 90;
  const p = 360;
  return ((4 * a) / p) * Math.abs(((((x - p / 4) % p) + p) % p) - p / 2) - a;
}

/**
 * Constrain degrees to range -180..+180 (for longitude); e.g. -181 => 179, 181 => -179.
 *
 * @param {number} x - degrees to wrap
 * @returns degrees within range -180..+180.
 */
export function wrap180(x) {
  if (-180 <= x && x <= 180) {
    return x; // avoid rounding due to arithmetic ops if within range
  }

  // longitude wrapping requires a sawtooth wave function; a general sawtooth wave is
  //     f(x) = (2ax/p - p/2) % p - a
  // where a = amplitude, p = period, % = modulo; however, JavaScript '%' is a remainder operator
  // not a modulo operator - for modulo, replace 'x%n' with '((x%n)+n)%n'
  const a = 180;
  const p = 360;
  return (((((2 * a * x) / p - p / 2) % p) + p) % p) - a;
}

/**
 * Constrain degrees to range 0..360 (for bearings); e.g. -1 => 359, 361 => 1.
 *
 * @param {number} x - degrees to wrap
 * @returns degrees within range 0..360.
 */
export function wrap360(x) {
  if (0 <= x && x < 360) {
    return x; // avoid rounding due to arithmetic ops if within range
  }

  // bearing wrapping requires a sawtooth wave function with a vertical offset equal to the
  // amplitude and a corresponding phase shift; this changes the general sawtooth wave function from
  //     f(x) = (2ax/p - p/2) % p - a
  // to
  //     f(x) = (2ax/p) % p
  // where a = amplitude, p = period, % = modulo; however, JavaScript '%' is a remainder operator
  // not a modulo operator - for modulo, replace 'x%n' with '((x%n)+n)%n'
  const a = 180;
  const p = 360;
  return ((((2 * a * x) / p) % p) + p) % p;
}
