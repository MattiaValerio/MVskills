# Persistence with Kysely

## Setup (once per project)

- `src/shared/infrastructure/database/database.module.ts` is a `@Global()` module that
  provides a single `Kysely<DB>` instance under the `KYSELY` token and destroys it on
  shutdown (template in `assets/shared/infrastructure/database/`).
- `DB` types are generated, never hand-written: `kysely-codegen --out-file
  src/shared/infrastructure/database/db.generated.ts`. Regenerate after every migration.
- Migrations live in `migrations/` at the project root and run through Kysely's
  `Migrator` (or `kysely-ctl`). Never edit an applied migration â€” add a new one.

## Repository adapter shape

```ts
// modules/orders/infrastructure/kysely-order.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import type { Kysely, Selectable } from 'kysely';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { KYSELY } from '@/shared/infrastructure/database/database.module';
import type { DB, Orders } from '@/shared/infrastructure/database/db.generated';
import { infraError } from '@/shared/kernel/errors';
import type { Order, OrderId } from '@/modules/orders/domain/order';
import { OrderRepository } from '@/modules/orders/ports/order.repository';

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
â”œâ”€â”€ list-orders.controller.ts
â”œâ”€â”€ list-orders.dto.ts
â”œâ”€â”€ list-orders.query.ts          # abstract class ListOrdersQuery (the port, slice-local)
â””â”€â”€ list-orders.use-case.ts
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
it â€” most slices write a single aggregate and don't.
# Official documentation and bootstrap

For Kysely API facts start from https://kysely.dev/llms.txt and fetch relevant pages;
https://kysely.dev/llms-full.txt is a fallback searched by topic, not loaded wholesale.
Use PostgreSQL in this profile. Match installed Kysely/pg/codegen versions.
Migration and type generation are explicit commands with validated local .env
loading. Generate DB types from the actual migrated database, including an empty
domain schema; fabricated placeholder DB types are not verified. Kysely migration
bookkeeping does not require adding fictional domain tables.
