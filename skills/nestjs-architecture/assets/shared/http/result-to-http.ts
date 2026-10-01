import { HttpException, Logger } from '@nestjs/common';
import type { Result } from 'neverthrow';
import type { InfrastructureError } from '@/shared/kernel/errors';

type TypedError = { readonly type: string };

/**
 * Status code for every error type a use case can return, except InfrastructureError
 * (handled here). The compiler rejects a table that misses one.
 */
export type HttpStatusTable<E extends TypedError> = Record<
  Exclude<E['type'], InfrastructureError['type']>,
  number
>;

const logger = new Logger('ResultToHttp');

/** The only bridge between Results and HTTP. Call it from controllers, nowhere else. */
export function unwrapOrThrowHttp<T, E extends TypedError>(
  result: Result<T, E>,
  statuses: HttpStatusTable<E>,
): T {
  if (result.isOk()) return result.value;

  const error = result.error;
  if (isInfrastructureError(error)) {
    logger.error(
      `${error.operation} failed`,
      error.cause instanceof Error ? error.cause.stack : String(error.cause),
    );
    throw new HttpException({ error: { type: 'InfrastructureError' } }, 503);
  }

  const status = (statuses as Record<string, number | undefined>)[error.type];
  if (status === undefined) {
    // Unreachable when types are respected; guards against casts.
    logger.error(`No HTTP status mapped for error type "${error.type}"`);
    throw new HttpException({ error: { type: 'UnmappedError' } }, 500);
  }
  throw new HttpException({ error }, status);
}

function isInfrastructureError(e: TypedError): e is InfrastructureError {
  return e.type === 'InfrastructureError';
}
