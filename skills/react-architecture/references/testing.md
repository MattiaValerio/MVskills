# Frontend testing

Vitest + React Testing Library + MSW. Mock at the HTTP boundary (MSW handlers typed from
the contract), never by mocking query hooks or the API client: the point is to exercise
`unwrap`, keys, loaders and UI states together.

| Seam | Catches | Misses | How |
|---|---|---|---|
| Component with props | Visible rendering and local interaction | Routing, queries and live API | Render, assert roles |
| Feature screen | Route, loader, query and UI states | Real proxy, backend and browser layout | Router at a URL with MSW |
| Mutation flow | User action, request and refreshed UI | Real server persistence | user-event + MSW |
| Public pure function | Schema or mapping behavior | Composed screen behavior | Plain Vitest |

In TDD mode, load `tdd` and apply its seam agreement before writing tests; reuse
decisions from the coordinator. The table supplies candidates and coverage limits,
not four mandatory layers. A selected data-backed screen seam covers **success,
empty, API error and pending**
(pending can be asserted by delaying the MSW handler). Query by role and accessible name
(`getByRole('button', { name: /cancel/i })`), not by class names or test ids, unless no
accessible handle exists.

## Rendering a route in tests

```tsx
// src/test/render-route.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render } from '@testing-library/react';
import { routeTree } from '@/routeTree.gen';
import { routerDefaults } from '@/router';

export function renderRoute(url: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createRouter({
    ...routerDefaults,
    routeTree,
    context: { queryClient },
    history: createMemoryHistory({ initialEntries: [url] }),
  });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { ...view, router, queryClient };
}
```

A fresh `QueryClient` per test prevents cache leaks between tests. Return immediately
after rendering: awaiting the loader hides the initial pending state. Use `findByRole`
for eventual states. For pending, hold the MSW response behind a controlled promise,
assert the production pending UI, release the response and assert success; clear
clients and unmount after each test. Keep production pending timing and defaults.
MSW runs in test setup only; normal development calls the real backend.

## MSW

Handlers live in `src/test/handlers/<feature>.ts` and return bodies typed from the
contract (`paths['/api/orders']['get']['responses']['200']['content']['application/json']`)
so a contract change breaks the test at compile time. Start the server in the Vitest
setup file with `onUnhandledRequest: 'error'` — an unmocked request is a test bug.

A fully mocked frontend does not prove the `/api` proxy works; keep the real web→API
smoke check described in react-vite.
