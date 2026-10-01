# Typography

## Fonts

- Self-host with Fontsource variable packages (`pnpm add @fontsource-variable/<family>`)
  and import them **only** at the top of `theme.css`. No Google Fonts or other CDN links:
  no third-party requests (privacy/GDPR) and no layout shift from late font loading.
- Families are tokens: `--font-sans` (UI and body), `--font-heading` (headings; may equal
  sans), `--font-mono` (code, tabular identifiers). Each value starts with the Fontsource
  family name (e.g. `"Inter Variable"`) followed by a system fallback stack.
- Changing a font = change the package import and the token value. Nothing else.
- At most two families plus mono. Prefer variable fonts; when only static weights exist,
  import just the weights used (`@fontsource/<family>/400.css`, `…/600.css`).

## Type scale

Defined in the theme's `@theme` block as `--text-<step>` with `--text-<step>--line-height`
and optional `--text-<step>--letter-spacing`. The default scale is xs, sm, base, lg, xl,
2xl, 3xl, 4xl, 5xl — the steps shadcn components already use. Adjust values, not names;
add a step only for a real new role (e.g. `--text-display`) and use it through the
typography components.

## Components first

```tsx
<Heading level={1}>Orders</Heading>
<Text variant="lead">All orders placed in the last 30 days.</Text>
<Heading level={2} look={3}>Recent</Heading>   {/* h2 semantics, h3 look */}
<Text variant="muted">No orders yet.</Text>
<Text as="span" variant="caption">Updated 2 min ago</Text>
```

- One `<h1>` per page, levels without gaps; `look` decouples visuals from semantics.
- New recurring styles become a new `variant` in `typography.tsx`, never repeated
  utility strings across pages.
- Inside shadcn components and layouts, utilities from the scale (`text-sm font-medium`)
  are fine; arbitrary sizes (`text-[13px]`), families (`font-[…]`), line-heights and
  tracking values are not.
- Long-form rendered content (Markdown, CMS HTML) uses shadcn Typeset or a single
  `prose`-style wrapper whose styles reference tokens.

## Numbers and data

Tables and metrics use `tabular-nums`; identifiers and code use `font-mono`. Truncate
with `truncate`/`line-clamp-*` rather than smaller sizes.
