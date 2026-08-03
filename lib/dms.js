import { wrap90, wrap180 } from './wrap.js';

/* Degree-minutes-seconds (& cardinal directions) separator character */
const SEPARATOR = '\u202f'; // U+202F = 'narrow no-break space'

/**
 * Parses string representing degrees/minutes/seconds into numeric degrees.
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW); a variety of separators are accepted. Examples -3.62,
 * '3 37 12W', '3°37′12″W'.
 *
 * Thousands/decimal separators must be comma/dot; use Dms.fromLocale to convert locale-specific
 * thousands/decimal separators.
 *
 * @param   {string|number} dms - Degrees or deg/min/sec in variety of formats.
 * @returns {number}        Degrees as decimal number.
 *
 * @example
 *   const lat = Dms.parse('51° 28′ 40.37″ N');
 *   const lon = Dms.parse('000° 00′ 05.29″ W');
 *   const p1 = new LatLon(lat, lon); // 51.4779°N, 000.0015°W
 */
export function parse(dms) {
  // check for signed decimal degrees without NSEW, if so return it directly
  if (!Number.isNaN(Number.parseFloat(dms)) && Number.isFinite(dms)) {
    return Number(dms);
  }

  // strip off any sign or compass dir'n & split out separate d/m/s
  const dmsParts = String(dms)
    .trim()
    .replace(/^-/, '')
    .replace(/[NSEW]$/i, '')
    .split(/[^0-9.,]+/);
  if (dmsParts.at(-1) === '') {
    dmsParts.splice(dmsParts.length - 1); // from trailing symbol
  }

  // and convert to decimal degrees...
  let deg = null;
  switch (dmsParts.length) {
    case 3: // interpret 3-part result as d/m/s
      deg = dmsParts[0] / 1 + dmsParts[1] / 60 + dmsParts[2] / 3600;
      break;
    case 2: // interpret 2-part result as d/m
      deg = dmsParts[0] / 1 + dmsParts[1] / 60;
      break;
    case 1: // just d (possibly decimal) or non-separated dddmmss
      deg = dmsParts[0];
      // check for fixed-width unseparated format eg 0033709W
      //if (/[NS]/i.test(dmsParts)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
      //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600;
      break;
    default:
      return Number.NaN;
  }
  if (/^-|[WS]$/i.test(dms.trim())) {
    deg = -deg; // take '-', west and south as -ve
  }

  return Number(deg);
}

/**
 * Converts decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added.
 *  - degrees are zero-padded to 3 digits; for degrees latitude, use .slice(1) to remove leading
 *    zero.
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=d] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=4|2|0] - Number of decimal places to use – default 4 for d, 2 for dm, 0 for dms.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
export function toDms(deg, format = 'd', dp = undefined) {
  if (deg == null) {
    return null;
  }
  if (Number.isNaN(deg)) {
    return null; // give up here if we can't make a number from deg
  }
  if (typeof deg === 'string' && deg.trim() === '') {
    return null;
  }
  if (typeof deg === 'boolean') {
    return null;
  }
  if (typeof deg === 'number' && !Number.isFinite(deg)) {
    return null;
  }

  // default values
  if (dp == null) {
    switch (format) {
      case 'd':
      case 'deg':
        dp = 4;
        break;
      case 'dm':
      case 'deg+min':
        dp = 2;
        break;
      case 'dms':
      case 'deg+min+sec':
        dp = 0;
        break;
      default:
        format = 'd';
        dp = 4;
        break; // be forgiving on invalid format
    }
  }

  deg = Math.abs(deg); // (unsigned result ready for appending compass dir'n)

  let dms = null;
  let d = null;
  let m = null;
  let s = null;
  switch (format) {
    case 'dm':
    case 'deg+min':
      d = Math.floor(deg); // get component deg
      m = ((deg * 60) % 60).toFixed(dp); // get component min & round/right-pad
      if (m >= 60) {
        m = (0).toFixed(dp);
        d++;
      } // check for rounding up
      d = `000${d}`.slice(-3); // left-pad with leading zeros
      if (m < 10) {
        m = `0${m}`; // left-pad with leading zeros (note may include decimals)
      }
      dms = `${d}°${SEPARATOR}${m}′`;
      break;
    case 'dms':
    case 'deg+min+sec':
      d = Math.floor(deg); // get component deg
      m = Math.floor((deg * 3600) / 60) % 60; // get component min
      s = ((deg * 3600) % 60).toFixed(dp); // get component sec & round/right-pad
      if (s >= 60) {
        s = (0).toFixed(dp);
        m++;
      } // check for rounding up
      if (m >= 60) {
        m = 0;
        d++;
      } // check for rounding up
      d = `000${d}`.slice(-3); // left-pad with leading zeros
      m = `00${m}`.slice(-2); // left-pad with leading zeros
      if (s < 10) {
        s = `0${s}`; // left-pad with leading zeros (note may include decimals)
      }
      dms = `${d}°${SEPARATOR}${m}′${SEPARATOR}${s}″`;
      break;
    default: // invalid format spec!
      d = deg.toFixed(dp); // round/right-pad degrees
      if (d < 100) {
        d = `0${d}`; // left-pad with leading zeros (note may include decimals)
      }
      if (d < 10) {
        d = `0${d}`;
      }
      dms = `${d}°`;
      break;
  }

  return dms;
}

/**
 * Converts numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S).
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=d] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=4|2|0] - Number of decimal places to use – default 4 for d, 2 for dm, 0 for dms.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 *
 * @example
 *   const lat = Dms.toLat(-3.62, 'dms'); // 3°37′12″S
 */
export function toLat(deg, format, dp) {
  const lat = toDms(wrap90(deg), format, dp);
  return lat == null ? '–' : lat.slice(1) + SEPARATOR + (deg < 0 ? 'S' : 'N'); // knock off initial '0' for lat!
}

/**
 * Convert numeric degrees to deg/min/sec longitude (3-digit degrees, suffixed with E/W).
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=d] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=4|2|0] - Number of decimal places to use – default 4 for d, 2 for dm, 0 for dms.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 *
 * @example
 *   const lon = Dms.toLon(-3.62, 'dms'); // 3°37′12″W
 */
export function toLon(deg, format, dp) {
  const lon = toDms(wrap180(deg), format, dp);
  return lon == null ? '–' : lon + SEPARATOR + (deg < 0 ? 'W' : 'E');
}
