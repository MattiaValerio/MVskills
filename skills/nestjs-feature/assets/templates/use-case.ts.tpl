// src/modules/__context__/features/__feature__/__feature__.use-case.ts
// One public method. Depends on ports, domain and its own DTO only. No HTTP, no Kysely.
import { Injectable } from '@nestjs/common';
import type { ResultAsync } from 'neverthrow';
import type { InfrastructureError } from '@/shared/kernel/errors';
import type { __Entity__Error } from '@/modules/__context__/domain/__entity__.errors';
import { __Entity__Repository } from '@/modules/__context__/ports/__entity__.repository';
import type { __Feature__Dto } from '@/modules/__context__/features/__feature__/__feature__.dto';

export interface __Feature__Output {
  // shape returned to the entry point (mirrors __Feature__ResponseSchema)
}

/** Narrow the error type to what this use case can really return. */
export type __Feature__Error = __Entity__Error | InfrastructureError;

@Injectable()
export class __Feature__UseCase {
  constructor(private readonly __entityCamel__s: __Entity__Repository) {}

  execute(input: __Feature__Dto): ResultAsync<__Feature__Output, __Feature__Error> {
    // load â†’ apply domain function â†’ persist â†’ map to output
    // return this.__entityCamel__s.findById(input.id as __Entity__Id)
    //   .andThen((e) => domainTransition(e, new Date()))
    //   .andThen((e) => this.__entityCamel__s.save(e).map(() => e))
    //   .map(toOutput);
    throw new Error('not implemented');
  }
}
