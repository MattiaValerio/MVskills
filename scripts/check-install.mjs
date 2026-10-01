import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const source = path.resolve('.');
const cwd = await mkdtemp(path.join(tmpdir(), 'mvskills-install-'));
const install = names => {
  const args = ['dlx', 'skills@latest', 'add', source, '--agent', 'codex', 'claude-code', '--skill', ...names, '--copy', '--yes'];
  const windows = process.platform === 'win32';
  const quote = value => `'${value.replaceAll("'", "''")}'`;
  const commandArgs = windows
    ? ['-NoProfile', '-NonInteractive', '-Command', `& pnpm ${args.map(quote).join(' ')}; exit $LASTEXITCODE`]
    : args;
  const result = spawnSync(windows ? 'pwsh' : 'pnpm', commandArgs, { cwd, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.error?.message || result.stderr || result.stdout);
};
const lock = async () => JSON.parse(await readFile(path.join(cwd, 'skills-lock.json'), 'utf8'));
install(['setup-mvskills', 'implement']);
const first = await lock();
assert.equal(first.version, 1);
assert.deepEqual(Object.keys(first.skills).sort(), ['implement', 'setup-mvskills']);
for (const entry of Object.values(first.skills)) {
  assert.equal(entry.sourceType, 'local');
  assert.ok(entry.source);
  assert.match(entry.computedHash, /^[a-f0-9]{64}$/);
}
install(['nestjs-cli']);
const second = await lock();
assert.deepEqual(Object.keys(second.skills).sort(), ['implement', 'nestjs-cli', 'setup-mvskills']);
assert.deepEqual(second.skills.implement, first.skills.implement);
for (const agentDir of ['.agents', '.claude']) {
  const installed = await readFile(path.join(cwd, agentDir, 'skills', 'implement', 'SKILL.md'), 'utf8');
  assert.equal(installed, await readFile(path.join(source, 'skills', 'implement', 'SKILL.md'), 'utf8'));
}
console.log(`PASS: automatic lockfile creation, selected entries, hashes, additive installation and customized copies for Codex/Claude Code. Fixture: ${cwd}`);
