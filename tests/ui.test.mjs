import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { formatDuration, clampPosition, normalizeView, clampOpacity, decodeCommand, changedSettings } from '../ui-utils.js';
test('duration rounds countdown upward and supports >24 hours', () => {
  assert.equal(formatDuration(0), '00:00:00'); assert.equal(formatDuration(3661), '01:01:01');
  assert.equal(formatDuration(.1), '00:00:01'); assert.equal(formatDuration(90000), '25:00:00');
  assert.equal(formatDuration(NaN), '--:--:--'); assert.equal(formatDuration(-1), '--:--:--');
});
test('position stays visible when viewport shrinks', () => {
  assert.deepEqual(clampPosition({ x: 9000, y: -20 }, { width: 800, height: 600 }, { width: 330, height: 400 }), { x: 458, y: 12 });
  assert.deepEqual(clampPosition(null, { width: 200, height: 200 }, { width: 330, height: 400 }), { x: 12, y: 12 });
});
test('view defaults: compact, salary hidden, 82% glass', () => {
  assert.deepEqual(normalizeView(null), { mini: true, masked: true, opacity: 0.82, position: null });
  assert.deepEqual(normalizeView({ mini: false, masked: false, opacity: 0.5, position: { x: 1, y: 2 } }),
    { mini: false, masked: false, opacity: 0.5, position: { x: 1, y: 2 } });
  assert.equal(normalizeView({ mini: 'yes' }).mini, true);
  assert.equal(normalizeView({ masked: 'false' }).masked, true);
});
test('malformed positions and opacity are repaired, not trusted', () => {
  assert.deepEqual(normalizeView({ mini: 'yes', masked: true, position: { x: 'oops', y: 2 } }), { mini: true, masked: true, opacity: 0.82, position: null });
  assert.equal(normalizeView({ opacity: 0 }).opacity, 0.3);
  assert.equal(normalizeView({ opacity: 9 }).opacity, 1);
  assert.equal(normalizeView({ opacity: 'x' }).opacity, 0.82);
  assert.equal(clampOpacity(0.55), 0.55);
});
test('salary stays hidden until explicitly revealed, including on first paint', () => {
  assert.equal(normalizeView(null).masked, true);
  assert.equal(normalizeView({}).masked, true);
  assert.equal(normalizeView({ masked: false }).masked, false);
});
test('RPC decodes every failure layer and real command envelopes', () => {
  const response = (data, kind = 'success') => ({ ok: true, value: { result: { kind, text: JSON.stringify(data) } } });
  assert.deepEqual(decodeCommand(response({ ok: true, settings: { monthlySalary: 1000 }, configured: true })).settings, { monthlySalary: 1000 });
  assert.throws(() => decodeCommand({ ok: false, error: { message: 'permission denied' } }), /permission denied/);
  assert.throws(() => decodeCommand({ ok: true }), /Command unavailable/);
  assert.throws(() => decodeCommand(response({ ok: false, error: 'bad shift' }, 'error')), /bad shift/);
  assert.throws(() => decodeCommand({ ok: true, value: { result: { kind: 'success', text: 'oops' } } }), /Invalid/);
});
test('partial saves preserve unrelated edits from another caller', () => {
  assert.deepEqual(changedSettings({ salary: 1, days: [1, 2], start: '09:00' }, { salary: 2, days: [1, 2], start: '09:00' }), { salary: 2 });
});
test('Client uses the exact tested engine and a single surface', async () => {
  const source = await readFile(new URL('../client.source.js', import.meta.url), 'utf8');
  const built = await readFile(new URL('../client.js', import.meta.url), 'utf8');
  const engine = (await readFile(new URL('../clock.js', import.meta.url), 'utf8')).replace(/^export /gm, '');
  assert.ok(built.includes(engine));
  assert.match(source, /prefers-reduced-motion:reduce/);
  assert.match(source, /prefers-reduced-transparency:reduce/);
  assert.match(source, /visibilitychange/); assert.match(source, /removeEventListener\('storage'/);
  assert.match(source, /ro\?\.disconnect/); assert.match(source, /generation\.current/);
  assert.doesNotMatch(source, /document\.body|window\.open|fetch\(/);
  assert.match(source, /money\(safeState\.earned\)/);
  assert.match(source, /owc-glass/);
  assert.match(source, /--owc-alpha/);
  assert.match(source, /type: 'range'/);
  assert.match(source, /dragState/);
  assert.ok(source.includes('onPointerMove: dragMove'));
});
test('compact strip stacks time above amount', async () => {
  const source = await readFile(new URL('../client.source.js', import.meta.url), 'utf8');
  const css = source.slice(source.indexOf('.owc-pill{'), source.indexOf('.owc-pill{') + 200);
  assert.match(css, /flex-direction:column/);
  assert.match(source, /className: 'owc-pill-top'/);
  assert.match(source, /className: 'owc-pill-bottom'/);
  assert.ok(source.indexOf("className: 'owc-pill-time'") < source.indexOf("className: 'owc-pill-money'"));
});
test('compact strip keeps both drag surface and expand action; panel keeps collapse', async () => {
  const source = await readFile(new URL('../client.source.js', import.meta.url), 'utf8');
  assert.match(source, /onPointerDown: dragDown/);
  assert.match(source, /mini: false/);
  assert.match(source, /mini: true/);
  assert.match(source, /hasPointerCapture/);
});
