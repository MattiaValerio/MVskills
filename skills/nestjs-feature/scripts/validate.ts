import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const cwd = path.resolve(process.argv[2] || '.');
const pkg: unknown = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'));
function hasScript(name: string): boolean {
  if (typeof pkg !== 'object' || pkg === null || !('scripts' in pkg)) return false;
  const scripts = pkg.scripts;
  return typeof scripts === 'object' && scripts !== null && name in scripts;
}
const steps: [string, string[]][] = [
  ['typecheck', hasScript('typecheck') ? ['run', 'typecheck'] : ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json']],
  ['lint', hasScript('lint') ? ['run', 'lint'] : ['exec', 'biome', 'check', '.']],
  ['architecture', ['exec', 'depcruise', 'src', '--config', '.dependency-cruiser.cjs']],
  ['tests', hasScript('test') ? ['run', 'test'] : ['exec', 'vitest', 'run']],
];
let failed = false;
for (const [name, args] of steps) {
  if (name === 'architecture' && !existsSync(path.join(cwd, '.dependency-cruiser.cjs'))) {
    console.error('architecture: missing .dependency-cruiser.cjs'); failed = true; continue;
  }
  const windows = process.platform === 'win32';
  const quote = (value: string): string => `'${value.replaceAll("'", "''")}'`;
  const result = spawnSync(windows ? 'pwsh' : 'pnpm', windows
    ? ['-NoProfile', '-NonInteractive', '-Command', `& pnpm ${args.map(quote).join(' ')}; exit $LASTEXITCODE`]
    : args, { cwd, encoding: 'utf8' });
  const output = (result.stdout || '') + (result.stderr || '');
  process.stdout.write(output);
  const ok = result.status === 0 && !(name === 'architecture' && /missing-typescript-transpiler|\(0 modules/.test(output));
  console.log(`${name}: ${ok ? 'PASS' : 'FAIL'}`);
  failed ||= !ok;
}
process.exitCode = failed ? 1 : 0;
