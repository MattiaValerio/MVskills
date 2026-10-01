# MVskills

Matt Pocock's engineering workflows plus custom technology profiles. Initial backend: NestJS, vertical slices, Kysely, neverthrow, nestjs-zod, Vitest, Biome and pnpm. Frontend and Docker come next.

## Install

After publishing this repository on GitHub:

```sh
pnpm dlx skills@latest add mattiavalerio/mvskills
```

Select skills and agent targets. Use `--all` for all skills and installer-supported agents. For a local checkout replace the source with its absolute path. Avoid installing Matt's bundle alongside this one: names overlap. Selective installation does not automatically resolve [dependencies](skills/dependencies.json).

Run `setup-mvskills` in your target project using your agent's invocation syntax. Empty folders get planned profiles; rerun after scaffolding to verify apps. Matt's setup configures issue tracking/domain documents; custom setup configures technology routing. Request scaffolding or feature implementation afterwards.

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

[setup-matt-pocock-skills](skills/setup-matt-pocock-skills/SKILL.md) configures that tracker, label vocabulary and domain documents. [setup-mvskills](skills/setup-mvskills/SKILL.md) adds app-specific technology profiles, even before the apps exist.

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

### Deliver, learn and continue

[pr](skills/pr/SKILL.md) writes reviewable pull request descriptions. [handoff](skills/handoff/SKILL.md) preserves context for another session. [retro](skills/retro/SKILL.md) examines what happened during a session, and [teach](skills/teach/SKILL.md) supports structured learning in the workspace.

[wizard](skills/wizard/SKILL.md) builds an interactive guide for steps a human must perform. [writing-for-agents](skills/writing-for-agents/SKILL.md) improves agent-facing instructions. [extend-mvskills](skills/extend-mvskills/SKILL.md) integrates new technology skills with setup, implementation, review and validation.

## Example: from an empty folder to a backend feature

1. Install the bundle and run `setup-mvskills`.
2. Choose app paths and the NestJS profile; it is recorded as planned.
3. Request scaffolding. The agent follows `nestjs-cli` and the selected architecture.
4. Rerun setup to reconcile the generated app and record passing checks.
5. Use `grill-with-docs`, then `to-spec` and `to-tickets` when the feature needs that planning.
6. Use `implement` or `implement-spec`. NestJS skills specialize implementation; TDD supplies test-first behavior when selected.
7. Review against both the specification and app standards, then prepare the PR.

Names above identify skills; invocation syntax depends on the agent. Hosts without a Skill tool read installed entrypoints. Hosts without parallel workers perform the stages sequentially. End-to-end behavioral verification is still pending; see validation notes below.

## Maintain

`skills/` is distributable source. `.agents/skills/` retains the original installed workspace copy; edit skills/. Use extend-mvskills to add specializations. See [upstream](docs/upstream.md) and [validation](docs/validation.md).

```sh
pnpm install
pnpm check
pnpm skills:list
pnpm check:install
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
