import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { runPnpm } from './pnpm.ts';

for (const mode of ['module', 'commonjs']) {
  const cwd = await mkdtemp(path.join(tmpdir(), 'mvskills-alias-'));
  await mkdir(path.join(cwd, 'src/shared'), { recursive: true });
  await writeFile(path.join(cwd, 'package.json'), JSON.stringify({ type: mode }));
  await writeFile(path.join(cwd, 'src/shared/value.ts'), 'export const value = 42;\n');
  await writeFile(path.join(cwd, 'src/shared/types.ts'), 'export interface Payload { value: number }\n');
  await writeFile(path.join(cwd, 'src/main.ts'), "import { value } from '@/shared/value';\nimport type { Payload } from '@/shared/types';\nconst payload: Payload = { value };\nconsole.log(payload.value);\n");
  const config = path.join(cwd, 'tsconfig.json');
  await writeFile(config, JSON.stringify({ compilerOptions: {
    strict: true, noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true,
    target: 'ES2022', module: 'NodeNext', moduleResolution: 'NodeNext', types: [],
    rootDir: './src', outDir: './dist', paths: { '@/*': ['./src/*', './src/*.ts', './src/*.tsx'] },
  }, include: ['src/**/*.ts'] }));
  const compiled = runPnpm(['exec', 'tsc', '-p', config], process.cwd());
  assert.equal(compiled.status, 0, compiled.stdout + compiled.stderr);
  const entry = path.join(cwd, 'dist/main.js');
  assert.match(await readFile(entry, 'utf8'), /@\/shared\/value/);
  const unresolved = spawnSync(process.execPath, [entry], { encoding: 'utf8' });
  assert.notEqual(unresolved.status, 0, 'Native Node must demonstrate unresolved aliases before rewriting');
  const rewritten = runPnpm(['exec', 'tsc-alias', '-p', config, '--resolve-full-paths', '--resolve-full-extension', '.js'], process.cwd());
  assert.equal(rewritten.status, 0, rewritten.stdout + rewritten.stderr);
  const runtime = spawnSync(process.execPath, [entry], { encoding: 'utf8' });
  assert.equal(runtime.status, 0, runtime.stderr);
  assert.equal(runtime.stdout.trim(), '42');
}
console.log('PASS: extensionless @/ imports typecheck and run after alias rewriting in ESM and CommonJS.');
