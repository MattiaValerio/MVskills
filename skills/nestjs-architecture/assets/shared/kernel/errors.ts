// Cross-context error primitives. Pure TypeScript: no framework imports allowed here.

export type InfrastructureError = {
  readonly type: 'InfrastructureError';
  readonly operation: string; // e.g. 'OrderRepository.save'
  readonly cause: unknown;
};

/** Curried so it can be passed directly to ResultAsync.fromPromise(promise, infraError('Op.name')). */
export const infraError =
  (operation: string) =>
  (cause: unknown): InfrastructureError => ({ type: 'InfrastructureError', operation, cause });
