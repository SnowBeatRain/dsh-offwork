import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, stat, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createOperations, DEFAULT_SETTINGS, validateSettings } from '../index.js';

const source = new URL('../index.js', import.meta.url);
const prefix = 'offwork-clock-host-';
async function fixture(t) {
  const root = resolve(tmpdir());
  const dir = await mkdtemp(join(root, prefix));
  t.after(async () => {
    // Never recursively remove anything except our unique direct temporary child.
    assert.equal(dirname(resolve(dir)), root);
    assert.ok(basename(dir).startsWith(prefix));
    assert.notEqual(resolve(dir), root);
    await rm(dir, { recursive: true, force: true });
  });
  const file = join(dir, 'data.json');
  return { dir, file, operate: createOperations(file) };
}

function valid(patch) {
  return validateSettings({ ...DEFAULT_SETTINGS, ...patch });
}

test('defaults remain unsaved; real writes persist privately and can be reopened', async (t) => {
  const { dir, file, operate } = await fixture(t);
  const initial = await operate('get');
  assert.deepEqual(initial, { ok: true, settings: DEFAULT_SETTINGS, configured: false });
  initial.settings.weekdays.push(6);
  assert.deepEqual((await operate('get')).settings.weekdays, [1, 2, 3, 4, 5]);
  assert.deepEqual(await readdir(dir), []);
  const saved = await operate('set', { payMode: 'daily', dailySalary: 500 });
  assert.equal(saved.ok, true);
  assert.equal(saved.configured, true);
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), saved.settings);
  assert.equal((await stat(file)).mode & 0o777, 0o600);
  assert.deepEqual(await createOperations(pathToFileURL(file))('get'), saved);
  assert.deepEqual(await readdir(dir), ['data.json']);
});

test('legacy configuration gains only new defaults, without rewriting on get', async (t) => {
  const { file, operate } = await fixture(t);
  const { payMode, dailySalary, ...legacy } = DEFAULT_SETTINGS;
  legacy.monthlySalary = 12345;
  const bytes = JSON.stringify(legacy);
  await writeFile(file, bytes);
  const migrated = await operate('get');
  assert.deepEqual(migrated, {
    ok: true,
    configured: true,
    settings: { ...DEFAULT_SETTINGS, monthlySalary: 12345 },
  });
  assert.equal(await readFile(file, 'utf8'), bytes);
  assert.equal((await operate('set', { dailySalary: 700 })).settings.monthlySalary, 12345);
  assert.equal(JSON.parse(await readFile(file, 'utf8')).payMode, 'monthly');
});

test('malformed, unknown and incomplete saved data are never overwritten', async (t) => {
  const { file, operate, dir } = await fixture(t);
  for (const bytes of [
    '{broken',
    'null',
    '[]',
    JSON.stringify({ ...DEFAULT_SETTINGS, surprise: true }),
    JSON.stringify({ start: '09:00' }),
  ]) {
    await writeFile(file, bytes);
    assert.equal((await operate('get')).ok, false);
    assert.equal((await operate('set', { monthlySalary: 5 })).ok, false);
    assert.equal(await readFile(file, 'utf8'), bytes);
    assert.deepEqual(await readdir(dir), ['data.json']);
  }
});

test('day and overnight shifts normalize breaks against shift start', () => {
  for (const patch of [
    { start: '22:00', end: '06:00', breakStart: '02:00', breakEnd: '03:00' },
    { start: '22:00', end: '06:00', breakStart: '23:30', breakEnd: '00:30' },
    { start: '22:00', end: '06:00', breakStart: '22:00', breakEnd: '23:00' },
    { start: '22:00', end: '06:00', breakStart: '05:00', breakEnd: '06:00' },
    { start: '22:00', end: '06:00', breakStart: '12:00', breakEnd: '12:00' },
    { breakStart: '00:00', breakEnd: '00:00' },
  ])
    assert.doesNotThrow(() => valid(patch));
  for (const patch of [
    { start: '09:00', end: '09:00' },
    { start: '22:00', end: '06:00' },
    { start: '22:00', end: '06:00', breakStart: '02:00', breakEnd: '01:00' },
    { start: '22:00', end: '06:00', breakStart: '22:00', breakEnd: '06:00' },
    { breakStart: '18:00', breakEnd: '19:00' },
    { breakStart: '12:00', breakEnd: '11:00' },
    { payMode: 'hourly' },
    { dailySalary: -1 },
    { dailySalary: Infinity },
    { monthlySalary: NaN },
    { workdaysPerMonth: 0 },
    { start: '9:00' },
    { weekdays: [1, 1] },
    { timezone: 'not/a-zone' },
    { surprise: true },
  ])
    assert.throws(() => valid(patch), JSON.stringify(patch));
});

