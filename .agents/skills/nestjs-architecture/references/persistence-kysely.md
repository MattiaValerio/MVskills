# Persistence with Kysely

## Setup (once per project)

- `src/shared/infrastructure/database/database.module.ts` is a `@Global()` module that
  provides a single `Kysely<DB>` instance under the `KYSELY` token and destroys it on
  shutdown (template in `assets/shared/infrastructure/database/`).
- `DB` types are generated, never hand-written: `kysely-codegen --out-file
  src/shared/infrastructure/database/db.generated.ts`. Regenerate after every migration.
- Migrations live in `migrations/` at the project root and run through Kysely's
  `Migrator` (or `kysely-ctl`). Never edit an applied migration — add a new one.

## Repository adapter shape

```ts
// modules/orders/infrastructure/kysely-order.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import type { Kysely, Selectable } from 'kysely';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { KYSELY } from '../../../shared/infrastructure/database/database.module.js';
import type { DB, Orders } from '../../../shared/infrastructure/database/db.generated.js';
import { infraError } from '../../../shared/kernel/errors.js';
import type { Order, OrderId } from '../domain/order.js';
import { OrderRepository } from '../ports/order.repository.js';

@Injectable()
export class KyselyOrderRepository extends OrderRepository {
  constructor(@Inject(KYSELY) private readonly db: Kysely<DB>) {
    super();
  }

  findById(id: OrderId) {
    return ResultAsync.fromPromise(
      this.db.selectFrom('orders').selectAll().where('id', '=', id).executeTakeFirst(),
      infraError('OrderRepository.findById'),
    ).andThen((row) =>
      row ? okAsync(toDomain(row)) : errAsync({ type: 'OrderNotFound' as const, orderId: id }),
    );
  }

  save(order: Order) {
    return ResultAsync.fromPromise(
      this.db
        .insertInto('orders')
        .values(toRow(order))
        .onConflict((oc) => oc.column('id').doUpdateSet(toRow(order)))
        .execute(),
      infraError('OrderRepository.save'),
    ).map(() => undefined);
  }
}

// Mapping is explicit and local to the adapter. The domain never sees row types.
function toDomain(row: Selectable<Orders>): Order { /* ... */ }
function toRow(order: Order) { /* ... */ }
```

Rules:

- The adapter is the **only** place where table/column names appear.
- Translate "row missing" into the domain error the port promises; translate driver
  errors into `InfrastructureError` via `infraError(...)`. Unique-constraint violations
  that are business meaningful (e.g. email taken) become domain errors here.
- Aggregates with child rows (order + lines) are loaded and saved as a whole by the
  repository. Use `jsonArrayFrom` from `kysely/helpers/postgres` for nested reads.

## Reads that don't need the domain model

For list/report endpoints, building full entities is waste. A slice may define its own
**query port** returning a read model shaped for the response:

```
features/list-orders/
├── list-orders.controller.ts
├── list-orders.dto.ts
├── list-orders.query.ts          # abstract class ListOrdersQuery (the port, slice-local)
└── list-orders.use-case.ts
infrastructure/kysely-list-orders.query.ts   # adapter
```

Slice-local ports are allowed because nobody else uses them. The adapter still lives in
`infrastructure/`, and the module binds it.

## Transactions

When one use case must write through several repositories atomically, add a
`UnitOfWork` port in `shared/kernel`:

```ts
export abstract class UnitOfWork {
  abstract run<T, E>(work: (tx: TransactionContext) => ResultAsync<T, E>): ResultAsync<T, E | InfrastructureError>;
}
```

Its Kysely adapter opens `db.transaction()`, and repositories accept an optional
`TransactionContext` argument. Do **not** introduce this until a use case actually needs
it — most slices write a single aggregate and don't.
