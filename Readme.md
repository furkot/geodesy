[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# geodesy

Small subset of [geodesy] functionality operating on `[lon,lat]` points.

## Install

```sh
$ npm install --save @furkot/geodesy
```

## Usage

```js
import { distance, initialBearing, alongTrackDistance, crossTrackDistance, intermediatePoint } from '@furkot/geodesy/spherical';

// Calculate distance between two points
const p1 = [0.119, 52.205];
const p2 = [2.351, 48.857];
const d = distance(p1, p2); // 404.3×10³ m

// Calculate initial bearing
const b1 = initialBearing(p1, p2); // 156.2°

// Calculate along-track distance
const pCurrent = [-0.7972, 53.2611];
const dAlong = alongTrackDistance(pCurrent, p1, p2); // 62.331 km

// Calculate cross-track distance
const dCross = crossTrackDistance(pCurrent, p1, p2); // -307.5 m

// Calculate intermediate point
const pInt = intermediatePoint(p1, p2, 0.25); // [ 0.7073, 51.3721 ]
```

```js
import { parse, toDms, toLat, toLon } from '@furkot/geodesy/dms';

// Parse DMS string to decimal degrees
const lat = parse('51° 28′ 40.37″ N'); // 51.4779
const lon = parse('000° 00′ 05.29″ W'); // -0.0015

// Convert decimal degrees to DMS string
const dmsLat = toDms(lat, 'dms'); // 51° 28′ 40.37″
const dmsLon = toDms(lon, 'dms'); // 000° 00′ 05.29″

// Convert decimal degrees to latitude string
const latStr = toLat(lat, 'dms'); // 51° 28′ 40.37″ N

// Convert decimal degrees to longitude string
const lonStr = toLon(lon, 'dms'); // 000° 00′ 05.29″ W
```

## API

### spherical
- `distance(from, to, radius)`: Calculates the distance between two points on the Earth's surface.
- `initialBearing(from, to)`: Returns the initial bearing from one point to another.
- `alongTrackDistance(point, start, end, radius)`: Calculates how far a point is along a path from a start point to an end point.
- `crossTrackDistance(point, start, end, radius)`: Returns the distance from a point to a great circle path.
- `intermediatePoint(start, end, fraction)`: Returns the point at a given fraction between two points.

### dms
- `parse(dms)`: Parses string representing degrees/minutes/seconds into numeric degrees.
- `toLat(deg, format, dp)`: Converts numeric degrees to deg/min/sec latitude.
- `toLon(deg, format, dp)`: Converts numeric degrees to deg/min/sec longitude.

## [License][LICENSE]

MIT © 2014 Chris Veness
MIT © 2026 [Damian Krzeminski](https://pirxpilot.me)

[geodesy]: https://npmjs.org/package/geodesy

[npm-image]: https://img.shields.io/npm/v/@furkot/geodesy
[npm-url]: https://npmjs.org/package/@furkot/geodesy

[build-url]: https://github.com/furkot/geodesy/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/furkot/geodesy/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@furkot/geodesy
[deps-url]: https://libraries.io/npm/@furkot%2Fgeodesy
