// src/modules/__context__/ports/__entity__.repository.fake.ts — test-only in-memory implementation.
// Keep it in sync with the port in the same change. Never import it from production code.
import { errAsync, okAsync } from 'neverthrow';
import type { __Entity__, __Entity__Id } from '../domain/__entity__.js';
import { __Entity__Repository } from './__entity__.repository.js';

export class InMemory__Entity__Repository extends __Entity__Repository {
  readonly items = new Map<string, __Entity__>();

  constructor(seed: readonly __Entity__[] = []) {
    super();
    for (const e of seed) this.items.set(e.id, e);
  }

  save(entity: __Entity__) {
    this.items.set(entity.id, entity);
    return okAsync(undefined);
  }

  findById(id: __Entity__Id) {
    const found = this.items.get(id);
    return found
      ? okAsync(found)
      : errAsync({ type: '__Entity__NotFound' as const, __entityCamel__Id: id });
  }
}
