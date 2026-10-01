import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('skills');
const dirs = (await readdir(root, { withFileTypes: true })).filter(e => e.isDirectory());
const names = new Set();
const errors = [];
for (const dir of dirs) {
  const source = await readFile(path.join(root, dir.name, 'SKILL.md'), 'utf8');
  const header = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!header || !/^description:\s*\S/m.test(header[1]) || !new RegExp(`^name: ${dir.name}$`, 'm').test(header[1])) errors.push(`${dir.name}: invalid frontmatter`);
  names.add(dir.name);
  for (const match of source.matchAll(/(?:`|\]\((?:\.\/)?)((?:references|assets|scripts)\/[^`\s)]+)(?:`|\))/g)) {
    try { await stat(path.join(root, dir.name, match[1])); }
    catch { errors.push(`${dir.name}: missing resource ${match[1]}`); }
  }
}
const deps = JSON.parse(await readFile(path.join(root, 'dependencies.json'), 'utf8'));
for (const [name, required] of Object.entries(deps)) {
  for (const dep of [name, ...required]) if (!names.has(dep)) errors.push(`Missing skill: ${dep}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`Validated ${names.size} entrypoints and declared dependencies.`);
