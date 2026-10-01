---
name: strict-typescript
description: Enforce strict typing and TypeScript-first scripts in projects adopting the mvskills profile. Use when scaffolding, implementing or reviewing those projects.
---

Read the selected project profile. Apply these rules to authored frontend, backend,
shared packages, tests, migrations and scripts. Respect separately scoped migration
decisions for existing repositories.

Read [import aliases](references/import-aliases.md) when scaffolding or changing
module resolution. Use @/ as the app-local src root for internal imports, without
.js suffixes in authored source. Configure compiler, dev/test and production
resolvers; cross-workspace imports use package exports, not another app's alias.

- Enable strict (including noImplicitAny), noUncheckedIndexedAccess and
  exactOptionalPropertyTypes. Keep a dedicated script/test tsconfig if app configs
  exclude them, and include it in local/CI typecheck.
- Set Biome noExplicitAny to error. Compiler strictness alone does not forbid explicit
  any. Prohibit authored any, as any, ts-ignore and assertions used to bypass errors.
  Prefer inference, precise unions/generics and narrowing; a justified assertion is
  not a replacement for checking untrusted data.
- Parse external input as unknown at boundaries with Zod or an appropriate validator.
  JSON, env, request bodies and third-party data are not trusted because a generated
  TypeScript type exists. Catch values remain unknown until narrowed.
- Generate public request/response types from api-contracts rather than duplicating
  backend types in the frontend. Keep exported APIs precise and persistence internal.
- Write automation, configuration supported by its tool, and migrations in .ts.
  Use tsx for scripts when needed; preserve Nest decorator metadata with its actual
  compiler rather than running the Nest app through an incompatible transform.
- JavaScript emitted by builds and dependency internals are not authored sources.
  Tool-required .cjs/.mjs configurations are narrow documented exceptions. Generated
  declarations must not be imported as a way to leak any into authored interfaces;
  fix the schema/generator source instead of hand-editing generated code.

Run tsc --noEmit for every authored scope and the lint rule locally and in CI.
Verification must demonstrate failures for an explicit any and an implicit any in
an isolated fixture, then success once removed. Do not weaken checks to pass.

References: [TypeScript strict](https://www.typescriptlang.org/tsconfig/strict.html),
[Biome noExplicitAny](https://biomejs.dev/linter/rules/no-explicit-any/).
