---
name: design-system
description: Theme, colour tokens, typography and shadcn/ui components for the mvskills frontend profile, with one theme file as the single source of truth. Use when styling any UI, choosing colours, fonts or text sizes, adding or customizing shadcn components, setting up or changing the app theme or dark mode, or reviewing frontend code for visual consistency.
metadata:
  internal: true
---

## Profile scope and official documentation

Read docs/agents/stack.md when present. Applies to apps in the default frontend profile
(Tailwind CSS v4 + shadcn/ui) or explicitly adopting it; other apps keep their styling
conventions and this skill does not authorize a migration. The selected design system also applies to throwaway
UI prototypes: use its theme, tokens and typography from the start. Structure and data rules live
in react-architecture.

For facts start from https://ui.shadcn.com/llms.txt (theming, CLI, components.json, dark
mode for Vite) and https://tailwindcss.com/docs/theme. `pnpm dlx shadcn@latest docs
<component>` returns component docs for the project's base library. Match docs to the
installed versions.

# One theme, everywhere

`src/styles/theme.css` is the **single source of truth** of the visual identity: colour
values (light and dark), font families and font imports, the type scale and the base
radius. No other file contains a colour value, a font name or an ad-hoc size. Components
— shadcn's and the app's — consume only **semantic tokens** (`bg-primary`,
`text-muted-foreground`, `border-border`, `font-heading`, `text-sm`, `rounded-lg`), so
changing the theme file restyles the whole app.

Three mechanisms keep it that way:

1. **The theme resets Tailwind's defaults** (`--color-*`, `--font-*`, `--text-*` set to
   `initial`). Palette classes like `bg-red-500` or `text-white` no longer exist; only the
   tokens declared in the theme do.
2. **`pnpm check:tokens` fails the build** on colour literals, palette or arbitrary
   colour/typography utilities, inline colour/font styles, raw CSS colour/font
   declarations and font imports outside the theme file. Because a removed palette class
   compiles to nothing *silently*, this check is what catches it.
3. **Typography goes through `<Heading>` and `<Text>`** (`components/typography.tsx`), so
   pages express intent (`level={2}`, `variant="muted"`) instead of sizes.

## Using tokens

Pick the token by **role**, not by appearance:

| Need | Use |
|---|---|
| page / text | `bg-background text-foreground` |
| raised surface | `bg-card text-card-foreground` |
| floating surface | `bg-popover text-popover-foreground` |
| main action, brand | `bg-primary text-primary-foreground` |
| secondary action | `bg-secondary text-secondary-foreground` |
| subdued text / surface | `text-muted-foreground`, `bg-muted` |
| hover / selected | `bg-accent text-accent-foreground` |
| error, danger | `destructive` (+ `-foreground`) |
| status | `success`, `warning`, `info` (+ `-foreground`) |
| scrim behind dialogs | `bg-overlay` |
| lines, inputs, focus | `border-border`, `border-input`, `ring-ring` |
| data series | `chart-1` … `chart-5` |

Opacity modifiers on tokens are fine (`bg-primary/10`, `border-destructive/40`). Run
`pnpm check:tokens --tokens` to print the token vocabulary actually available.

**When no token fits**, add one — never reach for a literal. Define the value in `:root`
and `.dark`, expose it in `@theme inline`, then use its utility. Name it by role
(`--highlight`, `--sidebar-muted`), not by colour (`--light-blue`). Procedure and
examples: [tokens](references/tokens.md).

## Typography

Fonts are self-hosted with Fontsource packages imported in the theme file; families are
exposed as `font-sans` (body), `font-heading` and `font-mono`. The type scale (`text-xs`
… `text-5xl`, each with its line-height and tracking) is defined in the theme. Headings
and text use the components; weights use Tailwind weight utilities. Changing fonts or the
scale is a theme-file edit only. Details: [typography](references/typography.md).

## shadcn/ui

Components are source code owned by the app in `components/ui/`. Add them with the CLI
(`pnpm dlx shadcn@latest add <name> --dry-run`, then without), never by copying from the
website. After every `add` run `pnpm check:tokens`: if the component uses a palette or
`white`/`black` utility, replace it with the matching token (e.g. `bg-black/50` →
`bg-overlay`). Look-and-feel changes that should apply everywhere are made in the
component's variants, using tokens; a page never re-styles a component with ad-hoc
colours. CLI commands, init options, customization rules and dark mode:
[shadcn](references/shadcn.md).

## Setting up or changing the theme

New app: follow [shadcn](references/shadcn.md) → "Initialize", then replace the generated
global CSS with [the theme template](assets/theme.css), copy
[typography.tsx](assets/typography.tsx) to `src/components/` and
[check-design-tokens.ts](assets/scripts/check-design-tokens.ts) to `scripts/`, and add
`"check:tokens": "tsx scripts/check-design-tokens.ts"` to the web app's package.json.

Ask the user for brand colour(s), fonts, radius and light/dark preference, or a
shadcn/create preset code; record the answers in docs/agents/stack.md under a "Design
system" heading. Applying a preset: `pnpm dlx shadcn@latest apply <code> --only theme`
(or `font`), then re-apply the resets and extra tokens from the template if the preset
overwrote them. Any theme change ends with `check:tokens`, a visual check of light and
dark mode, and contrast checked for every `<role>`/`<role>-foreground` pair (WCAG AA).

## Completion criteria

A UI change is done when `pnpm check:tokens`, typecheck, lint and tests pass, no file
other than `styles/theme.css` was needed to change colours or fonts, and new needs were
solved with new tokens or component variants rather than literals.
