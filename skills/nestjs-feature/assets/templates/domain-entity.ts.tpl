// src/modules/__context__/domain/__entity__.ts â€” pure TypeScript, no framework imports.
import { err, ok, type Result } from 'neverthrow';
import type { __Entity__Error } from '@/modules/__context__/domain/__entity__.errors';

export type __Entity__Id = string & { readonly __brand: '__Entity__Id' };

export interface __Entity__ {
  readonly id: __Entity__Id;
  // readonly fields only â€” state changes return a new object
  readonly createdAt: Date;
}

/** Creates a valid __Entity__ or explains why it can't. */
export function create__Entity__(input: {
  id: __Entity__Id;
  now: Date;
}): Result<__Entity__, __Entity__Error> {
  // check invariants here: return err({ type: '...' }) on violation
  return ok({ id: input.id, createdAt: input.now });
}

/** Example state transition: pure function, returns Result. */
// export function cancel__Entity__(e: __Entity__, now: Date): Result<__Entity__, __Entity__Error> { ... }
