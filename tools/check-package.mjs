import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const cwd = fileURLToPath(root);
const read = (path) => readFile(new URL(path, root), 'utf8');
const pkg = JSON.parse(await read('package.json'));

assert.equal(pkg.name, 'dsh-offwork');
assert.equal(pkg.type, 'module');
assert.equal(pkg.license, 'MIT');
assert.equal(pkg.repository.url, 'git+https://github.com/SnowBeatRain/dsh-offwork.git');
assert.ok(pkg.engines?.dsh, 'Declare the supported Harness versions');
assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml');
assert.equal(pkg.dsh?.client?.platform, 'web');
assert.match(await read('LICENSE'), /^MIT License/);

// This check covers this project's patch; Harness composition remains the
// authoritative check that the bundle can be installed in a real profile.
const patch = await read('cordis.patch.yml');
assert.match(patch, /^- insert:/m);
assert.match(patch, /^\s+- id: offwork-clock\s*$/m);
assert.match(patch, /^\s+name: ['"]?dsh-offwork['"]?\s*$/m);

for (const lifecycle of ['preinstall', 'install', 'postinstall', 'prepare']) {
  assert.equal(pkg.scripts?.[lifecycle], undefined, `Unexpected install script: ${lifecycle}`);
}
for (const name of Object.keys(pkg.dependencies ?? {})) {
  assert.ok(!name.startsWith('@deepseek-ai/'), `${name} belongs in peerDependencies`);
}

const sourceFiles = [];
for (const directory of ['', 'tests/', 'tools/']) {
  for (const entry of await readdir(new URL(directory || '.', root), { withFileTypes: true })) {
    if (entry.isFile() && /\.(?:js|mjs)$/.test(entry.name)) {
      sourceFiles.push(directory + entry.name);
    }
  }
}
for (const path of sourceFiles) {
  execFileSync(process.execPath, ['--check', path], { cwd, stdio: 'pipe' });
}

for (const language of ['zh', 'en']) {
  const locale = JSON.parse(await read(`locale/${language}.json`));
  assert.equal(typeof locale.meta?.title, 'string');
  assert.ok(locale.meta.title.length > 0);
  assert.equal(typeof locale.meta?.description, 'string');
  assert.ok(locale.meta.description.length > 0);
}

// Ignore lifecycle scripts here: this checker also runs inside prepublishOnly.
// Inspect npm's actual package file list, rather than relying on .gitignore.
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const [packed] = JSON.parse(
  execFileSync(npm, ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }),
);
const files = new Set(packed.files.map((file) => file.path));
assert.equal(packed.name, pkg.name);
assert.equal(packed.version, pkg.version);
for (const path of [
  'package.json',
  'index.js',
  'client.js',
  'companion.js',
  'hydration.js',
  'hydration-store.js',
  'cordis.patch.yml',
  'icon.svg',
  'locale/zh.json',
  'locale/en.json',
  'README.md',
  'LICENSE',
]) {
  assert.ok(files.has(path), `Missing package file: ${path}`);
}
for (const target of Object.values(pkg.exports)) {
  if (typeof target === 'string' && !target.includes('*')) {
    assert.ok(files.has(target.replace(/^\.\//, '')), `Missing export: ${target}`);
  }
}
for (const path of files) {
  assert.ok(
    !/(^|\/)(?:data\.json|\.data-[^/]*|\.env(?:\.[^/]*)?|\.npmrc|\.git(?:\/|$)|node_modules(?:\/|$))/.test(
      path,
    ),
    `Local settings or credentials included in package: ${path}`,
  );
  assert.ok(!path.endsWith('.tgz'), `Nested package archive: ${path}`);
}
console.log(
  `Package checks passed: ${sourceFiles.length} JavaScript files, ${files.size} packed files.`,
);
