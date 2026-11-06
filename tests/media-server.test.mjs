import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createMediaHandler, mediaRange, registerMediaRoute } from '../media-server.js';
import { MEDIA_ROUTE } from '../media-manifest.js';
import { petClipUrls } from '../pet-video.js';

async function fixture(t, corrupt = false) {
  const dir = await mkdtemp(join(tmpdir(), 'offwork-media-'));
  const bytes = Buffer.from(Array.from({ length: 256 }, (_, i) => i));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const key = sha256 + '/clip.webm';
  await writeFile(join(dir, 'clip.webm'), corrupt ? Buffer.alloc(bytes.length) : bytes);
  await writeFile(join(dir, 'data.json'), 'private fixture, never serve');
  const assets = { [key]: { file: 'clip.webm', size: bytes.length, sha256 } };
  const server = createServer(createMediaHandler({ assets, root: pathToFileURL(dir + '/') }));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
    await rm(dir, { recursive: true, force: true });
  });
  return {
    dir,
    bytes,
    sha256,
    key,
    origin: `http://127.0.0.1:${server.address().port}`,
    url: `http://127.0.0.1:${server.address().port}${MEDIA_ROUTE}/${key}`,
  };
}

test('media endpoint serves immutable verified bytes, HEAD and conditional responses', async (t) => {
  const f = await fixture(t);
  const response = await fetch(f.url);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-type'), 'video/webm');
  assert.match(response.headers.get('cache-control'), /immutable/);
  assert.equal(response.headers.get('accept-ranges'), 'bytes');
  assert.equal(response.headers.get('cross-origin-resource-policy'), 'same-origin');
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), f.bytes);
  const head = await fetch(f.url, { method: 'HEAD', headers: { Range: 'bytes=10-20' } });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('content-length'), '256');
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  const cached = await fetch(f.url, {
    headers: { 'If-None-Match': `W/"${f.sha256}"`, Range: 'bytes=999-' },
  });
  assert.equal(cached.status, 304);
  assert.equal((await cached.arrayBuffer()).byteLength, 0);
});

test('single byte ranges, suffixes and If-Range allow seeking without loading other resources', async (t) => {
  const f = await fixture(t);
  for (const [header, start, end] of [
    ['bytes=20-31', 20, 31],
    ['bytes=-7', 249, 255],
    ['bytes=250-', 250, 255],
    ['bytes=250-999', 250, 255],
  ]) {
    const response = await fetch(f.url, {
      headers: { Range: header, 'If-Range': `"${f.sha256}"` },
    });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get('content-range'), `bytes ${start}-${end}/256`);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), f.bytes.subarray(start, end + 1));
  }
  const changed = await fetch(f.url, { headers: { Range: 'bytes=1-2', 'If-Range': '"other"' } });
  assert.equal(changed.status, 200);
  assert.deepEqual(Buffer.from(await changed.arrayBuffer()), f.bytes);
  for (const header of [
    'bytes=256-',
    'bytes=-0',
    'bytes=4-2',
    'bytes=0-1,4-5',
    'bytes=9999999999999999999999-',
  ]) {
    const response = await fetch(f.url, { headers: { Range: header } });
    assert.equal(response.status, 416);
    assert.equal(response.headers.get('content-range'), 'bytes */256');
  }
  assert.equal(mediaRange(['bytes=0-1'], 256), null);
});

test('unknown names, traversal and mutating requests never expose adjacent files', async (t) => {
  const f = await fixture(t);
  for (const path of [
    'data.json',
    'constructor',
    '%2e%2e/data.json',
    'a/../../../data.json',
    f.key + '/../data.json',
    '%2fdata.json',
  ]) {
    const response = await fetch(f.origin + MEDIA_ROUTE + '/' + path);
    assert.equal(response.status, 404);
    assert.equal(await response.text(), '');
  }
  const post = await fetch(f.url, { method: 'POST', body: 'overwrite' });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
  const response = await fetch(f.url);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), f.bytes);
});

test('integrity failures are not cached and a repaired asset can be retried', async (t) => {
  const f = await fixture(t, true);
  const bad = await fetch(f.url);
  assert.equal(bad.status, 500);
  assert.equal(await bad.text(), '');
  assert.equal(bad.headers.get('cache-control'), 'no-store');
  await writeFile(join(f.dir, 'clip.webm'), f.bytes);
  const retry = await fetch(f.url);
  assert.equal(retry.status, 200);
  assert.deepEqual(Buffer.from(await retry.arrayBuffer()), f.bytes);
});

test('media files cannot be replaced by a symlink to another local file', async (t) => {
  if (process.platform === 'win32') return t.skip('POSIX symlink protection');
  const f = await fixture(t);
  await rm(join(f.dir, 'clip.webm'));
  await symlink(join(f.dir, 'data.json'), join(f.dir, 'clip.webm'));
  const response = await fetch(f.url);
  assert.equal(response.status, 500);
  assert.equal(await response.text(), '');
});

test('route registration is optional and owned by the web service scope', () => {
  registerMediaRoute({});
  let activate,
    route,
    disposed = false;
  registerMediaRoute({
    inject(names, callback) {
      assert.deepEqual(names, ['webServer']);
      activate = callback;
    },
  });
  assert.equal(route, undefined);
  const disposers = [];
  activate({
    effect(fn) {
      disposers.push(fn());
    },
    webServer: {
      register(value) {
        route = value;
        return () => {
          disposed = true;
        };
      },
    },
  });
  assert.equal(route.path, MEDIA_ROUTE);
  assert.equal(route.kind, 'prefix');
  disposers[0]();
  assert.equal(disposed, true);
});

test('media URLs respect application mount paths without carrying auth queries or external URLs', () => {
  const relative = 'offwork-clock/media/abc/idle.webm';
  const models = {
    short: {
      idle: relative,
      external: 'https://elsewhere.test/movie',
      traversal: 'offwork-clock/media/../../data.json',
    },
  };
  assert.deepEqual(petClipUrls(models, 'https://example.test/app/?token=test#fragment'), {
    short: { idle: 'https://example.test/app/' + relative },
  });
  assert.deepEqual(petClipUrls(models, 'file:///tmp/index.html'), {});
  assert.deepEqual(petClipUrls(models, 'not a URL'), {});
});
