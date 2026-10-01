# MVskills

Matt Pocock's engineering workflows plus custom technology profiles for a runnable
application: pnpm/Turborepo, NestJS with Kysely/PostgreSQL, Vite/React with TanStack
Router/Query and Tailwind, typed REST/OpenAPI clients, and Docker Compose for Coolify.
Auth and additional infrastructure are chosen only when the project needs them.

## Install

After publishing this repository on GitHub:

```sh
pnpm dlx skills@latest add mattiavalerio/mvskills
```

Select skills and agent targets. Use `--all` for all skills and installer-supported agents. For a local checkout replace the source with its absolute path. Avoid installing Matt's bundle alongside this one: names overlap. Selective installation does not automatically resolve [dependencies](skills/dependencies.json).

Run `setup-mvskills` in your target project using your agent's invocation syntax.
It coordinates configuration, scaffolding, frontend/API wiring and runtime checks.
Choose full stack, backend only, frontend only or adoption in an existing repository.
Rerunning reconciles existing choices rather than recreating the project.

`setup-mvskills` includes Matt's setup procedure as an internal reference, then
configures and builds the selected profile. No separate Matt setup skill is needed;
install the technical skills for the components you select (or the entire bundle).
GitHub is recommended, never required: public/private GitHub, another tracker,
local Markdown and no tracking are valid choices. A tracking repository may differ
from the code repository. Glossary, ADRs and agent configuration remain local.

### Automatic lockfile

