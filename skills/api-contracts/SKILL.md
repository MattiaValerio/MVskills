---
name: api-contracts
description: Define and maintain REST OpenAPI contracts and generated typed clients for mvskills applications. Use when adding endpoints, connecting frontend/backend, or reviewing public API changes.
---

Read stack.md and load strict-typescript. Default: NestJS REST/OpenAPI,
openapi-typescript for generated types and openapi-fetch for requests. In a full-stack
workspace put committed schema and generated TypeScript in packages/api-client.
Only public contracts are shared; Nest controllers, domain entities and Kysely DB
types stay internal. Other frameworks use the same contract boundary if selected.

## Contract ownership

Backend runtime input/output schemas define public behavior. Include operationId,
request params/body, successful response and meaningful error status/body for each
endpoint. For nestjs-zod configure current Swagger integration and response DTOs
explicitly; document generation must represent runtime validation/serialization.
Keep readiness and error responses bounded; no credentials or database details.

Browser requests target our server exclusively. External APIs are integrated in
backend adapters, with credentials, validation and response mapping on the server.
Before a backend exists, agree and commit a provisional OpenAPI contract, generate
types and use contract-typed MSW tests or an explicit mock preview. Record live
integration as pending; reconcile the provisional schema with runtime schemas when
the backend is implemented. Normal development targets the real server.

## Deterministic generation

Export OpenAPI with a TypeScript script and stable serialization. It must run without
HTTP listening or a PostgreSQL connection. Isolate contract export from infrastructure
providers (e.g. a dedicated documentation module with metadata-compatible inert
application ports). Do not load the live DB module or use a fabricated DB schema.
Tests compare offline schema to the runtime app's published contract to catch drift.

Define pnpm api:generate to export schema then generate types via the installed
openapi-typescript CLI. Commit both. api:check generates into a temporary directory
and compares content, including missing/untracked outputs, without overwriting the
committed files; a stale response schema or client must fail CI. Generation belongs
to explicit commands, not pnpm dev. Update contract in the same change as endpoints.

## Client and routing

Expose a typed createClient<paths> factory with explicit base URL. In the default
profile schema paths include /api and browser base URL is the current origin (use
an empty base URL if supported by the installed client); never add /api twice.
Vite proxies /api unchanged to Nest; production web proxy does the same. SSR or
server consumers use a separately configured internal URL, not window.location.
Apply TanStack Query around this client without retyping payloads or casting JSON.

TypeScript types are compile-time contracts, not runtime validators. Parse unknown
external data where necessary and test representative real HTTP success/error
responses against the published schemas. Include a compile-time negative fixture
showing invalid params/body/path fail. If auth is requested specify cookies vs bearer,
credential propagation and CSRF/CORS behavior for the selected origin topology.

Primary docs: [Nest OpenAPI](https://docs.nestjs.com/openapi/introduction),
[openapi-typescript](https://openapi-ts.dev/introduction),
[openapi-fetch](https://openapi-ts.dev/openapi-fetch/),
[nestjs-zod](https://github.com/BenLorantfy/nestjs-zod).
