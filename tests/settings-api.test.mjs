import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:http';
import { createOperations, DEFAULT_SETTINGS, installOperations } from '../index.js';
import { createSettingsAccess, createSettingsHandler } from '../settings-api.js';
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'offwork-settings-api-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}
test('stable migration preserves original bytes and never overwrites an existing target', async (t) => {
  const dir = await fixture(t),
    legacy = join(dir, 'legacy.json'),
    target = join(dir, 'storage', 'settings.json');
  const bytes = JSON.stringify({ ...DEFAULT_SETTINGS, monthlySalary: 12345 });
  await writeFile(legacy, bytes);
  const operate = createOperations(target, { legacyFile: legacy });
  const result = await operate('get');
  assert.equal(result.ok, true);
  assert.equal(result.settings.monthlySalary, 12345);
  assert.equal(await readFile(legacy, 'utf8'), bytes);
  assert.equal((await stat(target)).mode & 0o777, 0o600);
  await operate('set', { monthlySalary: 444 });
  await writeFile(legacy, JSON.stringify(DEFAULT_SETTINGS));
  assert.equal(
    (await createOperations(target, { legacyFile: legacy })('get')).settings.monthlySalary,
    444,
  );
});
test('corrupt legacy data fails closed without creating a defaults file', async (t) => {
  const dir = await fixture(t),
    legacy = join(dir, 'legacy.json'),
    target = join(dir, 'storage', 'settings.json');
  await writeFile(legacy, '{broken');
  const result = await createOperations(target, { legacyFile: legacy })('get');
  assert.equal(result.ok, false);
  await assert.rejects(readFile(target), { code: 'ENOENT' });
  assert.equal(await readFile(legacy, 'utf8'), '{broken');
});
test('UI settings API rejects cross-origin, missing header and non-JSON writes', async (t) => {
  const dir = await fixture(t),
    operate = createOperations(join(dir, 'settings.json')),
    access = createSettingsAccess(dir);
  const server = createServer(createSettingsHandler(operate, access));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  t.after(() => new Promise((r) => server.close(r)));
  const url = `http://127.0.0.1:${server.address().port}/offwork-clock/settings`;
  assert.equal((await fetch(url)).status, 403);
  assert.equal(
    (await fetch(url, { headers: { 'x-offwork-client': '1', 'sec-fetch-site': 'cross-site' } }))
      .status,
    403,
  );
  assert.equal(
    (await fetch(url, { headers: { 'x-offwork-client': '1', origin: 'https://evil.example' } }))
      .status,
    403,
  );
  const headers = { 'x-offwork-client': '1', 'content-type': 'application/json' };
  assert.equal((await (await fetch(url, { headers })).json()).agentAccess, false);
  assert.equal(
    (await fetch(url, { method: 'POST', headers: { 'x-offwork-client': '1' }, body: '{}' })).status,
    415,
  );
  const saved = await (
    await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'set', settings: { dailySalary: 234 } }),
    })
  ).json();
  assert.equal(saved.settings.dailySalary, 234);
  await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ action: 'access', allowed: true }),
  });
  assert.equal(await access.get(), true);
  assert.equal(
    (await fetch(url, { method: 'POST', headers, body: 'x'.repeat(17000) })).status,
    413,
  );
});
test('agent salary access defaults off, can be explicitly enabled and revoked', async (t) => {
  const dir = await fixture(t),
    operate = createOperations(join(dir, 'settings.json')),
    access = createSettingsAccess(dir);
  let tool;
  installOperations(
    {
      effect: (fn) => fn(),
      commands: { register: () => () => {} },
      tools: {
        register: (t) => {
          tool = t;
          return () => {};
        },
      },
    },
    operate,
    access,
  );
  assert.equal((await tool.execute({ action: 'get' })).ok, false);
  await access.set(true);
  assert.equal((await tool.execute({ action: 'get' })).ok, true);
  await access.set(false);
  assert.equal((await tool.execute({ action: 'set', settings: { monthlySalary: 777 } })).ok, false);
  assert.equal((await operate('get')).configured, false);
});
