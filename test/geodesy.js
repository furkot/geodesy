import test from 'node:test';
import { alongTrackDistance, crossTrackDistance, distance, initialBearing, intermediatePoint } from '../lib/geodesy.js';

const cambridge = [0.119, 52.205];
const paris = [2.351, 48.857];
const lax = [-118.4, 33.95];
const jfk = [-73.78333, 40.63333];

const bradwell = [-1.7297, 53.3206];
const dunham = [-0.7972, 53.2611];
const partney = [0.1334, 53.1887];

test('distance', t => {
  t.assert.equal(distance(cambridge, paris).toFixed(), '404279');
  t.assert.equal(distance(cambridge, paris, 3959).toFixed(1), '251.2');
});

test('initialBearing', t => {
  t.assert.ok(Number.isNaN(initialBearing(cambridge, cambridge)), 'should be NaN when from and to are the same');

  t.assert.equal(initialBearing(lax, jfk).toPrecision(2), '66');

  t.assert.equal(initialBearing(paris, cambridge).toFixed(1), '337.9');

  t.assert.equal(initialBearing(cambridge, paris).toFixed(1), '156.2');
});

test('alongTrackDistance', t => {
  t.assert.equal(alongTrackDistance(dunham, bradwell, partney).toPrecision(4), '6.233e+4');

  t.assert.equal(alongTrackDistance([1, 1], [0, 0], [2, 0]).toPrecision(4), '1.112e+5');
  t.assert.equal(alongTrackDistance([1, -1], [0, 0], [2, 0]).toPrecision(4), '1.112e+5');
  t.assert.equal(alongTrackDistance([-1, -1], [0, 0], [2, 0]).toPrecision(4), '-1.112e+5');
  t.assert.equal(alongTrackDistance([-1, 1], [0, 0], [2, 0]).toPrecision(4), '-1.112e+5');
  t.assert.equal(alongTrackDistance([0, 10], [0, 10], [2, 0]), 0);

  const r = (180 * 60) / Math.PI; // earth radius in nautical miles
  const d = [-116.5, 34.5];

  t.assert.equal(alongTrackDistance(d, lax, jfk, r).toPrecision(5), '99.588');
});

test('crossTrackDistance', t => {
  t.assert.equal(crossTrackDistance(dunham, bradwell, partney).toPrecision(4), '-307.5');

  t.assert.equal(crossTrackDistance([1, 10], [0, 0], [2, 0]).toPrecision(4), '-1.112e+6');

  t.assert.equal(crossTrackDistance([1, 1], [0, 0], [2, 0]).toPrecision(4), '-1.112e+5');
  t.assert.equal(crossTrackDistance([1, -1], [0, 0], [2, 0]).toPrecision(4), '1.112e+5');
  t.assert.equal(crossTrackDistance([-1, -1], [0, 0], [2, 0]).toPrecision(4), '1.112e+5');
  t.assert.equal(crossTrackDistance([-1, 1], [0, 0], [2, 0]).toPrecision(4), '-1.112e+5');
  t.assert.equal(crossTrackDistance([0, 10], [0, 10], [2, 0]), 0);

  const r = (180 * 60) / Math.PI; // earth radius in nautical miles
  const d = [-116.5, 34.5];

  t.assert.equal(crossTrackDistance(d, lax, jfk, r).toPrecision(5), '7.4523');
});

test('intermediatePointTo', t => {
  t.assert.equal(format(intermediatePoint(cambridge, paris, 0.25)), '0.7073, 51.3721');
  t.assert.equal(format(intermediatePoint(cambridge, cambridge, 0.25)), '0.1190, 52.2050');
  t.assert.equal(format(intermediatePoint(lax, jfk, 100 / 2144)), '-116.5516, 34.6169');
  t.assert.equal(format(intermediatePoint(lax, jfk, 0.4)), '-101.6262, 38.6694');
});

function format(arr) {
  return arr.map(x => x.toFixed(4)).join(', ');
}
