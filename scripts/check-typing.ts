import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { runPnpm } from './pnpm.ts';
const cwd = await mkdtemp(path.join(tmpdir(), 'mvskills-typing-'));
const file = path.join(cwd, 'fixture.ts');
await writeFile(path.join(cwd, 'biome.json'), JSON.stringify({
  files: { includes: ['**/*.ts'] }, formatter: { enabled: false }, assist: { enabled: false },
  linter: { rules: { preset: 'none', suspicious: { noExplicitAny: 'error' } } },
}));
const config = path.join(cwd, 'tsconfig.json');
await writeFile(config, JSON.stringify({ compilerOptions: {
  strict: true, noUncheckedIndexedAccess: true, exactOptionalPropertyTypes: true,
  noEmit: true, types: [], target: 'ES2022',
}, files: ['fixture.ts'] }));
const compile = () => runPnpm(['exec', 'tsc', '--project', config], process.cwd());
await writeFile(file, 'export function identity(value) { return value; }\n');
const implicit = compile();
assert.notEqual(implicit.status, 0);
assert.match(implicit.stdout + implicit.stderr, /TS7006/, 'Implicit any must fail TypeScript');
await writeFile(file, 'export function identity(value: any) { return value; }\n');
const red = runPnpm(['exec', 'biome', 'lint', file, '--config-path', cwd], process.cwd());
assert.notEqual(red.status, 0);
assert.match(red.stdout + red.stderr, /noExplicitAny/, 'Explicit any must fail the actual lint rule');
await writeFile(file, 'export function identity(value: unknown): unknown { return value; }\n');
const typed = compile();
assert.equal(typed.status, 0, typed.stdout + typed.stderr);
const green = runPnpm(['exec', 'biome', 'lint', file, '--config-path', cwd], process.cwd());
assert.equal(green.status, 0, green.stdout + green.stderr);
console.log('PASS: compiler rejects implicit any; Biome rejects explicit any; unknown fixture passes both.');
