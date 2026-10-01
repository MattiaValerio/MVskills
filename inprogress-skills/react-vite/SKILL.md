---
name: react-vite
description: Scaffold or reconcile Vite React apps in the mvskills frontend profile — project creation, tooling, env, /api proxy, providers and the initial status page. Use when creating a frontend app, adopting the profile in an existing one, or changing its build, dev server or test setup.
metadata:
  internal: true
---

Read docs/agents/stack.md and load strict-typescript. Default: Vite, React, TypeScript,
TanStack Router, TanStack Query, Tailwind CSS v4, shadcn/ui, Biome, Vitest, React Testing
Library and MSW. Use pnpm and versions compatible with installed dependencies. Existing
frontend choices are preserved; SSR/SEO requirements may require another selected profile.
This skill owns the scaffold. Feature code follows react-architecture (structure, routes,
data) and design-system (theme, typography, components); feature work uses react-feature.

When scaffolding, use the official Vite React TypeScript template and current
installation docs. Align its scripts/tsconfigs with the workspace; retain useful
checks instead of merely deleting generated tooling. Use vite.config.ts and typed env
declarations. Add the TanStack Router Vite plugin (file-based routing, automatic code
splitting) before the React plugin, plus @tanstack/router-cli with a
`routes:generate` script (`tsr generate`) so agents can regenerate the route tree
without a dev server. Configure app-local @/src-root imports in tsconfig and Vite/Vitest
resolve.alias; use extensionless imports. Read strict-typescript's alias reference.

Lay down the skeleton defined by react-architecture: router.tsx with the QueryClient in
router context, routes/__root.tsx, lib/api-client.ts and lib/api-error.ts, lib/query-client.ts,
components/feedback route states, and its .dependency-cruiser.cjs. Then initialize the
design system per design-system: shadcn init, theme.css from its template, typography
components, check-design-tokens script. Package scripts: dev, build, typecheck, lint,
test, routes:generate, check:tokens, check:arch.

For backend interaction load api-contracts. Configure /api proxy in Vite with no path
stripping when Nest owns that prefix. Use relative browser URLs; localhost is never
baked into production bundles.

Build the initial status page through the generated client with the same patterns as
features. Test its loading, ready and unavailable states with Vitest/Testing Library and
MSW, plus a real web→API smoke check when both apps exist. An entirely mocked frontend
test does not prove the proxy works.

Public .env.example/.env values are documented and validated; browser env contains
no backend secrets. Production static hosting must support SPA route fallback and
/api proxying; load docker-coolify for that branch.

Finish with passing typecheck/lint/check:tokens/check:arch/tests/build, observed runtime
connection status, and unresolved checks.

Primary docs: [Vite proxy](https://vite.dev/config/server-options.html#server-proxy),
[TanStack Router](https://tanstack.com/router/latest/llms.txt),
[TanStack Query](https://tanstack.com/query/latest/llms.txt),
[Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite),
[shadcn/ui](https://ui.shadcn.com/llms.txt),
[Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
