# Server data with TanStack Query

Snippets use the `orders` feature; `@app/api-client` stands for the workspace package
produced by api-contracts (it exports the generated `paths` type). Replace both.

## lib/api-error.ts and lib/api-client.ts — one client, one unwrap

The error type is importable everywhere (routes map 404 to notFound, features map types
to messages); the client is importable only from `features/*/api` and `lib/`.

```ts
// lib/api-error.ts
/** Failure of an API call, carrying the HTTP status and the backend error type. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly type: string,
    readonly body: unknown,
  ) {
    super(`API ${status}: ${type}`);
    this.name = 'ApiError';
  }
}

export const isApiError = (e: unknown, status?: number): e is ApiError =>
  e instanceof ApiError && (status === undefined || e.status === status);
```

```ts
// lib/api-client.ts
import type { paths } from '@app/api-client';
import createClient from 'openapi-fetch';
import { z } from 'zod';
import { ApiError } from '@/lib/api-error';

// Same-origin: schema paths already start with /api (see api-contracts).
export const api = createClient<paths>({ baseUrl: '' });

const ErrorBodySchema = z.object({ error: z.object({ type: z.string() }).loose() });

type FetchResult<T, E> =
  | { data: T; error?: never; response: Response }
  | { data?: never; error: E; response: Response };

/** Typed data on success; throws ApiError otherwise. Never resolves to a fake success. */
export async function unwrap<T, E>(request: Promise<FetchResult<T, E>>): Promise<T> {
  const result = await request;
  if (result.error !== undefined || !result.response.ok) {
    const parsed = ErrorBodySchema.safeParse(result.error);
    const type = parsed.success ? parsed.data.error.type : 'UnknownError';
    throw new ApiError(result.response.status, type, result.error);
  }
  if (result.data === undefined) {
    throw new ApiError(result.response.status, 'MissingResponseBody', undefined);
  }
  return result.data;
}

/** Only for endpoints whose contract declares a bodyless success. */
export async function unwrapEmpty<E>(
  request: Promise<{ response: Response; error?: E }>,
): Promise<void> {
  const result = await request;
  if (result.error !== undefined || !result.response.ok) {
    const parsed = ErrorBodySchema.safeParse(result.error);
    throw new ApiError(
      result.response.status,
      parsed.success ? parsed.data.error.type : 'UnknownError',
      result.error,
    );
  }
}
```

`unwrap` is for endpoints with a response body. For bodyless success (such as 204),
use a separate `unwrapEmpty` returning `Promise<void>`: check `response.ok`, parse
errors through the same schema, and return without inventing data. Test JSON success,
204 success, HTTP errors and an unexpectedly absent body. Keep endpoint response types
derived from the contract; assertions must not manufacture success.

## lib/query-client.ts

```ts
import { QueryClient } from '@tanstack/react-query';
import { isApiError } from '@/lib/api-error';

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Client errors won't fix themselves on retry.
        retry: (failureCount, error) =>
          !(isApiError(error) && error.status < 500) && failureCount < 2,
      },
    },
  });
```

## Keys — one factory per feature

```ts
// features/orders/api/order.keys.ts
import type { OrderListSearch } from '@/features/orders/order.schemas';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (search: OrderListSearch) => [...orderKeys.lists(), search] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (orderId: string) => [...orderKeys.details(), orderId] as const,
};
```

Hierarchical keys make invalidation precise: `orderKeys.lists()` refreshes every list
variant, `orderKeys.all` everything about orders. Inline array keys are not allowed
outside the factory.

## Queries — queryOptions factories

```ts
// features/orders/api/order.queries.ts
import { queryOptions } from '@tanstack/react-query';
import { api, unwrap } from '@/lib/api-client';
import type { OrderListSearch } from '@/features/orders/order.schemas';
import { orderKeys } from '@/features/orders/api/order.keys';

export const orderQueries = {
  list: (search: OrderListSearch) =>
    queryOptions({
      queryKey: orderKeys.list(search),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/api/orders', { params: { query: search }, signal })),
    }),
  detail: (orderId: string) =>
    queryOptions({
      queryKey: orderKeys.detail(orderId),
      queryFn: ({ signal }) =>
        unwrap(api.GET('/api/orders/{orderId}', { params: { path: { orderId } }, signal })),
    }),
};
```

Pass `signal` so navigating away cancels the request. Response types come from the
contract; never re-declare them or cast JSON. Derive view models with `select` or in
components, not by mutating cached data.

## Mutations — hook per action, invalidation included

This example assumes cancellation declares a bodyless 204 success in the contract.
Use `unwrap` instead when the endpoint declares a JSON response body.

```ts
// features/orders/api/order.mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, unwrapEmpty } from '@/lib/api-client';
import { orderKeys } from '@/features/orders/api/order.keys';

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      unwrapEmpty(api.POST('/api/orders/{orderId}/cancel', { params: { path: { orderId } } })),
    // Returning the promise keeps isPending true until fresh data is loaded.
    onSuccess: (_data, orderId) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) }),
      ]),
  });
}
```

UI concerns (toast, navigate, close dialog) go in the `mutate(vars, { onSuccess })` call
of the component, not in the hook, so the hook stays reusable. Optimistic updates only
when the UX needs them; follow the official guide and roll back on error.

## Errors → messages

```ts
// features/orders/order.errors.ts
import { isApiError } from '@/lib/api-error';

const messages: Readonly<Record<string, string>> = {
  OrderNotFound: 'Order not found.',
  OrderAlreadyCancelled: 'This order has already been cancelled.',
};

export const orderErrorMessage = (error: unknown): string | undefined =>
  isApiError(error) ? messages[error.type] : undefined;
```

Show the mapped message inline (Alert, Field error, toast). When it returns
`undefined`, the error is unexpected: rethrow or let the route error component handle
it. User-facing copy follows the app's language/i18n setup.

## Checklist

- Keys only from the factory; queries only through `queryOptions` factories.
- Every query function passes `signal` and goes through `unwrap`.
- Every mutation invalidates the narrowest affected key prefixes.
- Components and routes never import `@/lib/api-client` or call `fetch`.
