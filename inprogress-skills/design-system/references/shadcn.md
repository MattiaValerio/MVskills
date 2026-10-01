# shadcn/ui with the CLI

Always `pnpm dlx shadcn@latest <command> -c <web-app-dir>` from the repo root (or run in
the app directory). Check `--help` of the installed CLI before relying on a flag.

## Inspect first

- `shadcn info --json` — framework, base library, style, aliases, icon library, CSS
  file. Read it at the start of any UI task in an existing app.
- `shadcn docs <component>` — API and examples for the project's base library. Use it
  instead of guessing props: Base UI, Radix and React Aria bases differ.
- `shadcn view <items…>` / `shadcn search @shadcn -q <term>` — registry contents.

## Initialize (new app, once)

Follow the official Vite or TanStack Router installation page for the alias and
tsconfig prerequisites (react-vite already configures `@/` → `src`). Then:

```bash
pnpm dlx shadcn@latest init -c apps/web --base <base|radix|aria> --no-monorepo
```

- Pass every option the CLI would otherwise prompt for; an agent stuck on a prompt
  wastes the run. Use `--preset <code>` when the user supplied a shadcn/create preset.
- Choose the base library once (new projects: shadcn's current default unless the user
  prefers another) and record it in stack.md. Never mix bases.
- Keep `cssVariables: true`. Point `tailwind.css` in components.json to
  `src/styles/theme.css`, then apply the theme template (resets, extra tokens, fonts).
- Verify `components.json` aliases use `@/components`, `@/lib/utils`, `@/components/ui`.

## Add components

```bash
pnpm dlx shadcn@latest add dialog --dry-run   # read the planned files and dependencies
pnpm dlx shadcn@latest add dialog
pnpm check:tokens                             # fix any palette/white/black usage
```

Add only what the feature needs. To update a component you have modified, run
`add <name> --diff` first and merge by hand; `--overwrite` discards local changes.

## Customization rules

- `components/ui/*` is owned code. Change it when the change should apply **everywhere**
  (a new Button variant, different focus style), always with tokens and `cva` variants.
- Product-level building blocks (`PageHeader`, `DataTable`, `ConfirmDialog`,
  `StatusBadge`) live in `components/` and compose ui primitives. Features compose these.
- `className` passed to a component may adjust **layout** (spacing, sizing, grid,
  position). Colour and typography changes become a variant, not a className override.
- Status visuals map domain states to variants in one place
  (`StatusBadge status="cancelled"` → `variant="destructive"`), not per page.
- Icons come from the `iconLibrary` in components.json, inherit `currentColor`, and are
  sized with `size-*`.
- Composition with router links follows the base library: `render={<Link … />}` (Base
  UI) or `asChild` (Radix). Check with `shadcn docs button`.

## Dark mode

Follow the shadcn Vite dark-mode guide: a `ThemeProvider` toggling `.dark` on `<html>`,
`system` as default, choice persisted; a `ModeToggle` in the app shell. Test both modes.

## Forms

Use shadcn `Field` components with the form library recorded in stack.md (shadcn
documents TanStack Form and React Hook Form). Validation schemas are Zod and, for
request bodies, derived from or checked against the generated contract types.
