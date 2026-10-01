---
name: react-vite
description: Scaffold, implement or review Vite React apps using the mvskills frontend profile with TanStack Router/Query, Tailwind and typed API clients.
---

Read docs/agents/stack.md and load strict-typescript. Default: Vite, React, TypeScript,
TanStack Router, TanStack Query, Tailwind CSS, Biome, Vitest and React Testing Library.
Use pnpm and versions compatible with installed dependencies. Existing frontend
choices are preserved; SSR/SEO requirements may require another selected profile.

When scaffolding, use the official Vite React TypeScript template and current
installation docs. Align its scripts/tsconfigs with the workspace; retain useful
checks instead of merely deleting generated tooling. Use vite.config.ts, typed env
declarations, typed routes and an app-level QueryClientProvider. A minimal router
needs no route generator until the selected routing style requires one.
Configure app-local @/src-root imports in tsconfig and Vite/Vitest resolve.alias;
use extensionless imports. Read strict-typescript's alias reference for setup.

For backend interaction load api-contracts. Use generated paths/client and deliberate
query keys; query functions surface typed API errors and failures rather than
returning undefined as successful data. Handle pending, success and failure UI.
Configure /api proxy in Vite with no path stripping when Nest owns that prefix.
Use relative browser URLs; localhost is never baked into production bundles.

Use the current Tailwind Vite integration; do not copy obsolete version-specific
configuration. Add component libraries only when requested. Test the initial status
page's loading, ready and unavailable states with Vitest/Testing Library, plus a real
web→API smoke check when both apps exist. Mock at HTTP boundaries for component
tests; an entirely mocked frontend test does not prove the proxy works.

Public .env.example/.env values are documented and validated; browser env contains
no backend secrets. Production static hosting must support SPA route fallback and
/api proxying; load docker-coolify for that branch.

Finish with passing typecheck/lint/tests/build, observed runtime connection status,
and unresolved checks. Reuse conventions in feature work and Standards review.

Primary docs: [Vite proxy](https://vite.dev/config/server-options.html#server-proxy),
[TanStack Router](https://tanstack.com/router/latest/docs/framework/react/overview),
[TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview),
[Tailwind with Vite](https://tailwindcss.com/docs/installation/using-vite),
[Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
