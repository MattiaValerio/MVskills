# Runnable project bootstrap

Use only the selected components. Inspect existing manifests and installed versions
before scaffolding. Establish paths, package scope, ports and authentication needs
once; reuse those choices across apps, contracts, environments and deployment.

## Workspace and typing

For full stack use apps/api, apps/web and packages/api-client unless paths were
chosen otherwise. Initialize a private pnpm workspace and Turborepo tasks for dev,
build, typecheck, lint, test and backend architecture checks. Keep dev persistent
and uncached; finite commands run their actual checks. A root workspace marker alone
does not imply multiple apps. Single-app profiles need no artificial shared package.

Load strict-typescript. Shared tsconfig.base.json enables strict,
noUncheckedIndexedAccess and exactOptionalPropertyTypes; each app uses appropriate
module settings. Script and test files belong to a typecheck configuration too.
Biome noExplicitAny is an error. Author automation in .ts, executed with tsx when
appropriate; tools that require JavaScript configuration are documented exceptions.
Use @/ as each app's src-root import alias, not a monorepo-wide root. Load
strict-typescript's import-aliases reference and verify typecheck, dev/watch, tests,
build and native production startup. Authored imports are extensionless; emitted
JavaScript is rewritten/bundled as required. Workspace boundaries use package exports.

## Backend and database

Load the three NestJS skills before creating Nest files. Use the installed CLI and
its supported flags. Configure PostgreSQL via docker-coolify and Kysely access via
nestjs-architecture. Kysely is a SQL query builder, not an ORM.

Create a TypeScript migration runner with Kysely's migration facilities and
explicit db:migrate. Empty domain schemas need no dummy business tables: the
migrator can initialize its own bookkeeping. Add domain migrations when a real
requirement exists. Run against the local database and generate real DB types with
kysely-codegen; do not substitute a fabricated interface. Avoid treating internal
migration tables as domain repositories.

Provide liveness and database readiness endpoints without exposing secrets. A
bounded SELECT 1 is enough for the initial readiness check; failures return a
documented non-success status. Keep domain logic out of infrastructure probes.
Add actual tests of readiness behavior, both success and unavailable database.

## Frontend and public API

Load react-vite and api-contracts for the default full-stack profile. Generate a
REST/OpenAPI schema and client, configure Vite's /api proxy, and build a minimal
status page through the generated client and TanStack Query. Its API/database
status and failure states demonstrate the connection, not fictional product UI.

Generation must work without starting HTTP or contacting PostgreSQL. Isolate the
contract module/bootstrap from runtime infrastructure. Do not bootstrap the live
application module and disguise a connection failure with dummy credentials.
Verify HTTP responses against the schema in integration tests. Frontend-only
projects may choose an external API; record and verify that contract instead of
creating an unused backend.

## Local environment and commands

Create root and app .env.example only where consumed, and matching ignored .env
files with functional local values. API .env must include DATABASE_URL and its
listen port. Compose credentials and the host connection URL must agree. Web .env
contains public client configuration only. Never expose database credentials via
VITE_ variables. Validate API env with Zod and fail with actionable variable names.
Choose and test one explicit .env loading mechanism; verify cwd assumptions for
root pnpm dev, migration/generation scripts and tests. Production consumes runtime
variables, not a required baked-in .env file.

| Command | Responsibility |
| --- | --- |
| pnpm infra:up | Start selected local infrastructure and wait for readiness |
| pnpm infra:down | Stop local infrastructure, preserving data volumes |
| pnpm db:migrate | Apply local database migrations explicitly |
| pnpm db:generate | Generate DB types from the migrated database |
| pnpm api:generate | Generate stable schema and TypeScript API types |
| pnpm api:check | Fail when committed contract/generated types differ |
| pnpm dev | Start development app processes only |
| pnpm check | Typecheck, lint, tests, architecture and contract checks |

Expose only relevant commands; document missing prerequisites. For the first setup
run infra:up, db:migrate, db:generate and api:generate, then checks. Subsequent dev
does not start infrastructure or apply migrations implicitly. If Docker is missing
continue independent generation but record database/smoke validation as pending.

## Deployment and acceptance

Load docker-coolify. Default production PostgreSQL is a separate Coolify resource;
a database-in-Compose variant is explicit. Prepare production app images, same-origin
/api routing, health checks and a one-off migration procedure. No live deployment
is implied by creating these files.

Before reporting locally verified, capture evidence for all selected components:

Create a CI check workflow for the selected delivery platform: install with a frozen
pnpm lockfile, run strict typecheck/lint/tests/build, architecture and api:check.
Use a test PostgreSQL service for DB integration, explicit migrations and isolated
test env values. If no CI provider is selected, supply a documented pnpm check entry
point covering the same stages rather than requiring GitHub. Keep runtime smoke
tests separate from offline contract export so generation remains infrastructure-free.

- Typecheck, lint, real tests and build pass; no handwritten any or suppressed checks.
- Contract export/client generation works without DB/server; api:check detects drift.
- Real PostgreSQL accepts migrations and generated types match it.
- pnpm dev from root starts applicable apps using the generated env files; processes
  stop cleanly after the smoke check and do not start infrastructure themselves.
- HTTP readiness reaches the database; browser status uses the generated API client
  through the development proxy. If browser automation is unavailable mark browser
  verification pending rather than substituting an HTTP-only claim.
- Production images build; Compose validates with supplied local test variables.
  Containerized web /api routing and API readiness are exercised using a test DB,
  without claiming VPS access, DNS, TLS or production backup verification.

No-tracker mode can be complete. Pending credentials, unavailable Docker or missing
skills do not block independent work but must be visible in phase status. Summarize
generated files separately from checks actually executed. Keep the base minimal.
