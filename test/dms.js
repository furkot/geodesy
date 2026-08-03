import { describe, it } from 'node:test';
import { parse, toDms, toLat, toLon } from '../lib/dms.js';

describe('parse', () => {
  it('0.0°', t => t.assert.equal(parse('0.0°'), 0));
  it('0°', t => t.assert.equal(parse('0°'), 0));
  it('000 00 00 ', t => t.assert.equal(parse('000 00 00 '), 0));
  it('000°00′00″', t => t.assert.equal(parse('000°00′00″'), 0));
  it('000°00′00.0″', t => t.assert.equal(parse('000°00′00.0″'), 0));
  it('num 0', t => t.assert.equal(parse(0), 0));

  it('invalid format', t => t.assert.ok(Number.isNaN(parse('000°00′00.0″00.0″'))));
});

describe('parse variations', () => {
  // including whitespace, different d/m/s symbols (ordinal, ascii/typo quotes)
  const variations = [
    '45.76260',
    '45.76260 ',
    '45.76260°',
    '45°45.756′',
    '45° 45.756′',
    '45 45.756',
    '45°45′45.36″',
    '45º45\'45.36"',
    '45°45’45.36”',
    '45 45 45.36 ',
    '45° 45′ 45.36″',
    '45º 45\' 45.36"',
    '45° 45’ 45.36”'
  ];
  for (const v in variations) {
    it(`parse dms variations v = ‘${variations[v]}’`, t => t.assert.equal(parse(variations[v]), 45.7626));
  }
  for (const v in variations) {
    it(`parse dms variations v = ‘-${variations[v]}’`, t => t.assert.equal(parse(`-${variations[v]}`), -45.7626));
  }
  for (const v in variations) {
    it(`parse dms variations v = ‘${variations[v]}N'`, t => t.assert.equal(parse(`${variations[v]}N`), 45.7626));
  }
  for (const v in variations) {
    it(`parse dms variations v = ‘${variations[v]}S'`, t => t.assert.equal(parse(`${variations[v]}S`), -45.7626));
  }
  for (const v in variations) {
    it(`parse dms variations v = ‘${variations[v]}E'`, t => t.assert.equal(parse(`${variations[v]}E`), 45.7626));
  }
  for (const v in variations) {
    it(`parse dms variations v = ‘${variations[v]}W'`, t => t.assert.equal(parse(`${variations[v]}W`), -45.7626));
  }
  for (const v in variations) {
    it(`parse dms variations v = ‘${variations[v]} N'`, t => t.assert.equal(parse(`${variations[v]} N`), 45.7626));
  }
  for (const v in variations) {
    it(`parse dms variations v = ‘${variations[v]} S'`, t => t.assert.equal(parse(`${variations[v]} S`), -45.7626));
  }
  for (const v in variations) {
    it(`parse dms variations v = ‘${variations[v]} E'`, t => t.assert.equal(parse(`${variations[v]} E`), 45.7626));
  }
  for (const v in variations) {
    it(`parse dms variations v = ‘${variations[v]} W'`, t => t.assert.equal(parse(`${variations[v]} W`), -45.7626));
  }
  it('parse dms variations ' + ' ws before+after', t => t.assert.equal(parse(' 45°45′45.36″ '), 45.7626));
});

describe('parse out-of-range (should be normalised externally)', () => {
  it('parse 185', t => t.assert.equal(parse('185'), 185));
  it('parse 365', t => t.assert.equal(parse('365'), 365));
  it('parse -185', t => t.assert.equal(parse('-185'), -185));
  it('parse -365', t => t.assert.equal(parse('-365'), -365));
});

describe('output variations', () => {
  it('output dms ', t => t.assert.equal(toDms(9.1525), '009.1525°'));
  it('output dms ', t => t.assert.equal(toDms('9.1525'), '009.1525°'));
  it('output dms d', t => t.assert.equal(toDms(9.1525, 'd'), '009.1525°'));
  it('output dms dm', t => t.assert.equal(toDms(9.1525, 'dm'), '009° 09.15′'));
  it('output dms dms', t => t.assert.equal(toDms(9.1525, 'dms'), '009° 09′ 09″'));
  it('output dms dm,6', t => t.assert.equal(toDms(9.1525, 'd', 6), '009.152500°'));
  it('output dms dm,4', t => t.assert.equal(toDms(9.1525, 'dm', 4), '009° 09.1500′'));
  it('output dms dms,2', t => t.assert.equal(toDms(9.1525, 'dms', 2), '009° 09′ 09.00″'));
  it('output dms x', t => t.assert.equal(toDms(9.1525, 'x'), '009.1525°'));
  it('output dms x,6', t => t.assert.equal(toDms(9.1525, 'x', 6), '009.152500°'));
  it('boolean is invalid', t => t.assert.equal(toDms(true, 'x', 6), null));
  it('infinity is invalid', t => t.assert.equal(toDms(Number.POSITIVE_INFINITY), null));
  it('undefined is invalid', t => t.assert.equal(toDms(undefined), null));
});

describe('toLat', () => {
  it('toLat num', t => t.assert.equal(toLat(51.2, 'dms'), '51° 12′ 00″ N'));
  it('toLat num', t => t.assert.equal(toLat(51.2, 'd', 3), '51.200° N'));
  it('toLat rnd-up', t => t.assert.equal(toLat(51.19999999999999, 'dm'), '51° 12.00′ N'));
  it('toLat rnd-up', t => t.assert.equal(toLat(51.19999999999999, 'dms'), '51° 12′ 00″ N'));
  it('toLat str', t => t.assert.equal(toLat('51.2', 'dms'), '51° 12′ 00″ N'));
  it('toLat xxx', t => t.assert.equal(toLat('xxx', 'dms'), '–'));
});

describe('toLon', () => {
  it('toLon num', t => t.assert.equal(toLon(0.33, 'dms'), '000° 19′ 48″ E'));
  it('toLon str', t => t.assert.equal(toLon('0.33', 'dms'), '000° 19′ 48″ E'));
  it('toLon xxx', t => t.assert.equal(toLon('xxx', 'dms'), '–'));
});

describe('toDms', () => {
  it('empty string', t => t.assert.equal(toDms('   ', 'd'), null));
  it('toDMS rnd-up', t => t.assert.equal(toDms(51.99999999999999, 'd'), '052.0000°'));
  it('toDMS rnd-up', t => t.assert.equal(toDms(51.99999999999999, 'dm'), '052° 00.00′'));
  it('toDMS rnd-up', t => t.assert.equal(toDms(51.99999999999999, 'dms'), '052° 00′ 00″'));
  it('toDMS rnd-up', t => t.assert.equal(toDms(51.19999999999999, 'd'), '051.2000°'));
  it('toDMS rnd-up', t => t.assert.equal(toDms(51.19999999999999, 'dm'), '051° 12.00′'));
  it('toDMS rnd-up', t => t.assert.equal(toDms(51.19999999999999, 'dms'), '051° 12′ 00″'));
});
