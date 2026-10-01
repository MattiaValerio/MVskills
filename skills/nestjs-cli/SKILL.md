---
name: nestjs-cli
description: How to drive the NestJS CLI (nest new / generate / build / start / add / upgrade / info) correctly from an agent, adapted to a pnpm + Turborepo + Biome + Vitest setup and to a Clean Architecture with vertical slices. Use this skill whenever you are about to create NestJS files (modules, controllers, guards, interceptors, pipes, filters, middleware, decorators, gateways, resolvers), scaffold a new NestJS app, run or build one, add a Nest library, or upgrade NestJS — prefer the CLI over hand-writing boilerplate, and check this skill before running any `nest` command.
---

## Profile scope and official documentation

Read docs/agents/stack.md when present. Apply this custom stack only to apps selecting the default NestJS profile or explicitly adopting it. In existing apps with another stack preserve conventions; this skill does not authorize migration. For new unconfigured apps agree on the profile using setup-mvskills.

For API/CLI facts start with https://docs.nestjs.com/llms.txt and fetch relevant linked official pages. Use https://docs.nestjs.com/llms-full.txt as a fallback, searching relevant sections rather than loading it wholesale. Match docs to installed versions and command --help; the selected profile owns architecture choices.

# Driving the NestJS CLI

The CLI keeps boilerplate, naming and module registration consistent, so use it for
every artefact it knows how to generate. Hand-write only what it can't produce
(use cases, ports, adapters, DTOs — see the `nestjs-feature` skill templates).
Where files go is defined by the `nestjs-architecture` skill; this skill is about
**how** to run the commands.

## Ground rules

1. **Know the version first.** Run `pnpm exec nest info` once per session. These
   instructions must be checked against the installed CLI. Inspect package.json and
   command --help; ESM, test runners, builders and flags vary by version. Preserve
   the project's module system and configure Vitest explicitly when selected.
2. **Use the project-local CLI** via `pnpm exec nest …`, never a global `nest`, so the
   schematics match the installed version. Exception: `nest new`, which runs before a
   project exists — use `pnpm dlx @nestjs/cli@latest new …`.
3. **Never trigger prompts.** Always pass the name argument; for `new`, also pass
   `--package-manager pnpm` and prompt-disabling flags supported by that CLI. An agent stuck on a prompt
   wastes the whole run.
4. **Dry-run first.** Run every `generate` with `--dry-run` (`-d`), read the planned
   CREATE/UPDATE lines, check paths against the architecture, then run it for real.
   Skip the dry run only for a command you've already verified in this session with the
   same shape.
5. **Always `--no-spec`.** Generated specs don't follow the testing conventions; tests are
   written from templates.
6. **Never `--format`.** It formats with Prettier; this stack uses Biome. After generating,
   run `pnpm biome check --write <generated files>`.
7. **Forbidden schematics:**
   - `resource` — generates entity/service/CRUD scaffolding that contradicts vertical
     slices. Build slices one use case at a time instead.
   - `service` — produces `*.service.ts`; use cases are `*.use-case.ts` from templates.
   - `app` / `library` — they convert the project into a Nest-CLI monorepo, which fights
     Turborepo. Create new apps/packages as Turborepo workspaces. Only if `nest-cli.json`
     already has `"monorepo": true` may you use them, always with `--project`.
8. **Parallel work.** When several agents work on the same context in separate worktrees,
   add `--skip-import` to `generate` so nobody edits `<context>.module.ts`; the
   integration step wires the module once. See the `nestjs-feature` skill.

## Command map (the 90% case)

| You need | Command | Result |
|---|---|---|
| New bounded context | `pnpm exec nest g mo modules/<context> --no-spec` | `src/modules/<context>/<context>.module.ts`, imported into `AppModule` |
| Slice HTTP entry point | `pnpm exec nest g co modules/<context>/features/<feature> --no-spec` | `…/features/<feature>/<feature>.controller.ts`, registered in `<Context>Module` |
| Slice WebSocket entry point | `pnpm exec nest g ga modules/<context>/features/<feature> --no-spec` | `…/<feature>.gateway.ts`, provider registered |
| Slice GraphQL entry point | `pnpm exec nest g r modules/<context>/features/<feature> --no-spec` | `…/<feature>.resolver.ts`, provider registered |
| Guard | `pnpm exec nest g gu shared/http/guards/<name> --flat --no-spec` | `src/shared/http/guards/<name>.guard.ts` |
| Interceptor | `pnpm exec nest g itc shared/http/interceptors/<name> --flat --no-spec` | `…/<name>.interceptor.ts` |
| Exception filter | `pnpm exec nest g f shared/http/filters/<name> --flat --no-spec` | `…/<name>.filter.ts` |
| Pipe | `pnpm exec nest g pi shared/http/pipes/<name> --flat --no-spec` | `…/<name>.pipe.ts` |
| Middleware | `pnpm exec nest g mi shared/http/middleware/<name> --flat --no-spec` | `…/<name>.middleware.ts` |
| Custom decorator | `pnpm exec nest g d shared/http/decorators/<name> --flat --no-spec` | `…/<name>.decorator.ts`; inspect the generated metadata API |

A slice entry point is generated **without** `--flat` on purpose: the CLI then creates
the `<feature>/` folder for you. Shared single-file artefacts use `--flat`.

After generating a slice controller you must always adjust it — see
`references/command-map.md` → "Post-generation fixups". In short: route prefix becomes
the resource (`@Controller('orders')`), one handler method named `handle`, constructor
injects the use case.

## Running, building, upgrading

- Dev server: `pnpm exec nest start --watch --env-file .env` (add `--builder swc` for
  faster rebuilds; with SWC add `--type-check` when you need type errors in the loop).
- Build: `pnpm exec nest build` (`--builder swc|tsc|rspack`; `--webpack` is deprecated).
- Type check without emitting: `pnpm exec tsc --noEmit -p tsconfig.json`.
- Add a Nest library with an install schematic: `pnpm exec nest add <pkg> --dry-run`
  first. Most packages (`@nestjs/config`, `@nestjs/swagger`…) are plain `pnpm add`.
- Upgrade a v11 project: check installed CLI upgrade support first, then
  `pnpm exec nest upgrade --dry-run`, read the report, then run it. It does not migrate to
  ESM/Vitest — leave that as a separate, explicit task.

## When to read the references

- `references/command-map.md` — every schematic with exact output paths, post-generation
  fixups, aliases, and what to do when the CLI picks the wrong module.
- `references/new-project.md` — scaffolding a new NestJS app inside the Turborepo with the
  stack's conventions (Biome instead of oxlint, scripts, cleanup). Read it only when
  creating a new app.
