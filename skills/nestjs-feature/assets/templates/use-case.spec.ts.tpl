// src/modules/__context__/features/__feature__/__feature__.use-case.spec.ts
// Plain Vitest, no Nest TestingModule: construct the use case with fakes.
import { describe, expect, it } from 'vitest';
import { InMemory__Entity__Repository } from '@/modules/__context__/ports/__entity__.repository.fake';
import type { __Feature__Dto } from '@/modules/__context__/features/__feature__/__feature__.dto';
import { __Feature__UseCase } from '@/modules/__context__/features/__feature__/__feature__.use-case';

const validInput = (overrides: Partial<__Feature__Dto> = {}): __Feature__Dto => ({
  // ...valid defaults
  ...overrides,
});

const setup = (seed: ConstructorParameters<typeof InMemory__Entity__Repository>[0] = []) => {
  const repo = new InMemory__Entity__Repository(seed);
  return { repo, useCase: new __Feature__UseCase(repo) };
};

describe('__Feature__UseCase', () => {
  it('succeeds with valid input', async () => {
    const { useCase } = setup();
    const result = await useCase.execute(validInput());
    expect(result.isOk()).toBe(true);
    // assert on returned value and on repo state, not on calls
  });

  // One test per error variant the use case can return:
  it('fails with __Entity__NotFound when ...', async () => {
    const { useCase } = setup();
    const result = await useCase.execute(validInput());
    expect(result._unsafeUnwrapErr()).toMatchObject({ type: '__Entity__NotFound' });
  });
});
