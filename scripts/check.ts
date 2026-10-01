import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('skills');
const dirs = (await readdir(root, { withFileTypes: true })).filter((e) => e.isDirectory());
const names = new Set<string>();
const errors: string[] = [];

async function checkReferences(file: string): Promise<void> {
  const source = (await readFile(file, 'utf8')).replace(/^```[^\n]*\n[\s\S]*?^```[^\n]*$/gm, '');
  for (const match of source.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (!target || /^[a-z]+:|^#/.test(target) || !target.includes('.')) continue;
    const relative = target.split('#')[0];
    if (!relative) continue;
    try { await stat(path.resolve(path.dirname(file), relative)); }
    catch { errors.push(`${file}: missing reference ${target}`); }
  }
}

async function walk(dir: string): Promise<void> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (entry.name.endsWith('.md')) await checkReferences(file);
  }
}

for (const dir of dirs) {
  const source = await readFile(path.join(root, dir.name, 'SKILL.md'), 'utf8');
  const header = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!header || !/^description:\s*\S/m.test(header) || !new RegExp(`^name: ${dir.name}$`, 'm').test(header)) {
    errors.push(`${dir.name}: invalid frontmatter`);
  }
  names.add(dir.name);
  await walk(path.join(root, dir.name));
}
// Draft names may overlap canonical names; validate their entrypoints separately.
const draftRoot = path.resolve('inprogress-skills');
for (const dir of (await readdir(draftRoot, { withFileTypes: true })).filter((e) => e.isDirectory())) {
  const contents = await readdir(path.join(draftRoot, dir.name), { withFileTypes: true, recursive: true });
  if (!contents.some((entry) => entry.isFile())) continue;
  const file = path.join(draftRoot, dir.name, 'SKILL.md');
  const source = await readFile(file, 'utf8');
  const header = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!header || !/^description:\s*\S/m.test(header) || !new RegExp(`^name: ${dir.name}$`, 'm').test(header) || !/internal: true/.test(header)) {
    errors.push(`${file}: draft requires valid frontmatter and metadata.internal: true`);
  }
  await walk(path.join(draftRoot, dir.name));
}
const deps: unknown = JSON.parse(await readFile(path.join(root, 'dependencies.json'), 'utf8'));
if (typeof deps !== 'object' || deps === null || Array.isArray(deps)) throw new Error('Invalid dependency map');
const dependencyEntries: [string, unknown][] = Object.entries(deps);
for (const [name, required] of dependencyEntries) {
  if (!Array.isArray(required) || !required.every((dep: unknown) => typeof dep === 'string')) throw new Error(`Invalid dependencies for ${name}`);
  const strings = required.filter((dep: unknown): dep is string => typeof dep === 'string');
  for (const dep of [name, ...strings]) {
    if (!names.has(dep)) errors.push(`Missing skill: ${dep}`);
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${names.size} entrypoints, bundled Markdown references and declared dependencies.`);
