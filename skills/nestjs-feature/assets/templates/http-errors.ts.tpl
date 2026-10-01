// src/modules/__context__/__context__.http-errors.ts
// Every domain error type of the context â†’ HTTP status. `satisfies` fails when one is missing.
import type { __Entity__Error } from '@/modules/__context__/domain/__entity__.errors';

export const __contextCamel__HttpErrors = {
  __Entity__NotFound: 404,
} as const satisfies Record<__Entity__Error['type'], number>;
// Conflict-like states â†’ 409, rule violations on valid input â†’ 422, missing â†’ 404.
