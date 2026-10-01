---
name: nestjs-architecture
description: Architectural rules for NestJS server code — Clean Architecture organised as vertical slices (bounded-context modules containing one folder per use case), with Kysely, nestjs-zod, neverthrow and Vitest. Use this skill whenever you write, move, review or refactor ANY code in a NestJS backend — new endpoints, use cases, repositories, entities, DTOs, error handling, module wiring, tests — or when you have to decide where a file belongs, even if the user does not mention "architecture". Read it before creating files in a NestJS project.
---

# NestJS — Clean Architecture with Vertical Slices

This skill tells you **what** goes **where** and **who may depend on whom**.
How to generate files with the CLI lives in the `nestjs-cli` skill; the step-by-step
workflow for adding a feature lives in the `nestjs-feature` skill.

## The mental model

A backend is a set of **bounded contexts** (`orders`, `billing`, `catalog`…). Each
context is one Nest module. Inside a context, every use case is a **vertical slice**:
one folder that holds everything specific to that use case (HTTP entry point, input
schema, application logic, tests). What is shared *inside* a context — the domain model
and the persistence contracts — sits next to the slices, not inside them.

```
src/
├── main.ts
├── app.module.ts                  # imports context modules + shared infrastructure only
├── modules/
│   └── <context>/
│       ├── <context>.module.ts    # composition root of the context (wiring only)
│       ├── <context>.http-errors.ts  # domain error type → HTTP status table
│       ├── domain/                # entities, value objects, domain errors — pure TS
│       ├── ports/                 # abstract classes the use cases depend on
│       ├── infrastructure/        # adapters implementing ports (Kysely, HTTP clients…)
│       ├── public/                # (optional) what other contexts may import
│       └── features/
│           └── <feature>/         # one folder per use case, kebab-case verb-noun
│               ├── <feature>.controller.ts
│               ├── <feature>.dto.ts
│               ├── <feature>.use-case.ts
│               └── <feature>.use-case.spec.ts
└── shared/
    ├── kernel/                    # cross-context pure code: base error types, Result helpers
    ├── http/                      # Result → HttpException mapping, global pipes/filters
    └── infrastructure/            # DatabaseModule (Kysely), config, logger
```

Feature names are use cases, not CRUD verbs on tables: `place-order`, `cancel-order`,
`get-order-summary` — not `orders-crud`. If you cannot name the slice as an action a
user or system performs, the slice is probably wrong.

## Dependency rules (the part that matters most)

Dependencies point inwards. These rules are enforced by `dependency-cruiser`
(config in `assets/dependency-cruiser.cjs`), so breaking them fails validation.

1. **`domain/` is pure.** No imports from `@nestjs/*`, `kysely`, `nestjs-zod`, other
   layers of the context, or other contexts. It may import `neverthrow` and `shared/kernel`.
   *Why:* domain logic must be testable and portable without booting Nest.
2. **`ports/` depend only on `domain/` and `shared/kernel`.** Ports are `abstract class`es,
   which double as Nest injection tokens — no `@Inject()` strings or symbols needed.
3. **A slice never imports another slice.** If two slices need the same logic, it belongs
   in `domain/` (business rule) or in a port (data access). Duplicating a small mapping
   between two slices is acceptable; coupling them is not. *Why:* slices must be
   deletable and developable in parallel without touching each other.
4. **Slices never import `infrastructure/`.** They depend on ports; the module binds the
   port to an adapter.
5. **Contexts talk through `public/` only** (exported types, a facade port, or domain
   events). Never import another context's `domain/`, `features/` or `infrastructure/`.
6. **`<context>.module.ts` is the only file that knows everything.** It contains wiring
   (controllers, providers, `{ provide: Port, useClass: Adapter }`) and nothing else.

## Layer responsibilities — short version

| Layer | Contains | Never contains |
|---|---|---|
| Controller | route decorators, DTO in, call use case, map Result → HTTP | business rules, DB access, try/catch for flow control |
| DTO | Zod schema + `createZodDto` | logic, entity types |
| Use case | orchestration, returns `ResultAsync<Output, Error>` | HTTP concepts, Kysely, `throw` for expected failures |
| Domain | entities, invariants, factory functions returning `Result` | framework imports, I/O |
| Port | `abstract class` with method signatures returning `ResultAsync` | implementation |
| Adapter | Kysely queries, row ↔ entity mapping, infra errors → domain errors | business decisions |

## Conventions you must follow

- **TypeScript strict, zero `any`.** Use `unknown` + Zod parsing at boundaries.
- **Expected failures are values, not exceptions.** Use cases and ports return
  `ResultAsync<T, E>` from `neverthrow`. Only truly unexpected failures (bugs, DB down)
  may throw. Details: `references/errors-and-results.md`.
- **Validation happens once, at the edge,** with Zod via `nestjs-zod`. Inside the slice,
  data is already typed and trusted.
- **Kysely only** for persistence (never Prisma, Drizzle or TypeORM, even though the Nest
  docs suggest them). Details: `references/persistence-kysely.md`.
- **No premature abstraction.** Don't add a port for something with one trivial
  implementation that will never change (e.g. a clock in a CRUD app). Add it when you
  need to test against it or swap it.
- **One use case = one class with one public `execute()` method.**
- Follow the project's import style. In ESM projects (`"type": "module"`, NodeNext),
  relative imports end in `.js`.

## When to read the references

- `references/slice-anatomy.md` — full annotated example of one slice, plus the module file.
  Read it the first time you create a slice in a session.
- `references/errors-and-results.md` — domain error shapes, neverthrow patterns,
  Result → HTTP mapping. Read it when writing a use case, port or controller.
- `references/persistence-kysely.md` — repository adapters, mapping, transactions.
  Read it when touching `infrastructure/`.
- `references/testing-vitest.md` — what to test at which level, fakes vs mocks, e2e.
  Read it before writing tests.
- `references/decision-guide.md` — "where does this go?" for ambiguous cases (shared
  logic, cross-context calls, queries vs commands, background jobs).

## Bootstrapping a new project

If `src/shared/` does not exist yet:

1. Copy `assets/shared/` into `src/shared/`.
2. Copy `assets/dependency-cruiser.cjs` to the project root as `.dependency-cruiser.cjs`.
3. Use `assets/app.module.example.ts` as the reference for `app.module.ts` (global
   `ZodValidationPipe` + `ZodSerializerInterceptor`, config, database).
4. Install: `pnpm add neverthrow zod nestjs-zod kysely pg @nestjs/config` and
   `pnpm add -D dependency-cruiser kysely-codegen @types/pg`.
   dependency-cruiser needs TypeScript < 7 to read `.ts` files (NestJS 12 already pins
   TypeScript 6). If the project is on TS 7, it analyses nothing and reports success —
   `validate.sh` in the `nestjs-feature` skill detects this and fails.
5. Generate DB types with `pnpm kysely-codegen --out-file src/shared/infrastructure/database/db.generated.ts`.
