import { mkdtemp, readFile, readdir } from 'node:fs/promises';
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
const allNames = (await readdir(path.join(source, 'skills'), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
install(allNames.filter((name) => !(name in first.skills)));
const second = await lock();
assert.deepEqual(Object.keys(second.skills).sort(), allNames);
for (const [name, entry] of Object.entries(first.skills)) assert.deepEqual(second.skills[name], entry);
for (const entry of Object.values(second.skills)) {
  assert.equal(entry.sourceType, 'local');
  assert.ok(entry.source);
  assert.match(entry.computedHash, /^[a-f0-9]{64}$/);
}

async function compareTree(expected: string, actual: string): Promise<void> {
  const entries = await readdir(expected, { withFileTypes: true });
  assert.deepEqual((await readdir(actual)).sort(), entries.map((entry) => entry.name).sort(), actual);
  for (const entry of entries) {
    const original = path.join(expected, entry.name);
    const installed = path.join(actual, entry.name);
    if (entry.isDirectory()) await compareTree(original, installed);
    else assert.deepEqual(await readFile(installed), await readFile(original), installed);
  }
}

for (const agentDir of ['.agents', '.claude']) {
  const installedRoot = path.join(cwd, agentDir, 'skills');
  for (const name of Object.keys(second.skills)) {
    await compareTree(path.join(source, 'skills', name), path.join(installedRoot, name));
  }
}
console.log(`PASS: lockfile creation, hashes, additive installation and all ${allNames.length} skills/resources for Codex/Claude Code. Fixture: ${cwd}`);
