// Validation pipeline for a web app in the mvskills frontend profile.
// Usage: pnpm exec tsx <skill>/scripts/validate.ts [web-app-dir]
// Runs every stage, prints PASS/FAIL per stage, exits non-zero if any failed.
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const cwd = path.resolve(process.argv[2] ?? '.');
const pkg: unknown = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'));

function hasScript(name: string): boolean {
  if (typeof pkg !== 'object' || pkg === null || !('scripts' in pkg)) return false;
  const scripts = pkg.scripts;
  return typeof scripts === 'object' && scripts !== null && name in scripts;
}

type Step = { name: string; args: string[] | null; missing?: string };

const steps: Step[] = [
  // Optional: regenerate routeTree.gen.ts so typecheck sees new routes.
  ...(hasScript('routes:generate') ? [{ name: 'routes', args: ['run', 'routes:generate'] }] : []),
  { name: 'typecheck', args: hasScript('typecheck') ? ['run', 'typecheck'] : ['exec', 'tsc', '-b'] },
  { name: 'lint', args: hasScript('lint') ? ['run', 'lint'] : ['exec', 'biome', 'check', '.'] },
  {
    name: 'tokens',
    args: hasScript('check:tokens') ? ['run', 'check:tokens'] : null,
    missing: 'add "check:tokens" (design-system skill: scripts/check-design-tokens.ts)',
  },
  {
    name: 'architecture',
    args: existsSync(path.join(cwd, '.dependency-cruiser.cjs'))
      ? ['exec', 'depcruise', 'src', '--config', '.dependency-cruiser.cjs']
      : null,
    missing: 'copy .dependency-cruiser.cjs from the react-architecture skill assets',
  },
  { name: 'tests', args: hasScript('test') ? ['run', 'test'] : ['exec', 'vitest', 'run'] },
  { name: 'build', args: hasScript('build') ? ['run', 'build'] : ['exec', 'vite', 'build'] },
];

let failed = false;
for (const { name, args, missing } of steps) {
  if (args === null) {
    console.error(`${name}: FAIL — ${missing ?? 'not configured'}`);
    failed = true;
    continue;
  }
  const windows = process.platform === 'win32';
  const quote = (value: string): string => `'${value.replaceAll("'", "''")}'`;
  const result = spawnSync(
    windows ? 'pwsh' : 'pnpm',
    windows
      ? ['-NoProfile', '-NonInteractive', '-Command', `& pnpm ${args.map(quote).join(' ')}; exit $LASTEXITCODE`]
      : args,
    { cwd, encoding: 'utf8' },
  );
  const output = (result.stdout ?? '') + (result.stderr ?? '');
  process.stdout.write(output);
  // dependency-cruiser reports success when it could not parse TypeScript at all.
  const silentArch = name === 'architecture' && /missing-typescript-transpiler|\(0 modules/.test(output);
  const ok = result.status === 0 && !silentArch;
  console.log(`${name}: ${ok ? 'PASS' : 'FAIL'}${silentArch ? ' (no modules analysed)' : ''}`);
  failed ||= !ok;
}
process.exitCode = failed ? 1 : 0;
