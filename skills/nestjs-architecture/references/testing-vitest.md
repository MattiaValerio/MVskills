# Testing with Vitest

## What to test at which level

| Seam | Catches | Misses | Tooling |
|---|---|---|---|
| Domain public functions | Invariants and pure business rules | Orchestration, HTTP and persistence | Plain Vitest |
| Use-case `execute()` with port fakes | Orchestration, returned Results and observable effects | Nest DI, HTTP mapping and real SQL | Plain Vitest, `new UseCase(fake)` |
| Adapter with PostgreSQL | Queries, mapping, constraints and transactions | HTTP and full use-case wiring | Vitest + Testcontainers or test DB |
| HTTP slice | Routing, validation, serialization, status and DI | Real SQL when adapters are replaced with fakes | Nest test module + supertest |

Use this table to propose seams for the slice. In TDD mode, load `tdd` and apply its
seam agreement before writing tests; reuse decisions already made by the coordinator.
A use-case spec is a useful starting proposal, not a mandatory extra layer when HTTP
was selected. Cover happy paths and observable errors at selected seams; identify
remaining risks such as SQL or serialization rather than claiming fakes prove them.

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

Assert on returned Results and behavior observed through application operations at
the agreed seam. Avoid inspecting the fake or querying storage behind that seam;
neither is part of the use-case interface.
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
    const { useCase } = setup();
    const result = await useCase.execute(validInput());
    expect(result.isOk()).toBe(true);
    // Assert the returned payload; verify persistence through an application query
    // at the agreed seam using the returned id, rather than inspecting the fake.
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
  it, so check DI in an integration test. Inspect the generated Vitest config and
  configure a metadata-capable transform such as `unplugin-swc` when needed
  (`plugins: [swc.vite()]`). Pure unit tests don't need it.
- Keep specs next to the code (`*.spec.ts`); e2e specs in `test/` (`*.e2e-spec.ts`) with a
  separate Vitest project or config.
- The CLI generates Jest-flavoured or Nest-TestingModule specs that don't match these
  conventions — generate with `--no-spec` and write specs from the templates instead.
