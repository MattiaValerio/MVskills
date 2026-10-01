---
name: setup-mvskills
description: Configure per-app technology profiles before scaffolding or reconcile them after apps exist. Use when setting up mvskills or changing a project stack.
---

Read existing instructions, manifests and docs/agents/stack.md. Preserve established choices. Default to pnpm; changing an existing project's manager is a separate migration.

Before scaffolding, agree on app paths and technologies. Default backend: NestJS, Clean Architecture with vertical slices, Kysely/PostgreSQL, nestjs-zod, neverthrow, Vitest and Biome. Offer Turborepo for monorepos and record the choice. Leave frontend/deployment undecided until selected. Mark absent apps planned.

After scaffolding, reconcile dependencies, scripts and structure with intended profiles. Mark an app verified only after its checks pass. Record mismatches and pending checks; preserve conventions unless migration is authorized. Reruns update records without discarding user edits.

Write docs/agents/stack.md with one section per app: path, planned/verified status, technologies, profile, routed skills, validation commands and pending decisions. For the default NestJS profile route architecture/review to nestjs-architecture, implementation to nestjs-feature, scaffolding/generators to nestjs-cli. Other profiles use existing conventions.

Check routed skills/dependencies are installed: nestjs-feature requires nestjs-architecture and nestjs-cli; tdd requires codebase-design. Report missing names and installation commands; selective installation does not imply dependency resolution. Invoke through the host mechanism or read installed SKILL.md when no Skill tool exists.

Add/update a short pointer in existing agent instruction files: before scaffolding, implementing or reviewing an app, read its profile in docs/agents/stack.md and load routed skills. If none exist create AGENTS.md. Keep stack.md authoritative.

Use setup-matt-pocock-skills for issue tracking/domain configuration when available. Report completed configuration and remaining decisions. This setup supports empty folders and existing apps.
