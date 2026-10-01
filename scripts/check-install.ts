import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { runPnpm } from './pnpm.ts';

interface LockEntry { source: string; sourceType: string; computedHash: string }
interface SkillLock { version: number; skills: Record<string, LockEntry> }

function parseLock(value: unknown): SkillLock {
  assert.ok(typeof value === 'object' && value !== null && 'version' in value && 'skills' in value);
  const skills = value.skills;
  assert.ok(typeof value.version === 'number' && typeof skills === 'object' && skills !== null);
  const entries: Record<string, LockEntry> = {};
  const rawEntries: [string, unknown][] = Object.entries(skills);
  for (const [name, entry] of rawEntries) {
    assert.ok(typeof entry === 'object' && entry !== null);
    assert.ok('source' in entry && typeof entry.source === 'string');
    assert.ok('sourceType' in entry && typeof entry.sourceType === 'string');
    assert.ok('computedHash' in entry && typeof entry.computedHash === 'string');
    entries[name] = { source: entry.source, sourceType: entry.sourceType, computedHash: entry.computedHash };
  }
  return { version: value.version, skills: entries };
}

const source = path.resolve('.');
const cwd = await mkdtemp(path.join(tmpdir(), 'mvskills-install-'));
const install = (names: string[]): void => {
  const result = runPnpm(['dlx', 'skills@latest', 'add', source, '--agent', 'codex', 'claude-code', '--skill', ...names, '--copy', '--yes'], cwd);
  if (result.status !== 0) throw new Error(result.error?.message || result.stderr || result.stdout);
};
const lock = async (): Promise<SkillLock> => parseLock(JSON.parse(await readFile(path.join(cwd, 'skills-lock.json'), 'utf8')) as unknown);

install(['setup-mvskills', 'implement']);
const first = await lock();
assert.equal(first.version, 1);
assert.deepEqual(Object.keys(first.skills).sort(), ['implement', 'setup-mvskills']);
for (const entry of Object.values(first.skills)) {
  assert.equal(entry.sourceType, 'local');
  assert.ok(entry.source);
  assert.match(entry.computedHash, /^[a-f0-9]{64}$/);
}
install(['nestjs-cli', 'strict-typescript', 'react-vite', 'react-architecture', 'react-feature', 'design-system', 'api-contracts', 'docker-coolify']);
const second = await lock();
assert.deepEqual(Object.keys(second.skills).sort(), ['api-contracts', 'design-system', 'docker-coolify', 'implement', 'nestjs-cli', 'react-architecture', 'react-feature', 'react-vite', 'setup-mvskills', 'strict-typescript']);
assert.deepEqual(second.skills.implement, first.skills.implement);
for (const agentDir of ['.agents', '.claude']) {
  const installedRoot = path.join(cwd, agentDir, 'skills');
  for (const name of Object.keys(second.skills)) {
    assert.equal(await readFile(path.join(installedRoot, name, 'SKILL.md'), 'utf8'), await readFile(path.join(source, 'skills', name, 'SKILL.md'), 'utf8'));
  }
  for (const resource of ['references/bootstrap.md', 'references/matt-setup/setup.md', 'references/matt-setup/issue-tracker-github.md']) {
    assert.equal(await readFile(path.join(installedRoot, 'setup-mvskills', resource), 'utf8'), await readFile(path.join(source, 'skills/setup-mvskills', resource), 'utf8'));
  }
}
for (const resource of ['design-system/assets/theme.css', 'design-system/assets/scripts/check-design-tokens.ts', 'react-feature/scripts/validate.ts', 'react-architecture/references/testing.md']) {
  assert.equal(await readFile(path.join(cwd, '.agents/skills', resource), 'utf8'), await readFile(path.join(source, 'skills', resource), 'utf8'));
}
console.log(`PASS: lockfile creation, hashes, additive installation, full-stack skills and bundled setup references for Codex/Claude Code. Fixture: ${cwd}`);
