import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
const cwd = path.resolve(process.argv[2] || '.');
const pkg = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'));
const steps = [
  ['typecheck', pkg.scripts?.typecheck ? ['run', 'typecheck'] : ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json']],
  ['lint', pkg.scripts?.lint ? ['run', 'lint'] : ['exec', 'biome', 'check', '.']],
  ['architecture', ['exec', 'depcruise', 'src', '--config', '.dependency-cruiser.cjs']],
  ['tests', pkg.scripts?.test ? ['run', 'test'] : ['exec', 'vitest', 'run']],
];
let failed = false;
for (const [name, args] of steps) {
  if (name === 'architecture' && !existsSync(path.join(cwd, '.dependency-cruiser.cjs'))) {
    console.error('architecture: missing .dependency-cruiser.cjs'); failed = true; continue;
  }
  const result = spawnSync(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' });
  const output = (result.stdout || '') + (result.stderr || '');
  process.stdout.write(output);
  const ok = result.status === 0 && !(name === 'architecture' && /missing-typescript-transpiler|\(0 modules/.test(output));
  console.log(`${name}: ${ok ? 'PASS' : 'FAIL'}`);
  failed ||= !ok;
}
process.exitCode = failed ? 1 : 0;
