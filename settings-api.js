import { mkdir, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

export const SETTINGS_ROUTE = '/offwork-clock/settings';
export function createSettingsAccess(directory) {
  const file = join(directory, 'agent-access.json');
  let queue = Promise.resolve();
  return {
    async get() {
      try {
        const value = JSON.parse(await readFile(file, 'utf8'));
        if (value.schema !== 1 || typeof value.allowed !== 'boolean')
          throw new Error('Invalid access policy');
        return value.allowed;
      } catch (error) {
        if (error.code === 'ENOENT') return false;
        throw error;
      }
    },
    set(allowed) {
      const result = queue.then(async () => {
        if (typeof allowed !== 'boolean') throw new Error('Invalid access policy');
        await mkdir(directory, { recursive: true, mode: 0o700 });
        const temp = join(directory, `.access-${randomUUID()}.tmp`);
        try {
          await writeFile(temp, JSON.stringify({ schema: 1, allowed }), {
            mode: 0o600,
            flag: 'wx',
          });
          await rename(temp, file);
        } finally {
          await unlink(temp).catch(() => {});
        }
        return allowed;
      });
      queue = result.catch(() => {});
      return result;
    },
  };
}

// Served under the Harness host's existing access boundary. Never enables CORS.
// A custom header is required even for GET; cross-origin browsers cannot send it
// without a successful preflight. Same-site subdomains are not trusted.
export function createSettingsHandler(operate, access) {
  return async (req, res) => {
    const send = (status, body) => {
      if (res.destroyed || res.writableEnded) return;
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(JSON.stringify(body));
    };
    if (!['GET', 'POST'].includes(req.method))
      return send(405, { ok: false, error: 'Method not allowed' });
    const site = req.headers['sec-fetch-site'];
    let originOK = true;
    if (req.headers.origin) {
      try {
        originOK = new URL(req.headers.origin).host === req.headers.host;
      } catch {
        originOK = false;
      }
    }
    if (
      req.headers['x-offwork-client'] !== '1' ||
      (site && !['same-origin', 'none'].includes(site)) ||
      !originOK
    )
      return send(403, { ok: false, error: 'Same-origin client required' });
    try {
      if (req.method === 'GET') {
        const result = await operate('get');
        return send(result.ok ? 200 : 422, { ...result, agentAccess: await access.get() });
      }
      if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || ''))
        return send(415, { ok: false, error: 'JSON required' });
      const chunks = [];
      let size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 16384) return send(413, { ok: false, error: 'Request too large' });
        chunks.push(chunk);
      }
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!body || typeof body !== 'object' || Array.isArray(body))
        throw new Error('Invalid request');
      if (body.action === 'access') {
        if (Object.keys(body).some((k) => !['action', 'allowed'].includes(k)))
          throw new Error('Unknown field');
        return send(200, { ok: true, agentAccess: await access.set(body.allowed) });
      }
      if (
        body.action !== 'set' ||
        Object.keys(body).some((k) => !['action', 'settings'].includes(k))
      )
        throw new Error('Invalid action');
      const result = await operate('set', body.settings);
      send(result.ok ? 200 : 422, result);
    } catch {
      send(400, {
        ok: false,
        error: '无法读取或保存设置，请检查配置和访问权限。 / Unable to read or save settings.',
      });
    }
  };
}
export function registerSettingsRoute(ctx, operate, access) {
  ctx.inject?.(['webServer'], (webCtx) => {
    const handler = createSettingsHandler(operate, access);
    webCtx.effect(() =>
      webCtx.webServer.register({ kind: 'exact', path: SETTINGS_ROUTE, handler }),
    );
  });
}
