// src/modules/__context__/domain/__entity__.errors.ts
// Discriminated union. `type` values read as facts. Add only data a caller needs for a message.
export type __Entity__Error =
  | { readonly type: '__Entity__NotFound'; readonly __entityCamel__Id: string };
// | { readonly type: '__Entity__Already...'; readonly __entityCamel__Id: string }
