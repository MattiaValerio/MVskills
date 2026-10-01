---
name: react-feature
description: Step-by-step workflow to add or change a screen, page or user flow in a Vite React app of the mvskills frontend profile — from screen brief to route, query/mutation options, shadcn-based UI, loading/error/empty states, tests and automated validation. Use when implementing a frontend feature, ticket or user story, adding a page or form, or wiring UI to new backend endpoints in that profile; also in parallel/worktree mode.
metadata:
  internal: true
---

## Profile scope and official documentation

Read docs/agents/stack.md when present. Applies to apps in the default frontend profile
or explicitly adopting it; existing apps keep their conventions and this skill does not
authorize migration. Before starting, load react-architecture (structure, routing, data),
design-system (theme, typography, shadcn), api-contracts and strict-typescript if they
are not already loaded. Official docs: the llms.txt indexes named in those skills.

Sections describe responsibilities, not mandatory test-last ordering. When TDD is
selected, load tdd and build one behavior at a time; section 8 then starts first.

# Adding a feature to the frontend

## 1. Frame the screen

Write a screen brief before touching code (reply or ticket):

```
Feature:   orders/order-list              (feature folder / main component)
Routes:    /orders (list), /orders/$orderId (detail)
URL state: page, status, q                (search params, with fallbacks)
Reads:     GET /api/orders, GET /api/orders/{orderId}
Writes:    POST /api/orders/{orderId}/cancel → invalidates lists + detail
States:    pending, empty, error (OrderNotFound → 404 page), success
UI parts:  Table, Badge, AlertDialog, Pagination (shadcn); PageHeader (app)
```

Ask the user one question when an interaction or an error behaviour is genuinely
ambiguous; guessing UX on errors produces the most rework.

## 2. Check the contract

Every endpoint in the brief must exist in the generated client (`paths` from the
api-contracts package). A missing or wrong endpoint needs a contract decision. When the project owns a
NestJS backend, use nestjs-feature and regenerate the client. Before that backend
exists, agree and version a provisional OpenAPI contract, generate the client and
use contract-typed MSW handlers in tests or an explicitly selected mock preview.
Record real integration as pending. Normal `pnpm dev` targets our backend. External
services are integrated by our server, which validates and adapts their responses;
the browser calls only our own API. Never hand-write response types or silently
replace a failing live backend with mocks.

## 3. Feature data layer

In `src/features/<feature>/api/`: extend the key factory, add `queryOptions` factories
and mutation hooks following react-architecture's data-fetching reference. Each mutation
lists the key prefixes it invalidates. Add Zod schemas for search params and forms in
`<feature>.schemas.ts`, and error-type → message entries in `<feature>.errors.ts`.

## 4. Routes

Create or edit files under `src/routes/` (react-architecture routing reference):
`validateSearch`, `loaderDeps`, `loader` with `ensureQueryData`, `component` reading with
`useSuspenseQuery`, `notFound()` for 404s. Regenerate the route tree (`pnpm
routes:generate` when available, otherwise the Vite plugin during `dev`/`build`) before
typechecking. Navigation uses typed `<Link>`/`useNavigate`, never string-built URLs.

## 5. UI

1. List the UI parts; check `components/ui/` and `components/` for what exists.
2. Missing shadcn components: `pnpm dlx shadcn@latest add <name> --dry-run`, then add,
   then `pnpm check:tokens` and fix any non-token utility.
3. Build feature components in `features/<feature>/components/` from those parts, with
   `<Heading>`/`<Text>` for typography and semantic tokens for every colour.
4. A visual need the theme doesn't cover becomes a new token or variant (design-system),
   decided once — never a literal in the feature.
5. Every data-backed component has its pending (Skeleton), empty (Empty), error (Alert or
   route error) and success states. Buttons triggering mutations show `isPending` and are
   disabled meanwhile; errors show the mapped message.
6. Accessibility: semantic elements, labelled controls (Field + Label), focus visible,
   keyboard-operable dialogs and menus (shadcn provides them; don't break them).

## 6. Responsive and dark mode

Check the screen at mobile and desktop widths and in both colour modes. Any difference
needed between modes is a token question, not a `dark:` palette class.

## 7. Wiring

Navigation entries (sidebar, menus) go in `components/layout/` through typed links.
Nothing else is registered by hand: the route tree is generated.

## 8. Tests

With Vitest, Testing Library and MSW (react-architecture testing reference): for each
screen, success, empty, API error and pending; for each mutation, the user flow through
to the refreshed UI. Assert by role and accessible name.

## 9. Validate — non-negotiable

```bash
pnpm exec tsx <path-to-this-skill>/scripts/validate.ts <web-app-dir>
```

It runs route generation (if scripted), typecheck, lint, `check:tokens`, dependency
rules, tests and build. Prefer an existing pnpm check covering all stages. Fix until
green. Never weaken a rule to pass — no casts, `biome-ignore`, token-check exceptions or
depcruise exclusions; if a rule seems wrong for this case, stop and explain to the user.

## 10. Report

Screen brief (final), routes added/changed, files created/modified, shadcn components
added, new tokens/variants (with reason), endpoints used, validation output, deferred items.

## Parallel / worktree mode

When several agents build features of the same app concurrently:

- Work only inside `features/<feature>/` and your own `routes/` files.
- Don't edit `styles/theme.css`, `components/ui/*` or `components/layout/*`. Needed
  tokens, variants, shadcn additions and navigation entries go in the report under
  "Shared changes to apply" with exact values; use the nearest existing token meanwhile.
- `routeTree.gen.ts` will conflict: regenerate it after merging instead of resolving
  conflicts by hand.

The integration agent applies every "Shared changes to apply" block once, regenerates
the route tree and runs the validation helper on the merged result.
