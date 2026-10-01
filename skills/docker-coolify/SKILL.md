---
name: docker-coolify
description: Prepare and verify Docker images, local infrastructure and Coolify Compose deployment for mvskills applications. Use when scaffolding infrastructure, changing containers or deploying to a Coolify VPS.
---

Read stack.md and load strict-typescript for automation. Default: Docker Compose
local PostgreSQL, app Compose in a Git-backed Coolify application, production
PostgreSQL as a separate Coolify resource. A database-in-app-Compose variant is
supported when explicitly selected. Setup prepares artifacts; live provisioning,
deployment or deletion requires the user's corresponding authorization.

## Local infrastructure

Keep compose.infra.yaml separate from development app commands. Pin a supported
PostgreSQL major, persist data in a named volume, bind the local port to loopback,
configure a healthcheck and wait for readiness in infra:up. infra:down preserves
volumes; destructive reset is a separate explicitly requested operation. Migration
and generation commands run separately. Use host localhost in local API URLs and
service DNS names inside containers; these are different connection contexts.

## Production apps

Create multi-stage app Dockerfiles using pnpm's committed lockfile and monorepo
workspace dependencies. A backend image must include required production packages,
compiled API, migrations and the explicit migration entrypoint. Run the production
API with its actual output path, non-root where supported, listening on 0.0.0.0.
No pnpm dev, source watcher or baked local secrets in runtime images.

The web image builds Vite once and serves static files using a small web server.
Configure SPA fallback and proxy /api to the API service unchanged. Test /api/health
and a nested frontend route; a missing API route must not return index.html.
Expose only the web entrypoint through Coolify's public domain by default; use
internal Compose networking for API traffic and verify service ports. Prefer one
web-owned /api reverse proxy rather than conflicting Coolify path-stripping rules.

API liveness and DB readiness are separate endpoints. Add healthchecks with tools
actually present in images; do not assume curl exists. Compose startup dependency
checks alone do not replace runtime recovery when the DB becomes unavailable.

## Environments and migrations

Document required Coolify variables and use required-variable interpolation for
secrets. Production DATABASE_URL refers to the separately provisioned database's
reachable endpoint/network and TLS configuration; do not assume cross-resource
Compose service DNS. Validate connectivity in the target environment. Browser build
variables are public; runtime secrets go only to backend services.

Run migrations once as a deployment step before the new API serves traffic, with
appropriate failure handling. Never migrate automatically in every API replica or
in a healthcheck. Record rollback/backup implications for schema changes.

## Verify and hand over

Run Compose config using supplied safe test values, build images and exercise
web→API→PostgreSQL with a test infrastructure resource. Report artifact validation
separately from actual Coolify deployment. A deployment checklist records Git
repository/branch or another chosen delivery method, Compose path, domain/TLS,
variables, DB networking, migration command, health checks and backup/restore status.
No public GitHub repository is required. If no Git delivery is selected document
the chosen manual/private registry procedure; avoid assuming webhook automation.

Production database backup and restore procedures are pending until tested. Retain
the database-in-Compose option with explicit volume and backup requirements.

Primary docs: [Coolify Compose](https://coolify.io/docs/applications/builds/docker-compose),
[Docker Compose](https://docs.docker.com/compose/),
[Docker build](https://docs.docker.com/build/).
