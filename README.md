# MVskills

Matt Pocock's engineering workflows plus custom technology profiles for a runnable
application: pnpm/Turborepo, NestJS with Kysely/PostgreSQL, Vite/React with TanStack
Router/Query, Tailwind and shadcn/ui, typed REST/OpenAPI clients, and Docker Compose for Coolify.
Auth and additional infrastructure are chosen only when the project needs them.

## Contents

- [Install and update](#install)
- [Skills catalog](#skills-catalog)
- [Application profile](#application-profile)
- [Example workflow](#example-from-an-empty-folder-to-a-full-stack-feature)
- [Maintenance and draft skills](#maintain)

## Install

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

## Skills catalog

The catalog covers all 36 distributable skills in `skills/`. Each skill name links to
its instructions. **What it does** describes the outcome; **How it works** describes
the procedure or rules; **When to use it** identifies the task that should trigger it.
Matt's workflows coordinate development; custom profiles define technical execution.
Use the skills relevant to the task. An ordinary edit does not need every workflow.

### Setup and extension

| Skill | What it does | How it works | When to use it |
| --- | --- | --- | --- |
| [setup-mvskills](skills/setup-mvskills/SKILL.md) | Creates or reconciles a runnable project. | Runs bundled Matt setup, selects profiles, scaffolds apps, env, contracts and deployment artifacts, then verifies them. | Starting a project or adopting MVskills in an existing repository. |
| [extend-mvskills](skills/extend-mvskills/SKILL.md) | Adds a technology specialization to the bundle. | Defines scope, creates instructions/resources, registers routing and dependencies, and validates integration. | Adding a framework, tool or technology profile. |

### Discovery and decisions

| Skill | What it does | How it works | When to use it |
| --- | --- | --- | --- |
| [grill-me](skills/grill-me/SKILL.md) | Challenges an idea until the decisions are clear. | Invokes grilling for a focused interview before implementation. | Stress-testing a plan, feature or design. |
| [grill-with-docs](skills/grill-with-docs/SKILL.md) | Clarifies a design and preserves domain decisions. | Combines grilling with domain modeling, recording terminology and significant tradeoffs. | Planning work whose terminology and decisions must survive the conversation. |
| [grilling](skills/grilling/SKILL.md) | Resolves a decision tree with the user. | Asks rounds of questions whose prerequisites are settled, recommends answers and waits for decisions. | Conducting a detailed interview or supporting another planning skill. |
| [domain-modeling](skills/domain-modeling/SKILL.md) | Maintains shared domain language and architectural decisions. | Challenges ambiguous terms, checks concrete scenarios and updates the glossary or justified ADRs. | Defining business concepts, editing a glossary or recording an architectural tradeoff. |
| [research](skills/research/SKILL.md) | Produces findings backed by primary sources. | Delegates investigation and saves a Markdown report with source citations. | Verifying documentation, APIs or facts needed for a decision. |
| [prototype](skills/prototype/SKILL.md) | Creates a disposable artifact to explore a design. | Builds a rough UI or state model for feedback; frontend prototypes retain the selected design system. | Testing how an interaction, layout or state model should behave. |
| [to-questionnaire](skills/to-questionnaire/SKILL.md) | Turns unresolved decisions into questions for another person. | Organizes the missing answers into a focused questionnaire. | Getting stakeholder input outside the live conversation. |

### Specifications and planning

| Skill | What it does | How it works | When to use it |
| --- | --- | --- | --- |
| [to-spec](skills/to-spec/SKILL.md) | Captures agreed behavior as a specification. | Synthesizes the discussion and publishes to the selected destination when authorized. | Converting settled requirements into a reviewable specification. |
| [to-tickets](skills/to-tickets/SKILL.md) | Splits a plan into implementable work. | Creates tracer-bullet tickets with explicit dependencies on the configured tracker. | Preparing a specification for implementation and coordination. |
| [wayfinder](skills/wayfinder/SKILL.md) | Maps decisions for work larger than one session. | Creates a destination and decision frontier, then resolves tickets as the remaining questions become clear. | Exploring a large effort whose route is still uncertain. |
| [triage](skills/triage/SKILL.md) | Prepares incoming issues and external PRs for development. | Categorizes, verifies and moves requests through configured triage roles, producing agent-ready briefs. | Processing a backlog or investigating incoming requests. |

### Implementation and verification

| Skill | What it does | How it works | When to use it |
| --- | --- | --- | --- |
| [implement](skills/implement/SKILL.md) | Implements agreed work and reviews the result. | Loads app-specific rules, implements the spec or tickets, validates behavior and invokes code review. | Executing a bounded piece of specified work. |
| [implement-spec](skills/implement-spec/SKILL.md) | Coordinates implementation of a complete specification. | Works through the dependency graph, integrates ticket branches and validates the combined result. | Delivering a multi-ticket specification with coordinated implementation. |
| [tdd](skills/tdd/SKILL.md) | Develops behavior through tests first. | Repeats red, green and refactor at agreed observable seams. | Implementing a feature or fix when test-first development is selected. |
| [diagnosing-bugs](skills/diagnosing-bugs/SKILL.md) | Finds the cause of a failure or regression. | Builds a reproducible feedback loop, tests hypotheses and narrows the cause with evidence. | Debugging incorrect behavior, exceptions or performance regressions. |
| [code-review](skills/code-review/SKILL.md) | Reviews standards and specification compliance separately. | Compares changes against a fixed baseline and runs both review axes with the app profile. | Reviewing a branch, PR or work in progress against requirements. |

### Architecture

| Skill | What it does | How it works | When to use it |
| --- | --- | --- | --- |
| [codebase-design](skills/codebase-design/SKILL.md) | Provides a vocabulary for useful module boundaries. | Applies deep-module, interface and seam principles to design and testability decisions. | Designing interfaces, choosing boundaries or improving testability. |
| [improve-codebase-architecture](skills/improve-codebase-architecture/SKILL.md) | Finds opportunities to improve existing module design. | Explores relevant code, presents a visual HTML report and discusses the selected opportunity. | Investigating architectural friction before choosing a refactor. |

### Backend: NestJS

| Skill | What it does | How it works | When to use it |
| --- | --- | --- | --- |
| [nestjs-architecture](skills/nestjs-architecture/SKILL.md) | Defines the NestJS backend architecture. | Applies vertical slices, domain/port/adapter boundaries, typed errors and Kysely persistence rules. | Writing, moving, refactoring or reviewing code in the selected NestJS profile. |
| [nestjs-cli](skills/nestjs-cli/SKILL.md) | Scaffolds and operates NestJS through its CLI. | Uses pnpm and supported local CLI commands, then aligns generated files with workspace conventions. | Creating apps or Nest artifacts, building, running or upgrading NestJS. |
| [nestjs-feature](skills/nestjs-feature/SKILL.md) | Implements a backend use case from framing to verification. | Connects domain, ports, entrypoints, use cases, Kysely adapters and tests; runs the validation helper. | Adding or changing an endpoint, use case, job or event handler. |

### Frontend: React

| Skill | What it does | How it works | When to use it |
| --- | --- | --- | --- |
| [react-vite](skills/react-vite/SKILL.md) | Scaffolds or reconciles the frontend application. | Configures Vite, typed routing, providers, env, API proxy, design system and initial connection tests. | Creating a frontend or changing its build, dev server or test setup. |
| [react-architecture](skills/react-architecture/SKILL.md) | Defines frontend structure, navigation and data ownership. | Uses isolated feature folders, thin file routes, validated URL state and shared TanStack Query factories. | Writing, moving, refactoring or reviewing frontend files, routes and server state. |
| [react-feature](skills/react-feature/SKILL.md) | Implements a screen or user flow against our API contract. | Frames the screen, checks endpoints, wires queries/mutations, builds UI states and runs tests and validation. | Adding or changing a page, form, interaction or frontend feature. |
| [design-system](skills/design-system/SKILL.md) | Keeps the visual identity consistent across the application. | Centralizes theme tokens and typography, manages shadcn components and checks token usage and contrast. | Styling UI, adding components, changing themes or building UI prototypes. |

### Types, API contracts and deployment

| Skill | What it does | How it works | When to use it |
| --- | --- | --- | --- |
| [strict-typescript](skills/strict-typescript/SKILL.md) | Defines rigorous typing and app-root imports. | Enforces strict compiler checks, rejects authored any, validates unknown boundaries and configures @/ resolution. | Writing or reviewing application code, tests, migrations or TypeScript scripts. |
| [api-contracts](skills/api-contracts/SKILL.md) | Maintains the public contract between our backend and frontend. | Exports OpenAPI offline, generates typed clients, checks drift and verifies HTTP response contracts. | Adding endpoints or connecting frontend/backend, including provisional contracts before backend implementation. |
| [docker-coolify](skills/docker-coolify/SKILL.md) | Prepares local infrastructure and production deployment artifacts. | Configures PostgreSQL, container builds, Compose networking, /api routing, migrations and Coolify handover. | Setting up infrastructure, containers or an authorized Coolify deployment. |

### Delivery, learning and agent instructions

| Skill | What it does | How it works | When to use it |
| --- | --- | --- | --- |
| [pr](skills/pr/SKILL.md) | Writes an evidence-based pull request description. | Uses a compact summary, before/after evidence and an assessment of reversibility and impact. | Preparing or updating a PR body. |
| [handoff](skills/handoff/SKILL.md) | Preserves context for a fresh agent session. | Writes a temporary handoff with artifact pointers, remaining work and suggested skills. | Continuing work in another session or handing it to another agent. |
| [retro](skills/retro/SKILL.md) | Identifies improvements to the agent environment. | Reviews session evidence for navigation, checks, standards and tooling problems, then ranks improvements. | Learning from a coding session or recurring agent mistakes. |
| [teach](skills/teach/SKILL.md) | Supports learning across multiple sessions. | Builds focused lessons and reference materials around a mission, tracking learning progress. | Learning a concept or practical skill in the workspace. |
| [wizard](skills/wizard/SKILL.md) | Guides a human through steps the agent cannot perform. | Generates a staged interactive Bash script for manual actions, value capture and confirmations. | Configuring dashboards, credentials or manual migration steps. |
| [writing-for-agents](skills/writing-for-agents/SKILL.md) | Makes agent-facing instructions easier to follow. | Uses precise context pointers, progressive disclosure, completion criteria and pruning. | Writing skills, agent instructions or documents agents rely on. |

## Application profile

The default full-stack profile uses pnpm/Turborepo, NestJS with Kysely/PostgreSQL,
neverthrow, nestjs-zod, Vitest and Biome; Vite/React with TanStack Router/Query,
Tailwind CSS v4 and shadcn/ui; REST/OpenAPI contracts; Docker Compose on a Coolify VPS.
Existing apps retain their conventions unless a migration is explicitly selected.
SSR/SEO requirements can select another frontend profile. Auth and extra services
are added for concrete requirements.

### Frontend conventions

`react-vite` owns scaffolding, `react-architecture` owns structure and data,
`react-feature` owns implementation, and `design-system` owns visual conventions.
The same rules reach implementers and Standards reviewers through the selected profile.
TDD supplies test-first ordering when selected.

The browser calls our backend exclusively. External API integration, credentials,
validation and response adaptation belong on the server. MSW simulates our endpoints
at the HTTP boundary in tests; normal development uses the real backend. Before the
backend exists, an agreed provisional OpenAPI contract supports typed tests or an
explicit mock preview, with live integration recorded as pending.

Theme tokens and typography apply to production UI and disposable prototypes alike.
Feature screens cover pending, empty, error and success states. Token, architecture,
type and test checks complement browser verification and a real web-to-API smoke check.

### Contracts, types, environment and hosting

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

## Example: from an empty folder to a full-stack feature

1. Install the bundle and run `setup-mvskills`.
2. Choose tracking (including none), app paths, profile and whether auth is required.
3. Setup scaffolds selected components, env files, contracts and deployment artifacts.
4. Setup prepares local infrastructure explicitly and verifies apps, tests, database
   readiness and web/API communication. Missing tools/access leave specific checks pending.
5. Use `grill-with-docs`, then `to-spec` and `to-tickets` when the feature needs that planning.
6. Use `implement` or `implement-spec`. NestJS and React skills specialize implementation; TDD supplies test-first behavior when selected.
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
pnpm check:frontend
```

Installer compatibility differs from verified agent behavior. No native plugin or npm publication is required. Upstream content is MIT licensed by Matt Pocock; see LICENSE. This is an independent customized distribution.

### Draft skills and promotion

`inprogress-skills/` holds drafts before promotion to `skills/`. Draft entrypoints carry
[`metadata.internal: true`](https://github.com/vercel-labs/skills#optional-fields),
which hides them from normal Skills CLI discovery. Drafts are validated independently;
promotion removes the internal flag in the canonical copy. Promote instructions and
resources together, then update setup routes, the dependency map, this catalog and a
changeset. After release, remove the promoted draft from `inprogress-skills/`;
keep only skills still in development there. The tables above describe canonical
skills, not unpublished drafts.

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
