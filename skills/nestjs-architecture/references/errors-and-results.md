# Errors and Results

## The two kinds of failure

**Expected failures** are part of the business: "order not found", "insufficient stock",
"email already registered". They are modelled as values (discriminated unions) and flow
through `Result` / `ResultAsync` from `neverthrow`. The type signature tells the caller
everything that can go wrong.

**Unexpected failures** are bugs or broken infrastructure: a null where there shouldn't be
one, Postgres unreachable. Infrastructure failures that a use case cannot meaningfully
react to are wrapped once in the adapter as `InfrastructureError` and flow as a Result
too, so they map to a 500/503 deterministically. Real bugs may throw â€” Nest's default
exception filter turns them into 500s.

Rule of thumb: if a product manager could write the error message, it's a domain error.

## Shapes

```ts
// shared/kernel/errors.ts
export type InfrastructureError = {
  type: 'InfrastructureError';
  cause: unknown;
  operation: string;          // e.g. 'OrderRepository.save'
};

export const infraError = (operation: string) => (cause: unknown): InfrastructureError => ({
  type: 'InfrastructureError',
  cause,
  operation,
});
```

Domain errors live in `<context>/domain/<entity>.errors.ts` as a union with a `type`
discriminant (see `slice-anatomy.md`). Use PascalCase `type` values that read as facts:
`OrderNotFound`, `OrderAlreadyCancelled`. Add only the data the caller needs to build a
message (ids, limits) â€” never stack traces or raw DB errors.

## neverthrow patterns you'll use

```ts
import { ok, err, okAsync, errAsync, ResultAsync } from 'neverthrow';

// Wrap a promise that may reject (adapters only)
ResultAsync.fromPromise(db.selectFrom('orders')...executeTakeFirst(), infraError('OrderRepository.findById'));

// Chain dependent steps
findOrder(id)
  .andThen((order) => cancel(order))          // order â†’ ResultAsync<Order, E2>
  .andThen((order) => repo.save(order).map(() => order))
  .map(toOutput);

// Sync Result into async chain
domainFactory(input).asyncAndThen((entity) => repo.save(entity));

// Run independent steps in parallel
ResultAsync.combine([repoA.find(a), repoB.find(b)]).andThen(([x, y]) => ...);

// Recover from a specific error
repo.findById(id).orElse((e) => (e.type === 'OrderNotFound' ? okAsync(null) : errAsync(e)));
```

Avoid: `.isOk()` + `._unsafeUnwrap()` in production code, `try/catch` around Result
chains, `async` functions that return `Result` wrapped in a `Promise` (return
`ResultAsync` instead â€” it is thenable and composes).

## Result â†’ HTTP (the only place errors become HTTP)

The helper lives in `shared/http/result-to-http.ts` (template in `assets/shared/http/`).
Each context declares one status table next to its module; the controller passes it to
`unwrapOrThrowHttp(result, table)`.

```ts
// modules/orders/orders.http-errors.ts
import type { OrderError } from '@/modules/orders/domain/order.errors';

export const orderHttpErrors = {
  OrderHasNoLines: 422,
  InvalidQuantity: 422,
  OrderNotFound: 404,
  OrderAlreadyCancelled: 409,
} as const satisfies Record<OrderError['type'], number>;
```

```ts
// in a controller
return unwrapOrThrowHttp(await this.placeOrder.execute(body), orderHttpErrors);
```

The types do the policing: `satisfies` fails when a new `OrderError` variant has no
status, and `unwrapOrThrowHttp` fails to compile when the table does not cover every
error type the use case can return. Never silence either with a default branch or a cast
â€” add the mapping.

The response body is always `{ error: { type, ...data } }` so clients can switch on
`type`. `InfrastructureError` is handled by the helper itself â†’ 503 with only
`{ error: { type: 'InfrastructureError' } }` (the cause is logged, never returned).
