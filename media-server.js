import { open } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createHash } from 'node:crypto';
import { MEDIA_ROUTE, MEDIA_ASSETS } from './media-manifest.js';

export function mediaRange(value, size) {
  if (!value) return { start: 0, end: size - 1, status: 200 };
  if (typeof value !== 'string') return null;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return null;
  const first = match[1] ? Number(match[1]) : null;
  const last = match[2] ? Number(match[2]) : null;
  if (
    (first !== null && !Number.isSafeInteger(first)) ||
    (last !== null && !Number.isSafeInteger(last))
  )
    return null;
  if (first === null) {
    if (last <= 0) return null;
    return { start: Math.max(0, size - last), end: size - 1, status: 206 };
  }
  if (first >= size || (last !== null && last < first)) return null;
  return { start: first, end: Math.min(last ?? size - 1, size - 1), status: 206 };
}

// Only the generated allowlist can select a file. No request path is used as a disk path.
export function createMediaHandler({
  assets = MEDIA_ASSETS,
  root = new URL('./', import.meta.url),
} = {}) {
  const cache = new Map();
  async function bytesFor(key, asset) {
    if (!cache.has(key)) {
      const pending = (async () => {
        const file = await open(
          new URL(asset.file, root),
          constants.O_RDONLY | (constants.O_NOFOLLOW || 0),
        );
        try {
          const stats = await file.stat();
          if (!stats.isFile() || stats.size !== asset.size || stats.size > 2000000)
            throw new Error('Invalid media size');
          const bytes = Buffer.alloc(asset.size);
          let offset = 0;
          while (offset < bytes.length) {
            const result = await file.read(bytes, offset, bytes.length - offset, offset);
            if (!result.bytesRead) throw new Error('Incomplete media');
            offset += result.bytesRead;
          }
          if (createHash('sha256').update(bytes).digest('hex') !== asset.sha256)
            throw new Error('Media integrity mismatch');
          return bytes;
        } finally {
          await file.close();
        }
      })();
      cache.set(key, pending);
      pending.catch(() => {
        if (cache.get(key) === pending) cache.delete(key);
      });
    }
    return cache.get(key);
  }
  return async (req, res) => {
    const empty = (status, headers = {}) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, { 'Cache-Control': 'no-store', 'Content-Length': '0', ...headers });
      res.end();
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') return empty(405, { Allow: 'GET, HEAD' });
    let path;
    try {
      path = new URL(req.url, 'http://localhost').pathname;
    } catch {
      return empty(404);
    }
    if (!path.startsWith(MEDIA_ROUTE + '/')) return empty(404);
    const key = path.slice(MEDIA_ROUTE.length + 1);
    if (!Object.hasOwn(assets, key)) return empty(404);
    const asset = assets[key],
      etag = '"' + asset.sha256 + '"';
    const rangeHeader =
      req.method === 'GET' && (!req.headers['if-range'] || req.headers['if-range'] === etag)
        ? req.headers.range
        : null;
    const range = mediaRange(rangeHeader, asset.size);
    const matches = (req.headers['if-none-match'] || '')
      .split(',')
      .some((value) => value.trim() === '*' || value.trim().replace(/^W\//, '') === etag);
    if (!range && !matches) return empty(416, { 'Content-Range': `bytes */${asset.size}` });
    try {
      const bytes = await bytesFor(key, asset);
      if (res.destroyed || res.writableEnded) return;
      const headers = {
        'Content-Type': 'video/webm',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
        ETag: etag,
        'X-Content-Type-Options': 'nosniff',
        'Cross-Origin-Resource-Policy': 'same-origin',
      };
      if (matches) {
        res.writeHead(304, headers);
        res.end();
        return;
      }
      headers['Content-Length'] = String(range.end - range.start + 1);
      if (range.status === 206)
        headers['Content-Range'] = `bytes ${range.start}-${range.end}/${asset.size}`;
      res.writeHead(range.status, headers);
      res.end(req.method === 'HEAD' ? undefined : bytes.subarray(range.start, range.end + 1));
    } catch {
      empty(500);
    }
  };
}

export function registerMediaRoute(ctx) {
  ctx.inject?.(['webServer'], (webCtx) => {
    const handler = createMediaHandler();
    webCtx.effect(() => webCtx.webServer.register({ kind: 'prefix', path: MEDIA_ROUTE, handler }));
  });
}