test('invalid patches and actions do not create files; queue recovers', async (t) => {
  const { dir, operate } = await fixture(t);
  for (const [action, patch] of [
    ['wat'],
    ['get', {}],
    ['set'],
    ['set', []],
    ['set', { unknown: 1 }],
    ['set', { payMode: 'weekly' }],
  ]) {
    assert.equal((await operate(action, patch)).ok, false);
  }
  assert.deepEqual(await readdir(dir), []);
  assert.equal((await operate('set', {})).configured, true);
});

test('concurrent partial sets serialize and preserve preceding updates', async (t) => {
  const { file, operate, dir } = await fixture(t);
  const patches = [
    { monthlySalary: 22222 },
    { dailySalary: 999 },
    { payMode: 'daily' },
    { timezone: 'UTC' },
  ];
  const pending = patches.map((patch) => operate('set', patch));
  pending.push(operate('set', { unknown: true }));
  for (let i = 0; i < 30; i++) pending.push(operate('set', { dailySalary: 1000 + i }));
  const results = await Promise.all(pending);
  assert.equal(results[4].ok, false);
  assert.ok(results.filter((_, i) => i !== 4).every((result) => result.ok));
  const expected = { ...DEFAULT_SETTINGS, ...Object.assign({}, ...patches), dailySalary: 1029 };
  assert.deepEqual(JSON.parse(await readFile(file, 'utf8')), expected);
  assert.deepEqual((await operate('get')).settings, expected);
  assert.deepEqual(await readdir(dir), ['data.json']);
});

async function adapters(t) {
  const fixtureData = await fixture(t);
  // Import an isolated copy: apply() keeps its real default data URL beside the module,
  // and neither adapter can accidentally reach the user's actual data.json.
  const moduleFile = join(fixtureData.dir, 'host.mjs');
  await writeFile(moduleFile, await readFile(source, 'utf8'));
  await writeFile(join(fixtureData.dir, 'package.json'), '{"type":"module"}');
  for (const name of ['media-server.js', 'media-manifest.js'])
    await writeFile(
      join(fixtureData.dir, name),
      await readFile(new URL('../' + name, import.meta.url)),
    );
  const module = await import(pathToFileURL(moduleFile).href);
  let command;
  let tool;
  module.apply({
    effect: (effect) => effect(),
    commands: {
      register(definition) {
        command = definition;
        return () => {};
      },
    },
    tools: {
      register(definition) {
        tool = definition;
        return () => {};
      },
    },
  });
  const runCommand = async (rawInput) => {
    const response = await command.handler({ rawInput });
    const result = JSON.parse(response.text);
    assert.equal(response.kind, result.ok ? 'success' : 'error');
    return result;
  };
  return { ...fixtureData, tool, command, runCommand };
}

test('command and tool share results, validation, storage and a write queue', async (t) => {
  const { tool, command, runCommand, file } = await adapters(t);
  assert.equal(command.recordInput, false);
  assert.deepEqual(await runCommand('get'), await tool.execute({ action: 'get' }));
  const written = await runCommand('set {"payMode":"daily","dailySalary":600}');
  assert.deepEqual(await tool.execute({ action: 'get' }), written);
  const second = await tool.execute({ action: 'set', settings: { monthlySalary: 25000 } });
  assert.deepEqual(await runCommand('get'), second);
  assert.deepEqual(
    await runCommand('set {"unknown":1}'),
    await tool.execute({ action: 'set', settings: { unknown: 1 } }),
  );
  await Promise.all([
    runCommand('set {"dailySalary":750}'),
    tool.execute({ action: 'set', settings: { timezone: 'UTC' } }),
  ]);
  const stored = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(stored.dailySalary, 750);
  assert.equal(stored.timezone, 'UTC');
  for (const raw of ['get {}', 'set', 'set {bad', 'wat'])
    assert.equal((await runCommand(raw)).ok, false);
  for (const args of [null, [], { action: 'get', unknown: true }])
    assert.equal((await tool.execute(args)).ok, false);
});

test('tool schemas expose new fields, configured flag, and typed literal branches', async (t) => {
  const { tool } = await adapters(t);
  const input = tool.parameters.properties.settings;
  assert.equal(input.additionalProperties, false);
  assert.deepEqual(input.properties.payMode.enum, ['monthly', 'daily']);
  assert.equal(input.properties.dailySalary.type, 'number');
  const [success, failure] = tool.output.schema.oneOf;
  assert.deepEqual(success.properties.ok, { type: 'boolean', const: true });
  assert.deepEqual(failure.properties.ok, { type: 'boolean', const: false });
  assert.ok(success.required.includes('configured'));
  assert.equal(success.properties.configured.type, 'boolean');
  assert.deepEqual(success.properties.settings.required, Object.keys(DEFAULT_SETTINGS));
  assert.equal(success.additionalProperties, false);
  assert.equal(failure.additionalProperties, false);
  const result = await tool.execute({ action: 'get' });
  assert.deepEqual(tool.output.render({}, result), [
    { type: 'text', text: JSON.stringify(result) },
  ]);
});
