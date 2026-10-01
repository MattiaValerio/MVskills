// src/modules/__context__/ports/__entity__.repository.ts
// Abstract class = contract + Nest DI token. Depends only on domain and shared/kernel.
import type { ResultAsync } from 'neverthrow';
import type { InfrastructureError } from '../../../shared/kernel/errors.js';
import type { __Entity__, __Entity__Id } from '../domain/__entity__.js';
import type { __Entity__Error } from '../domain/__entity__.errors.js';

export abstract class __Entity__Repository {
  abstract save(entity: __Entity__): ResultAsync<void, InfrastructureError>;
  abstract findById(
    id: __Entity__Id,
  ): ResultAsync<__Entity__, Extract<__Entity__Error, { type: '__Entity__NotFound' }> | InfrastructureError>;
}
