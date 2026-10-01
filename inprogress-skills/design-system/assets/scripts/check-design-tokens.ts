/**
 * check-design-tokens — keeps the theme file the single source of truth.
 *
 * Fails when application source outside the theme file(s) contains colour
 * values, Tailwind palette or arbitrary colour/typography utilities, inline
 * colour/typography styles, raw CSS colour/font declarations or font imports.
 *
 * Usage (from the web app root):
 *   tsx scripts/check-design-tokens.ts [--root src] [--theme src/styles/theme.css]...
 *   tsx scripts/check-design-tokens.ts --tokens     # print the available tokens
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

interface Rule {
  readonly id: string;
  readonly pattern: RegExp;
  readonly hint: string;
  readonly appliesTo: (file: string) => boolean;
  readonly skip?: (source: string, index: number) => boolean;
}

interface Finding {
  readonly file: string;
  readonly line: number;
  readonly column: number;
  readonly rule: string;
  readonly match: string;
  readonly hint: string;
}

const SOURCE_EXT = /\.(?:tsx?|jsx?|css)$/;
const GENERATED = /(?:\.gen\.|\.d\.ts$)/;
const isScript = (f: string): boolean => /\.(?:tsx?|jsx?)$/.test(f);
const isCss = (f: string): boolean => f.endsWith('.css');
const allFiles = (): boolean => true;

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|mauve|olive|mist|taupe';
const COLOR_UTILITIES =
  'bg|text|border(?:-[xytrblse])?|ring(?:-offset)?|outline|fill|stroke|from|via|to|decoration|divide|placeholder|caret|accent|shadow|inset-shadow|inset-ring|text-shadow|drop-shadow';

const rules: readonly Rule[] = [
  {
    id: 'hex-color',
    pattern: /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})(?![0-9a-zA-Z_-])/g,
    hint: 'Use a semantic token (bg-primary, text-muted-foreground…) or add one in the theme file.',
    appliesTo: allFiles,
    // In-page anchors such as href="#add" or to="#fed" are not colours.
    skip: (source, index) => /(?:href|to|hash)\s*[=:]\s*\{?\s*["'`]$/.test(source.slice(Math.max(0, index - 16), index)),
  },
  {
    id: 'color-function',
    pattern: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/g,
    hint: 'Colour values live only in the theme file; reference a token instead.',
    appliesTo: allFiles,
  },
  {
    id: 'palette-utility',
    pattern: new RegExp(`(?<![\\w-])(?:${COLOR_UTILITIES})-(?:(?:${PALETTE})-\\d{2,3}|white|black)(?![\\w-])`, 'g'),
    hint: 'Tailwind palette colours are disabled. Use the semantic utility for this role.',
    appliesTo: allFiles,
  },
  {
    id: 'arbitrary-color',
    pattern: new RegExp(`(?<![\\w-])(?:${COLOR_UTILITIES})-(?:\\[(?:#|var\\(|color-mix|rgb|hsl|oklch|oklab|lab|lch)|\\(--)`, 'g'),
    hint: 'Arbitrary colours bypass the theme. Expose a token via @theme inline and use its utility.',
    appliesTo: allFiles,
  },
  {
    id: 'arbitrary-typography',
    pattern: /(?<![\w-])(?:text|leading|tracking|font)-(?:\[|\()/g,
    hint: 'Use the type scale (text-sm…text-5xl), font-sans/font-heading/font-mono, or add a token.',
    appliesTo: allFiles,
  },
  {
    id: 'inline-style',
    pattern: /\bstyle\s*=\s*\{([^}]*)(?:\}|$)/g,
    hint: 'Use a literal style object with semantic token references for colour and typography.',
    appliesTo: isScript,
    skip: (source, index) => {
      const body = source.slice(index).match(/^style\s*=\s*\{([^}]*)(?:\}|$)/)?.[1];
      if (body === undefined || !body.trim().startsWith('{') || body.includes('...')) return false;
      const properties = body.matchAll(/\b(?:color|background|backgroundColor|borderColor|outlineColor|fill|stroke|fontFamily|fontSize|lineHeight|letterSpacing)\s*:\s*([^,}\n]+)/g);
      for (const property of properties) {
        if (!/^(['"])var\(--[\w-]+\)\1$/.test(property[1]?.trim() ?? '')) return false;
      }
      return true;
    },
  },
  {
    id: 'css-declaration',
    pattern:
      /(?<![\w-])(?:color|background(?:-color)?|border(?:-[a-z]+)?-color|outline-color|fill|stroke|font-family|font-size|line-height|letter-spacing)\s*:\s*(?=\S)(?!var\(|inherit|currentcolor|currentColor|transparent|initial|unset|none|url\()[^;{}]+;/g,
    hint: 'CSS outside the theme file references tokens only: color: var(--foreground).',
    appliesTo: isCss,
  },
  {
    id: 'font-import',
    pattern: /@fontsource|fonts\.googleapis\.com|fonts\.bunny\.net|use\.typekit\.net/g,
    hint: 'Fonts are imported only in the theme file.',
    appliesTo: allFiles,
  },
];

function parseArgs(argv: readonly string[]): { root: string; themes: string[]; tokens: boolean } {
  let root = 'src';
  const themes: string[] = [];
  let tokens = false;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === '--root' && next !== undefined) {
      root = next;
      i++;
    } else if (arg === '--theme' && next !== undefined) {
      themes.push(next);
      i++;
    } else if (arg === '--tokens') {
      tokens = true;
    } else {
      throw new Error(`Unknown argument: ${String(arg)}`);
    }
  }
  return { root, themes: themes.length > 0 ? themes : ['src/styles/theme.css'], tokens };
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...listFiles(full));
    else if (SOURCE_EXT.test(entry) && !GENERATED.test(entry)) out.push(full);
  }
  return out;
}

function stripComments(source: string, file: string): string {
  // Replace comments with spaces so reported positions stay correct.
  const blank = (m: string): string => m.replace(/[^\n]/g, ' ');
  const block = source.replace(/\/\*[\s\S]*?\*\//g, blank);
  return isScript(file) ? block.replace(/(^|[^:\\])\/\/[^\n]*/g, (m, p: string) => p + blank(m.slice(p.length))) : block;
}

