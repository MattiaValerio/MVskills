---
name: react-architecture
description: Structure, navigation and server-data rules for Vite React apps in the mvskills frontend profile — feature folders, TanStack Router routes, loaders and URL state, TanStack Query options, mutations and API errors. Use when writing, moving, reviewing or refactoring frontend code in that profile, or deciding where a frontend file, route, query or piece of state belongs.
---

## Profile scope and official documentation

Read docs/agents/stack.md when present. Apply these rules only to apps selecting the
default frontend profile (Vite, React, TanStack Router/Query, Tailwind, shadcn/ui) or
explicitly adopting it. Existing apps with other conventions keep them; this skill does
not authorize migration. Load strict-typescript and api-contracts; visual rules live in
design-system, the per-feature procedure in react-feature, scaffolding in react-vite.

For API facts start from https://tanstack.com/router/latest/llms.txt and
https://tanstack.com/query/latest/llms.txt and fetch one linked Markdown page at a time
(prefer React pages). Match docs to installed versions; the profile owns the choices.

# Frontend architecture

The frontend is organised by **feature**, mirroring the backend's vertical slices: a
feature folder owns its server-data access, its components and its schemas. Routes are
thin entrypoints that wire URL → data → feature UI. Shared folders hold only what has no
business meaning.

```
src/
├── main.tsx                    # QueryClient + router + providers, nothing else
├── router.tsx                  # createRouter, router context type, defaults
├── routes/                     # TanStack Router file routes (thin)
│   ├── __root.tsx              # app shell, devtools, root error/notFound
│   ├── index.tsx
│   └── orders/
│       ├── index.tsx           # /orders        — list, search params
│       └── $orderId.tsx        # /orders/:id    — detail
├── features/
│   └── orders/
│       ├── api/                # the ONLY place that calls the API client
│       │   ├── order.keys.ts
│       │   ├── order.queries.ts
│       │   └── order.mutations.ts
│       ├── components/         # feature UI, composed from design-system parts
│       ├── order.schemas.ts    # search-param and form schemas (Zod)
│       └── order.errors.ts     # API error type → user message
├── components/
│   ├── ui/                     # shadcn/ui source (owned by design-system)
│   ├── layout/                 # shell, navigation, page header
│   ├── feedback/               # pending / error / empty states
│   └── typography.tsx          # Heading / Text (design-system)
├── lib/
│   ├── api-client.ts           # client instance + unwrap()
│   ├── api-error.ts            # ApiError, isApiError
│   ├── query-client.ts
│   └── utils.ts                # cn()
└── styles/theme.css            # single theme source (design-system)
```

## Dependency rules

Enforced by dependency-cruiser ([config](assets/dependency-cruiser.cjs)); copy it to the
app as `.dependency-cruiser.cjs` and add `"check:arch": "depcruise src --config
.dependency-cruiser.cjs"`.

1. **Routes are entrypoints.** Nothing imports from `routes/` except the generated
   route tree. A route imports features and shared code.
2. **A feature never imports another feature.** Shared needs move to `components/`,
   `lib/` or are composed in the route. Features stay deletable and parallelizable.
3. **Shared code is a leaf.** `components/` and `lib/` never import `features/` or
   `routes/`.
4. **Only `features/*/api` and `lib/` touch the API client** (`lib/api-client.ts`). Components and routes get
   server data through query/mutation options, never through `fetch` or the client.

## Server data (TanStack Query)

Browser API traffic goes only to our server. External API credentials, requests and
response adaptation belong on the backend; the frontend consumes our public contract.

Server state lives in the Query cache, nowhere else. Each feature exposes a key factory
and `queryOptions` factories; every consumer (loader, component, prefetch, invalidation)
reuses them, so keys and types cannot drift. Query functions call the generated client
through `unwrap()`, which returns typed data or throws a typed `ApiError` — never
`undefined` disguised as success. Mutations invalidate by key prefix after success.
Patterns and full examples: [data-fetching](references/data-fetching.md).

## Navigation and URL state (TanStack Router)

File-based routing with the Vite plugin and automatic code splitting. The URL is the
state store for anything a user may bookmark, share or go back to: filters, sorting,
pagination, tabs, selected item. Search params are validated with a Zod schema passed
directly to `validateSearch`, each field with `.default(x).catch(x)`. Loaders prefetch with
`context.queryClient.ensureQueryData(...)` and components read with `useSuspenseQuery`,
so data is ready on first paint and the route's pending/error components handle the rest.
Links are typed `<Link to params search>`; string-built hrefs bypass type checking.
Details: [routing](references/routing.md).

## State placement, in order of preference

URL search params → Query cache → component state (`useState`) → feature context.
A global client store is introduced only for genuinely global client state (e.g. a
multi-step editor) and recorded in stack.md with the reason.

## UI states are part of the feature

Every data-backed screen has designed pending, error, empty and success states, built
from `components/feedback/` and shadcn parts (Skeleton, Alert, Empty, Spinner). Backend
errors carry `{ error: { type } }` (nestjs profile); each feature maps the types it can
receive to user-facing messages in `<feature>.errors.ts` and lets unexpected ones reach
the route error component. Forms use the library recorded in stack.md with shadcn Field;
when none is recorded, propose TanStack Form and record the decision.

## References

- [data-fetching](references/data-fetching.md) — api client wrapper, keys, queries,
  mutations, invalidation, errors. Read before touching `features/*/api` or `lib/api-*.ts`.
- [routing](references/routing.md) — route anatomy, search params, loaders, pending/error/
  notFound, auth guards, navigation. Read before creating or changing a route.
- [testing](references/testing.md) — component, route and hook tests with Vitest,
  Testing Library and HTTP-boundary mocks. Read before writing tests.
