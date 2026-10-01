// src/modules/__context__/__context__.http-errors.ts
// Every domain error type of the context → HTTP status. `satisfies` fails when one is missing.
import type { __Entity__Error } from './domain/__entity__.errors.js';

export const __contextCamel__HttpErrors = {
  __Entity__NotFound: 404,
} as const satisfies Record<__Entity__Error['type'], number>;
// Conflict-like states → 409, rule violations on valid input → 422, missing → 404.