Project installation creates or updates `skills-lock.json` in the **destination project**, using the standard [skills installer](https://github.com/vercel-labs/skills). This happens automatically with the command above; the package does not need its own generator.

The installer records each installed skill's source, source type and computed hash. GitHub installations also record the skill path. When installed from `mattiavalerio/mvskills`, that repository is the source, including for the customized Matt skills. Local installations record a local source instead. Only selected skills are recorded; additional installations preserve existing entries. Commit the destination lockfile to track installed skills. It is separate from `pnpm-lock.yaml`, which tracks package dependencies.

The `skills-lock.json` in **this source repository** records the original Matt installation used to build the bundle. It is not copied into consumer projects and does not set their skill origins. The installer discovers the distribution in `skills/` and generates the consumer's lockfile itself. Global installations use the installer's global tracking rather than this project file.

To request updates from your installed sources:

```sh
pnpm dlx skills@latest update
```

Updating this bundle follows MVskills releases. Importing changes from Matt into MVskills is a separate, reviewed maintenance step.

## Why these skills exist

An application needs both a development process and technical conventions. Matt's skills provide discovery, planning, implementation and review. The custom skills add the selected technology profile without replacing that process. Install what you need; an ordinary edit does not require running every workflow.

### Clarify what to build

Use [grill-me](skills/grill-me/SKILL.md) to challenge an idea before implementation. [grill-with-docs](skills/grill-with-docs/SKILL.md) adds persistent domain terminology and decisions. Both rely on [grilling](skills/grilling/SKILL.md), which works through the decisions in rounds.

[domain-modeling](skills/domain-modeling/SKILL.md) maintains the glossary and architecture decisions. [research](skills/research/SKILL.md) gathers primary-source evidence. [prototype](skills/prototype/SKILL.md) explores a UI or state model through a disposable implementation. When a decision needs another person's input, [to-questionnaire](skills/to-questionnaire/SKILL.md) turns it into focused questions.

### Turn decisions into executable work

[to-spec](skills/to-spec/SKILL.md) captures agreed behavior as a specification. [to-tickets](skills/to-tickets/SKILL.md) splits it into work with explicit dependencies. [wayfinder](skills/wayfinder/SKILL.md) maps larger work before committing to implementation; [triage](skills/triage/SKILL.md) processes incoming requests using the configured tracker and labels.

[setup-mvskills](skills/setup-mvskills/SKILL.md) configures the tracker, label vocabulary and domain documents using Matt's bundled procedure, then adds app-specific technology profiles, even before the apps exist.

### Implement and verify behavior

[implement](skills/implement/SKILL.md) carries out a piece of agreed work. [implement-spec](skills/implement-spec/SKILL.md) coordinates the ticket graph and integration. Both read the app profile and load the appropriate custom skills.

[tdd](skills/tdd/SKILL.md) provides the red/green/refactor loop when selected. [diagnosing-bugs](skills/diagnosing-bugs/SKILL.md) investigates failures through evidence and hypotheses. [code-review](skills/code-review/SKILL.md) checks standards and specification separately; the Standards reviewer receives the selected app's conventions.

### Keep architecture understandable

[codebase-design](skills/codebase-design/SKILL.md) provides the vocabulary for module boundaries and interfaces. [improve-codebase-architecture](skills/improve-codebase-architecture/SKILL.md) explores opportunities to improve those boundaries. Technical specializations make these general principles concrete for the chosen stack.

### Apply the NestJS profile

The three NestJS skills have distinct responsibilities:

| Skill | Responsibility | When it applies |
| --- | --- | --- |
| [nestjs-architecture](skills/nestjs-architecture/SKILL.md) | Layer boundaries, vertical slices, errors and persistence conventions | Writing, refactoring or reviewing an app adopting the custom NestJS profile |
| [nestjs-cli](skills/nestjs-cli/SKILL.md) | Scaffolding and generators through pnpm and the project-local CLI | Creating an app or generating NestJS artifacts |
| [nestjs-feature](skills/nestjs-feature/SKILL.md) | Domain, ports, entrypoint, use case, adapters, wiring and checks | Implementing a feature in that profile |

The profile selects Kysely/PostgreSQL, neverthrow, nestjs-zod, Vitest and Biome. Existing apps with other choices retain their conventions unless you request a migration. Matt's workflows govern the process; NestJS skills govern technical execution. When TDD is selected, its test-first order takes precedence over the feature checklist.

For official API facts, the skills start from the [NestJS documentation index](https://docs.nestjs.com/llms.txt); the [full documentation](https://docs.nestjs.com/llms-full.txt) is a fallback. Installed versions and supported CLI flags still need checking.
Persistence guidance also uses the [Kysely index](https://kysely.dev/llms.txt) and
[full documentation](https://kysely.dev/llms-full.txt). Kysely is a typed SQL query builder.

### Connect the full application

| Skill | Responsibility |
| --- | --- |
| [strict-typescript](skills/strict-typescript/SKILL.md) | Strict compiler checks, no authored any, validated boundaries and TypeScript scripts |
| [react-vite](skills/react-vite/SKILL.md) | React UI, typed routes/queries, Tailwind and real component tests |
| [api-contracts](skills/api-contracts/SKILL.md) | REST/OpenAPI schemas, generated client, deterministic generation and drift checks |
| [docker-coolify](skills/docker-coolify/SKILL.md) | Local PostgreSQL, production images, Compose routing and Coolify handover |

The default browser uses one origin: web on `/`, API on `/api`. Vite proxies that
prefix during development; the production web container proxies it to the API.
The backend owns the public schema; packages/api-client contains the committed
OpenAPI schema and generated TypeScript client types. Generation runs without a
database or listening server. CI checks drift and real HTTP contract behavior.

All authored app/package/test/migration/script TypeScript is checked strictly;
explicit any is a lint error and implicit any is a compiler error. Untrusted data
is parsed from unknown. Scripts prefer .ts; generated JavaScript and tool-required
configurations are separate from authored application code.

Internal app imports use `@/` as that app's `src` root, for example
`import type { InfrastructureError } from '@/shared/kernel/errors'`.
Each app owns its alias; cross-workspace imports use package names. Setup configures
TypeScript, Vite/Vitest and the backend build/runtime resolver. Compiler paths alone
do not resolve aliases in native Node. See [alias guidance](skills/strict-typescript/references/import-aliases.md).

Local .env files are created with working development values and ignored by Git;
.env.example documents them. Existing values are preserved. Frontend variables
are public and never contain backend credentials. Production secrets are configured
in Coolify rather than copied from development env files.

The default production database is a separate Coolify resource. Putting PostgreSQL
in the application Compose is an explicit alternative. The setup prepares and
checks deployment artifacts; it does not deploy to a VPS without authorization.

### Deliver, learn and continue

[pr](skills/pr/SKILL.md) writes reviewable pull request descriptions. [handoff](skills/handoff/SKILL.md) preserves context for another session. [retro](skills/retro/SKILL.md) examines what happened during a session, and [teach](skills/teach/SKILL.md) supports structured learning in the workspace.

[wizard](skills/wizard/SKILL.md) builds an interactive guide for steps a human must perform. [writing-for-agents](skills/writing-for-agents/SKILL.md) improves agent-facing instructions. [extend-mvskills](skills/extend-mvskills/SKILL.md) integrates new technology skills with setup, implementation, review and validation.

## Example: from an empty folder to a full-stack feature

1. Install the bundle and run `setup-mvskills`.
2. Choose tracking (including none), app paths, profile and whether auth is required.
3. Setup scaffolds selected components, env files, contracts and deployment artifacts.
4. Setup prepares local infrastructure explicitly and verifies apps, tests, database
   readiness and web/API communication. Missing tools/access leave specific checks pending.
5. Use `grill-with-docs`, then `to-spec` and `to-tickets` when the feature needs that planning.
6. Use `implement` or `implement-spec`. NestJS skills specialize implementation; TDD supplies test-first behavior when selected.
7. Review against both the specification and app standards, then prepare the PR.

Names above identify skills; invocation syntax depends on the agent. Hosts without a Skill tool read installed entrypoints. Hosts without parallel workers perform the stages sequentially. End-to-end behavioral verification is still pending; see validation notes below.

The generated full-stack project's startup commands separate infrastructure from apps:

```sh
pnpm infra:up
pnpm db:migrate
pnpm db:generate
pnpm api:generate
pnpm dev
```

`pnpm dev` starts app processes only. It does not start Docker, apply migrations or
generate contracts. `pnpm infra:down` preserves database volumes. `pnpm api:check`
detects contract drift. These commands are generated in target applications, not
development servers for this skill repository.

## Maintain

`skills/` is distributable source. `.agents/skills/` retains the original installed workspace copy; edit skills/. Use extend-mvskills to add specializations. See [upstream](docs/upstream.md) and [validation](docs/validation.md).

```sh
pnpm install
pnpm check
pnpm skills:list
pnpm check:install
pnpm check:typing
pnpm check:aliases
```

Installer compatibility differs from verified agent behavior. No native plugin or npm publication is required. Upstream content is MIT licensed by Matt Pocock; see LICENSE. This is an independent customized distribution.

### Record a change

Run `pnpm changeset`, select `mvskills`, choose a bump and describe the change.
`pnpm exec changeset status` previews pending releases. The local
`pnpm-workspace.yaml` keeps this repository independent of ancestor workspaces.
Changesets versions the private package without publishing it to npm.
The configuration follows Matt's setup: GitHub changelog references point to
`mattiavalerio/mvskills`, and private-package versioning and tagging are enabled.
Run `pnpm run version` to consume pending changesets and update the version and
changelog. Tags are created by a separate Changesets tag/publish step; versioning
alone does not create or push them. Plugin-version synchronization is omitted
because this distribution currently has no native plugin manifest.
