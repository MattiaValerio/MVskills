// src/modules/__context__/infrastructure/kysely-__entity__.repository.ts
// The only place that knows table/column names. Maps rows <-> domain, driver errors -> InfrastructureError.
import { Inject, Injectable } from '@nestjs/common';
import type { Kysely, Selectable } from 'kysely';
import { ResultAsync, errAsync, okAsync } from 'neverthrow';
import { KYSELY } from '@/shared/infrastructure/database/database.module';
import type { DB } from '@/shared/infrastructure/database/db.generated';
import { infraError } from '@/shared/kernel/errors';
import type { __Entity__, __Entity__Id } from '@/modules/__context__/domain/__entity__';
import { __Entity__Repository } from '@/modules/__context__/ports/__entity__.repository';

type Row = Selectable<DB['__table__']>;

@Injectable()
export class Kysely__Entity__Repository extends __Entity__Repository {
  constructor(@Inject(KYSELY) private readonly db: Kysely<DB>) {
    super();
  }

  findById(id: __Entity__Id) {
    return ResultAsync.fromPromise(
      this.db.selectFrom('__table__').selectAll().where('id', '=', id).executeTakeFirst(),
      infraError('__Entity__Repository.findById'),
    ).andThen((row) =>
      row ? okAsync(toDomain(row)) : errAsync({ type: '__Entity__NotFound' as const, __entityCamel__Id: id }),
    );
  }

  save(entity: __Entity__) {
    const row = toRow(entity);
    return ResultAsync.fromPromise(
      this.db
        .insertInto('__table__')
        .values(row)
        .onConflict((oc) => oc.column('id').doUpdateSet(row))
        .execute(),
      infraError('__Entity__Repository.save'),
    ).map(() => undefined);
  }
}

function toDomain(row: Row): __Entity__ {
  return { id: row.id as __Entity__Id, createdAt: row.created_at };
}

function toRow(e: __Entity__) {
  return { id: e.id, created_at: e.createdAt };
}
