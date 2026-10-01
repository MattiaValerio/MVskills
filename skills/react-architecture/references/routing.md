# Navigation with TanStack Router

File-based routing through the TanStack Router Vite plugin with automatic code
splitting (`tanstackRouter({ target: 'react', autoCodeSplitting: true })`, placed before
the React plugin). `routeTree.gen.ts` is generated: commit it, never edit it, and keep it
out of lint/format.

## router.tsx

```tsx
import { createRouter } from '@tanstack/react-router';
import { NotFound, RouteError, RoutePending } from '@/components/feedback/route-states';
import { createQueryClient } from '@/lib/query-client';
import { routeTree } from '@/routeTree.gen';

export const queryClient = createQueryClient();

export const routerDefaults = {
  defaultPendingComponent: RoutePending,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: NotFound,
};

export const router = createRouter({
  ...routerDefaults,
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // Query owns caching: let every preload/navigation reach the loader.
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
```

`main.tsx` renders `<QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>`.

## routes/__root.tsx

```tsx
import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { AppShell } from '@/components/layout/app-shell';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
```

Devtools (router and query) are mounted here behind `import.meta.env.DEV`.

## List route: search params + loader + suspense read

```tsx
// routes/orders/index.tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { orderQueries } from '@/features/orders/api/order.queries';
import { OrderList } from '@/features/orders/components/order-list';
import { OrderListSearchSchema } from '@/features/orders/order.schemas';

export const Route = createFileRoute('/orders/')({
  validateSearch: OrderListSearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(orderQueries.list(deps)),
  component: OrdersPage,
});

function OrdersPage() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(orderQueries.list(search));
  return <OrderList orders={data.items} search={search} />;
}
```

```ts
// features/orders/order.schemas.ts
import { z } from 'zod';

export const OrderListSearchSchema = z.object({
  page: z.number().int().min(1).default(1).catch(1),
  status: z.enum(['all', 'placed', 'cancelled']).default('all').catch('all'),
  q: z.string().default('').catch(''),
});
export type OrderListSearch = z.infer<typeof OrderListSearchSchema>;
```

With Zod v4 pass the schema directly to `validateSearch` (no adapter). Give every field
`.default(x).catch(x)`: `default` makes the param optional in the *input* type, so
`<Link to="/orders">` compiles without `search`; `catch` turns a malformed URL into the
fallback instead of an error. With `.catch()` alone, links to the route require `search`. `loaderDeps` must list exactly what the loader uses, otherwise the
loader won't rerun when those params change.

## Detail route: params + notFound

```tsx
// routes/orders/$orderId.tsx
import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound } from '@tanstack/react-router';
import { orderQueries } from '@/features/orders/api/order.queries';
import { OrderDetail } from '@/features/orders/components/order-detail';
import { isApiError } from '@/lib/api-error';

export const Route = createFileRoute('/orders/$orderId')({
  loader: async ({ context, params }) => {
    try {
      await context.queryClient.ensureQueryData(orderQueries.detail(params.orderId));
    } catch (error) {
      if (isApiError(error, 404)) throw notFound();
      throw error;
    }
  },
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();
  const { data } = useSuspenseQuery(orderQueries.detail(orderId));
  return <OrderDetail order={data} />;
}
```

## Route file rules

- A route file contains: validation, loader, `component`, and per-route
  `pendingComponent`/`errorComponent`/`notFoundComponent` only when they differ from the
  defaults. Markup beyond a page layout belongs in the feature's components.
- Non-critical data (sidebar widgets, counts) is read with `useQuery` in the component,
  without blocking the loader.
- Child components that need search params use `getRouteApi('/orders/')` instead of
  importing the `Route` object (keeps code splitting and avoids importing from routes/).

## Navigating

- `<Link to="/orders/$orderId" params={{ orderId }}>` and
  `<Link from="/orders/" to="." search={(prev) => ({ ...prev, page: prev.page + 1 })}>`;
  every target and param is type-checked. Always pass `from` when updating search params:
  without it `prev` is loosely typed and its fields may be `undefined`. Style links through the design-system (shadcn Button
  `render`/`asChild` according to the installed base, or the Link component pattern).
- Programmatic: `const navigate = useNavigate({ from: Route.fullPath })`, then
  `navigate({ search: … })` or `navigate({ to: …, params: … })`.
- Active state: `activeProps`/`data-status="active"` on `Link`, styled with tokens.

## Authentication (only when the profile selected auth)

A pathless layout `routes/_authenticated.tsx` with `beforeLoad` that reads the session
from router context and `throw redirect({ to: '/login', search: { redirect: location.href } })`.
Protected routes live under `routes/_authenticated/`. Never guard inside components.

Official pages: routing/file-based-routing.md, guide/search-params.md,
guide/data-loading.md, guide/external-data-loading.md, guide/not-found-errors.md,
guide/authenticated-routes.md (all under https://tanstack.com/router/latest/docs/).