function position(source: string, index: number): { line: number; column: number } {
  const before = source.slice(0, index);
  const line = before.split('\n').length;
  return { line, column: index - before.lastIndexOf('\n') };
}

function scan(file: string): Finding[] {
  const raw = readFileSync(file, 'utf8');
  const source = stripComments(raw, file);
  const findings: Finding[] = [];
  for (const rule of rules) {
    if (!rule.appliesTo(file)) continue;
    for (const match of source.matchAll(rule.pattern)) {
      const index = match.index;
      if (rule.skip?.(source, index)) continue;
      const { line, column } = position(source, index);
      findings.push({ file, line, column, rule: rule.id, match: match[0].trim().slice(0, 60), hint: rule.hint });
    }
  }
  return findings;
}

function printTokens(themes: readonly string[]): void {
  const groups = new Map<string, Set<string>>([
    ['color', new Set()],
    ['font', new Set()],
    ['text', new Set()],
    ['radius', new Set()],
  ]);
  for (const theme of themes) {
    const css = readFileSync(theme, 'utf8');
    for (const m of css.matchAll(/--(color|font|text|radius)-([a-z0-9-]+?)(?:--[a-z-]+)?\s*:/g)) {
      const [, group, name] = m;
      if (group === undefined || name === undefined || name === '*') continue;
      groups.get(group)?.add(name);
    }
  }
  for (const [group, names] of groups) {
    console.log(`${group}: ${[...names].join(', ') || '(none)'}`);
  }
}

const { root, themes, tokens } = parseArgs(process.argv.slice(2));
const themeSet = new Set(themes.map((t) => path.resolve(t)));
for (const theme of themeSet) {
  try {
    statSync(theme);
  } catch {
    console.error(`Theme file not found: ${theme}`);
    process.exit(2);
  }
}

if (tokens) {
  printTokens([...themeSet]);
} else {
  const files = listFiles(root).filter((f) => !themeSet.has(path.resolve(f)));
  const findings = files.flatMap(scan);
  for (const f of findings) {
    console.error(`${f.file}:${f.line}:${f.column}  ${f.rule}  "${f.match}"\n    → ${f.hint}`);
  }
  if (findings.length > 0) {
    console.error(`\n✘ ${findings.length} design-token violation(s) in ${files.length} files.`);
    process.exit(1);
  }
  console.log(`✔ No design-token violations (${files.length} files checked, theme: ${[...themeSet].map((t) => path.relative(process.cwd(), t)).join(', ')}).`);
}
