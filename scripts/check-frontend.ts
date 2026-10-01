import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const fixture = await mkdtemp(path.join(tmpdir(), 'mvskills-tokens-'));
await mkdir(path.join(fixture, 'src/styles'), { recursive: true });
await writeFile(path.join(fixture, 'src/styles/theme.css'), ':root { --foreground: #123456; }');
const checker = path.resolve('skills/design-system/assets/scripts/check-design-tokens.ts');
const tsx = path.resolve('node_modules/tsx/dist/cli.mjs');
const cases: readonly [string, string, boolean][] = [
  ['semantic utilities', '<p className="text-foreground bg-primary">Hello</p>', true],
  ['token style', "<div style={{ color: 'var(--foreground)' }} />", true],
  ['data type', 'interface Item { color: string }', true],
  ['mixed style', "<div style={{color:'var(--foreground)',fontSize:999}} />", false],
  ['dynamic style', '<div style={{ color: userColor }} />', false],
  ['indirect style', '<div style={customStyle} />', false],
  ['palette utility', '<p className="text-red-500" />', false],
  ['literal colour', '<p className="bg-[#123456]" />', false],
  ['font size', '<p className="text-[22px]" />', false],
];
for (const [name, source, passes] of cases) {
  await writeFile(path.join(fixture, 'src/example.tsx'), source);
  const result = spawnSync(process.execPath, [tsx, checker], { cwd: fixture, encoding: 'utf8' });
  assert.equal(result.status, passes ? 0 : 1, `${name}: ${result.stdout}${result.stderr}`);
}
const tokens = spawnSync(process.execPath, [tsx, checker, '--tokens'], { cwd: fixture, encoding: 'utf8' });
assert.equal(tokens.status, 0, tokens.stderr);
await writeFile(path.join(fixture, 'src/example.tsx'), '<p className="text-foreground" />');
await writeFile(path.join(fixture, 'src/styles/other.css'), '.example { color: red; }');
assert.equal(spawnSync(process.execPath, [tsx, checker], { cwd: fixture }).status, 1);
for (const name of ['design-system', 'react-feature', 'react-architecture', 'react-vite']) {
  const draft = await readFile(path.join('inprogress-skills', name, 'SKILL.md'), 'utf8');
  assert.match(draft, /metadata:\s*\n\s*internal: true/);
}
console.log(`PASS: token checker accepts semantic styling and rejects mixed, dynamic and literal bypasses. Fixture: ${fixture}`);
