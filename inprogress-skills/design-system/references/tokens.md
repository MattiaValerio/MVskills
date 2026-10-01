# Colour tokens

## The three layers of theme.css

1. **Reset** — `@theme { --color-*: initial; --font-*: initial; --text-*: initial; }`
   removes Tailwind's default palette, families and sizes. Keep these lines first in the
   `@theme` block; if a preset or `shadcn init` rewrites the file, restore them.
2. **Values** — CSS variables in `:root` (light) and `.dark` (dark), in OKLCH. This is
   the only place where colour values exist. Both blocks define the same names.
3. **Mapping** — `@theme inline { --color-<name>: var(--<name>); }` turns each variable
   into utilities (`bg-<name>`, `text-<name>`, `border-<name>`, `ring-<name>`,
   `fill-<name>`…). `inline` makes utilities reference the variable, so `.dark` switches
   them at runtime.

`bg-transparent`, `text-current`, `bg-inherit` keep working: they are not palette colours.

## Adding a token

Example: a highlighted row needs a soft brand tint distinct from `accent`.

```css
:root  { --highlight: oklch(0.96 0.03 262); --highlight-foreground: oklch(0.3 0.08 262); }
.dark  { --highlight: oklch(0.3 0.06 262);  --highlight-foreground: oklch(0.95 0.02 262); }

@theme inline {
  --color-highlight: var(--highlight);
  --color-highlight-foreground: var(--highlight-foreground);
}
```

Then `bg-highlight text-highlight-foreground`. Rules:

- Name by **role** (what it is for), never by hue or lightness.
- Surfaces come in pairs with a `-foreground`; check contrast of the pair in both modes.
- Prefer an existing token with an opacity modifier (`bg-primary/10`) before adding one;
  add a token when the same tint is needed in more than one place or must differ between
  light and dark beyond what opacity gives.
- Record non-obvious tokens in stack.md's "Design system" section with their purpose.

## Changing the brand

Edit `--primary`/`--primary-foreground` and `--ring`; decide whether `--sidebar-primary`,
`--accent` and `--chart-*` should follow. For a tinted UI, give the neutral tokens
(`--background`, `--muted`, `--border`…) a small chroma on the brand hue instead of 0.
Keep lightness relationships: foreground pairs need ≥ 4.5:1 contrast for text.

## Dynamic colours (charts, user-chosen labels)

Charts use `var(--chart-1)`…`var(--chart-5)` (shadcn Chart config accepts them). Inline
`style` is allowed only when the value is a pure token reference
(`style={{ backgroundColor: 'var(--chart-2)' }}`); `check:tokens` permits exactly that.
User-provided colours (e.g. a tag colour stored in the DB) are data, not theme: render
them through a dedicated component that maps them to a bounded set of semantic tokens.
Keep the checker active; arbitrary user data does not become application styling.

## Dark mode

Class strategy: `.dark` on `<html>`, toggled by a ThemeProvider as in shadcn's Vite
dark-mode guide (system default, persisted choice). Components never use `dark:` with
palette colours; tokens already change. `dark:` remains for rare structural differences
(e.g. `dark:border` when a border is only needed in dark mode), always with tokens.
