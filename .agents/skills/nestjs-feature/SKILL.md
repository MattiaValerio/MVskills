---
name: nestjs-feature
description: Step-by-step workflow to add or change a use case (vertical slice) in a NestJS backend built with Clean Architecture — from framing the use case to generated entry point, domain, ports, Kysely adapter, wiring, Vitest tests and automated validation. Use this skill whenever the user asks to add an endpoint, implement a feature/ticket/user story, add a use case, a background job or event handler, or change the behaviour of an existing one in a NestJS project, and whenever the user invokes /nestjs-feature. Also use it in parallel/worktree mode when several agents implement slices of the same backend.
---

# Adding a vertical slice to a NestJS backend

This is the procedure. The rules it relies on live in two other skills — read their
SKILL.md before starting if they're not already loaded in this session:

- `nestjs-architecture` — where things go and dependency rules
- `nestjs-cli` — how to run generators

Templates for every hand-written file are in `assets/templates/`. Placeholders:

| Placeholder | Case | Example |
|---|---|---|
| `__Context__` / `__context__` / `__contextCamel__` | Pascal / kebab / camel | `OrderItems` / `order-items` / `orderItems` |
| `__Feature__` / `__feature__` | Pascal / kebab | `PlaceOrder` / `place-order` |
| `__Entity__` / `__entity__` / `__entityCamel__` | Pascal / kebab / camel | `Order` / `order` / `order` |
| `__table__` | DB table name | `orders` |

Kebab placeholders are used in paths and routes, camel ones in identifiers.

## 1. Frame the use case

Before touching code, write a short slice brief (in your reply, or in the ticket if
there is one):

```
Slice:     <context>/<feature>          e.g. orders/cancel-order
Kind:      command | query | event handler | job
Trigger:   POST /orders/:id/cancel      (or event / cron / queue)
Input:     fields + validation rules
Output:    response shape
Errors:    every expected failure → HTTP status
Effects:   what changes in the DB / which events are published
```

If an error case or the output shape is genuinely ambiguous, ask the user — one
question, before generating anything. Guessing error semantics produces the most
expensive rework.

## 2. Locate and plan

- Find the context (`src/modules/<context>/`). If it doesn't exist, it's a new
  context: confirm the name with the user if the choice isn't obvious.
- Check what already exists in `domain/` and `ports/` that the slice can reuse.
- List the files you will create/modify, marking each as **CLI** or **template**.
  This list is your checklist for step 9.

## 3. Domain (only if the slice adds rules or types)

Add/extend entities, factory functions and the error union in `domain/` using
`domain-entity.ts.tpl` and `domain-errors.ts.tpl`. New error variants are the part
reviewers care most about — name them as facts (`OrderAlreadyShipped`).

## 4. Ports

Add the methods the use case needs to the context's port (`port.ts.tpl`), returning
`ResultAsync`. Update the in-memory fake (`port.fake.ts.tpl`) in the same step so tests
can't drift from the contract. For a read-only query with a response-specific shape,
create a slice-local query port instead (see `persistence-kysely.md` in the architecture
skill).

## 5. Entry point via CLI

```bash
pnpm exec nest g co modules/<context>/features/<feature> --no-spec --dry-run
# check: CREATE …/features/<feature>/<feature>.controller.ts, UPDATE …/<context>.module.ts
pnpm exec nest g co modules/<context>/features/<feature> --no-spec
```

(Gateway `ga`, resolver `r`; jobs and event handlers have no generator — use
`controller.ts.tpl` as a shape reference.) Apply the controller fixups from
`controller.ts.tpl`.

## 6. DTO and use case

Create `<feature>.dto.ts` and `<feature>.use-case.ts` from the templates. The use case:
one `execute()`, returns `ResultAsync`, depends only on ports, domain and its own DTO.

## 7. Adapter and persistence

Implement new port methods in `infrastructure/kysely-<entity>.repository.ts`
(`kysely-adapter.ts.tpl`). If the schema changes: write a new migration in `migrations/`,
run it against the dev DB, regenerate `db.generated.ts` with kysely-codegen, then write
the adapter. Never edit an applied migration.

## 8. Wiring

In `<context>.module.ts`: add the use case to `providers`; bind any new port
(`{ provide: Port, useClass: Adapter }`). In `<context>.http-errors.ts`: add a status for
every new error variant (`http-errors.ts.tpl`). The compiler will tell you if one is missing.

## 9. Tests

- `<feature>.use-case.spec.ts` from `use-case.spec.ts.tpl`: happy path + **one test per
  error variant** the use case can return.
- Domain tests for new factory/invariant logic.
- E2E or adapter integration test only when the slice warrants it (see
  `testing-vitest.md`).

## 10. Validate — non-negotiable

```bash
bash <path-to-this-skill>/scripts/validate.sh <app-dir>
```

It runs typecheck, Biome, dependency-cruiser and Vitest. Fix and rerun until it's green.
Don't report success with a red step, and don't weaken a rule (cast, `biome-ignore`,
depcruise exception) to make it pass — if a rule seems wrong for this case, stop and
explain to the user.

## 11. Report

Finish with: slice brief (final), files created/modified, endpoint(s), error → status
table, migrations added, anything deliberately deferred.

## Parallel / worktree mode

When this slice is one of several implemented concurrently in separate worktrees:

- Generate with `--skip-import` and **do not edit** `<context>.module.ts`.
- New error variants and their HTTP statuses are needed for the slice to compile, so you
  may add them — as pure additions appended at the end of the error union and of the
  `http-errors` table, never by editing existing lines. Conflicts there are trivial to
  resolve at integration.
- Don't change existing port method signatures. If you need a new method, prefer a
  slice-local query port; otherwise append the method and flag it in the report as a
  contract change.
- Write the wiring you would have added into the report under "Wiring to apply", e.g.
  `providers += CancelOrderUseCase; controllers += CancelOrderController`.
- Migrations: number them by timestamp, never by sequence, so branches don't collide.

The integration agent then applies every "Wiring to apply" block in one commit and runs
`validate.sh` once on the merged result.
