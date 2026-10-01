# Testing with Vitest

## What to test at which level

| Level | Target | Tooling | Speed |
|---|---|---|---|
| Unit — domain | factories, invariants, pure functions | plain Vitest, no Nest | ms |
| Unit — use case | `execute()` against in-memory fakes of the ports | plain Vitest, `new UseCase(fake)` | ms |
| Integration — adapter | Kysely repository against a real Postgres | Vitest + Testcontainers (or a test DB) | s |
| E2E — slice | HTTP → controller → use case → fakes or real DB | `Test.createTestingModule` + `supertest` | s |

Default for a new slice: **one use-case spec** covering the happy path and every error
variant the use case can return. Add an e2e test when the slice has non-trivial HTTP
behaviour (status codes, auth, serialisation). Add an adapter integration test when the
query is more than a trivial select/insert.

## Fakes, not mocks

Ports are abstract classes, so a fake is a tiny real implementation:

```ts
// modules/orders/ports/order.repository.fake.ts  (test-only, colocated with the port)
export class InMemoryOrderRepository extends OrderRepository {
  readonly items = new Map<string, Order>();
  save(order: Order) { this.items.set(order.id, order); return okAsync(undefined); }
  findById(id: OrderId) {
    const o = this.items.get(id);
    return o ? okAsync(o) : errAsync({ type: 'OrderNotFound' as const, orderId: id });
  }
}
```

Assert on **state and returned Results**, not on "method X was called with Y".
Use `vi.fn()` only for ports whose effect is a call to the outside world (email, queue),
and even there prefer a fake that records sent items.

## Use case spec template

```ts
describe('PlaceOrderUseCase', () => {
  const setup = () => {
    const orders = new InMemoryOrderRepository();
    return { orders, useCase: new PlaceOrderUseCase(orders) };
  };

  it('stores the order and returns its id', async () => {
    const { orders, useCase } = setup();
    const result = await useCase.execute(validInput());
    expect(result.isOk()).toBe(true);
    expect(orders.items.size).toBe(1);
  });

  it('fails with OrderHasNoLines when lines are empty', async () => {
    const { useCase } = setup();
    const result = await useCase.execute({ ...validInput(), lines: [] });
    expect(result._unsafeUnwrapErr()).toEqual({ type: 'OrderHasNoLines' });
  });
});
```

`_unsafeUnwrap*` is fine **in tests only**.

## Nest + Vitest setup notes

- Nest relies on `emitDecoratorMetadata`. Vitest's default esbuild transform does not emit
  it, so DI breaks in e2e tests. NestJS 12 ESM projects scaffold a working Vitest config;
  in older or CommonJS projects add `unplugin-swc` to `vitest.config.ts`
  (`plugins: [swc.vite()]`). Pure unit tests don't need it.
- Keep specs next to the code (`*.spec.ts`); e2e specs in `test/` (`*.e2e-spec.ts`) with a
  separate Vitest project or config.
- The CLI generates Jest-flavoured or Nest-TestingModule specs that don't match these
  conventions — generate with `--no-spec` and write specs from the templates instead.
