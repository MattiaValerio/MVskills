---
name: setup-mvskills
description: Set up a runnable application with optional tracking, typed frontend/API contracts, local environment and deployment artifacts. Use when bootstrapping a project with mvskills or reconciling an existing setup.
---

Read existing instructions, manifests and docs/agents/stack.md. Preserve established choices. Default to pnpm; changing an existing project's manager is a separate migration. This skill coordinates setup and scaffolding, not just configuration. Read [the bootstrap procedure](references/bootstrap.md) before creating app files. Load routed technical skills through the host mechanism or read their installed entrypoints.

## 1. Run Matt's setup

Read [Matt's bundled setup procedure](references/matt-setup/setup.md) and follow its
exploration, tracker, triage-label and domain-document phases. Its templates ship
inside this skill; setup-matt-pocock-skills is not a separate installation dependency.
Preserve existing configuration and reuse previously answered choices.

Recommend GitHub Issues, but offer a public/private GitHub repository, another
tracker, local Markdown, or no tracker. Using GitHub never requires making code
public. When GitHub is selected ask for its URL or owner/repo, proposing an existing
remote when available. Tracking may live in a different repository. Normalize to
owner/repo and verify read access with gh repo view OWNER/REPO. If access fails,
record it as pending and continue independent scaffolding. No tracker is a valid,
complete choice; do not replace it with Markdown or create a remote automatically.

Record the chosen mode in docs/agents/issue-tracker.md, including an explicit
disabled state when no tracker is selected. Tracker-dependent skills must explain
that state and request a destination before publishing; never silently create one.
For GitHub record the selected repository. Follow the bundled
GitHub template: all issue commands use --repo OWNER/REPO, API paths name that
repository, and cross-repository references use full URLs. Code PRs belong to the
code repository; tracking issues belong to the selected tracking repository. Setup
records configuration and checks read access; creating repositories, labels or issues
requires the relevant task authorization.

Domain glossary/ADRs and docs/agents configuration remain local documents. The
GitHub preference concerns specs/issues/development tracking, not these documents.
Once this phase is complete, continue directly with technology profiles.

## 2. Select the smallest useful profile

Agree on full stack, backend only, frontend only, or adoption in an existing repo.
Default full stack: pnpm/Turborepo monorepo, NestJS backend with Kysely/PostgreSQL,
Vite/React frontend with TanStack Router/Query and Tailwind, REST/OpenAPI client,
Docker Compose deployment on a Coolify VPS. If SSR/SEO or another framework is
required select a suitable alternative explicitly. Ask whether authentication is
needed; choose and configure it only if requested. Additional infrastructure such
as Redis, queues, storage or email is introduced only for a concrete requirement.

| Responsibility | Routed skills |
| --- | --- |
| All authored TypeScript, scripts and review | strict-typescript |
| Backend architecture, scaffolding, features | nestjs-architecture, nestjs-cli, nestjs-feature |
| Vite/React scaffold, UI and tests | react-vite |
| REST schema, generated client and contract checks | api-contracts |
| Local infrastructure, images and Coolify Compose | docker-coolify |

Load only applicable roles. Check installed dependencies before using them and
report missing names with an installation command. Missing required capabilities
make that phase partial, not verified. Existing stacks retain their conventions;
record discrepancies and separately scope migrations.

## 3. Scaffold, connect and verify

Execute the bootstrap procedure for selected components. Create runnable local
.env files without overwriting existing values. Keep infrastructure commands
separate: pnpm dev starts apps only, not Docker, migrations or code generation.
Generate the public API client and configure /api routing in development and
production. Implement minimal health/readiness behavior and actual tests rather
than a fictional domain feature. Verify real database connectivity and app startup.
Prepare container artifacts; actual VPS deployment needs destination/access and
the user's deployment authorization.

Record app paths, technologies, selected profiles, routed skills, commands and
evidence in docs/agents/stack.md. Distinguish planned, generated, locally verified
and deployment-artifacts-ready; deployed is a separate observed state. Persist
shared contract, environment and deployment decisions in the same document.
Reruns reconcile in place, preserving user choices and unrelated content.

Add/update a pointer in existing agent instructions to read stack.md and load
routed skills before scaffolding, implementation and review, including workers.
Follow Matt's instruction-file selection rules rather than creating duplicates.
Finish with exact startup commands, validation results, and unresolved blockers.
Never call placeholders, missing .env files or a test suite with no tests verified.
