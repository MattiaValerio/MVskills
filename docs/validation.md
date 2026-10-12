# Validation

Structural and installer smoke checks establish discovery/installation, not successful agent execution.

2026-10-01: pnpm check passed for 30 skill entrypoints. Installer discovery found
30 skills. Local copied installation to Codex and Claude Code succeeded in
.tmp/install-smoke; installed implementation entrypoints contain custom integration
blocks and NestJS CLI contains the official documentation pointers.

`pnpm check:install` verifies automatic creation of the destination skills-lock.json,
selected skill entries, local source metadata and hashes, preservation of existing
entries during another installation, and exact customized implementation copies for
Codex and Claude Code. GitHub-source installation awaits publication; the local test
does not claim to verify remote source metadata.

After consolidating setup there are 29 discoverable skills. Installation smoke checks
also verify the embedded Matt setup and GitHub template ship with setup-mvskills,
without installing a separate setup-matt-pocock-skills entrypoint.

Full-stack extension: 33 discoverable skills. pnpm check covers script/helper
typechecking, the explicit-any lint rule, skill frontmatter, bundled Markdown links
and dependency availability. pnpm check:typing runs red/green fixtures against the
actual compiler and linter: implicit any fails TS7006, explicit any fails noExplicitAny,
and unknown passes. pnpm check:install verifies exact installed full-stack skill
entrypoints and embedded setup resources for Codex and Claude Code.

Pending behavioral acceptance on both agents: setup in an empty folder with no
tracker and with a private tracking repo; backend-only/frontend-only profiles;
full-stack scaffold with usable env; real DB migration/codegen; offline OpenAPI
generation and negative drift check; pnpm dev app-only boot; browser→API→DB smoke;
production images and Compose routing; feature and Standards/Spec review. Also
verify preservation of an existing app with different persistence conventions and
rerunning setup without overwriting env or profile choices. These checks are
requirements in the skills, not claims that apps were generated during this change.

Alias validation: pnpm check:aliases compiles isolated strict NodeNext fixtures in
ESM and CommonJS with extensionless @/ value/type imports. Native Node fails before
tsc-alias rewriting and runs successfully afterwards. This verifies the plain tsc
production pipeline; full Nest dev/watch, Vite/Vitest and container alias acceptance
remain requirements to exercise in generated projects. Templates and annotated
NestJS examples now use app-local @/ imports.

Without a Skill tool read installed SKILL.md. Without workers/worktrees perform stages sequentially and keep review axes separate. External/browser tasks require host capabilities; report unavailable capabilities accurately.

## Frontend skill promotion (2026-10-01)

Promoted react-architecture, react-feature and design-system, and updated react-vite.
Draft entrypoints remain in inprogress-skills with metadata.internal: true. Canonical
copies have no internal flag. Draft Markdown and executable TypeScript helpers are
included in pnpm check. The Skills CLI lists 36 canonical skills; listing the draft
source returns no skills (the CLI exits 1 for an empty source, an expected result).
See [Skills CLI internal metadata](https://github.com/vercel-labs/skills#optional-fields).

Validation performed locally on Windows:

- pnpm check: strict compiler, noExplicitAny lint, entrypoints, references and dependency map.
- pnpm check:frontend: semantic token acceptance; mixed token/numeric styling,
  dynamic and indirect styling, palette utilities, arbitrary typography and CSS
  literals rejected. This is a conservative lexical checker, not a CSS/TS parser;
  it does not prove visual consistency, token existence or contrast.
- pnpm check:install: additive installation and lock hashes for Codex/Claude Code,
  including all new frontend skills and bundled assets/helpers.
- Isolated .tmp/frontend-template fixture: typography and API-client examples
  compile under strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes with
  React 19.3.0, @types/react 19.3.0, openapi-fetch 0.17.0 and Zod 4.6.5.
  Actual wrapper execution passes JSON success, bodyless success, missing JSON body
  and typed HTTP errors. No assertion is used to invent a successful body.
- dependency-cruiser 18.4.0 with TypeScript 5.9.3: fixture accepts legitimate
  feature API imports via @/, analyses 14 modules, and fails an introduced
  cross-feature import with features-are-isolated. Compiler support must be checked
  against the target application's actual TypeScript version.

A complete generated frontend has not been exercised in a browser in this change.
Router pending timing, MSW screen/mutation tests, production styling/contrast and
live web-to-backend communication remain application acceptance checks. Package
checks and the isolated fixtures do not establish those outcomes.

## Matt Pocock upstream import (2026-10-12)

Imported the changes recorded in [upstream](upstream.md), preserving the 37-skill
catalog and historical installed copies/lockfiles. Validation passed on Windows:

- pnpm check: strict typechecking, lint, all 37 entrypoints, references and dependencies.
- pnpm skills:list: discovers all 37 canonical skills.
- pnpm check:install: existing additive installation and lockfile smoke checks.
- A separate clean installation of the 11 updated imported workflows plus ask-mv
  to Codex/Claude Code: all 76 bundled file copies match the source bytes, including
  the revised wizard template and embedded setup resources; exactly those 12 skills
  appear in the fixture lockfile.
- Git Bash bash -n on wizard/template.sh, plus isolated library execution: env
  values with spaces, quotes, dollars, command-substitution text, backslashes and
  empty values round-trip without interpolation; upserts retain unrelated entries
  and avoid duplicate keys; Enter retains visible/secret defaults; EOF fails both
  value prompts; a missing env file is created successfully.
- All 25 original skill file inventories and normalized contents match the pinned
  initial upstream baseline. Historical originals/lockfiles remain unchanged.
- git diff --check: no whitespace errors.

No real tracker labels, issues, PRs or CI secrets were created by these checks.
Live tracker commands, wizard browser interaction, POSIX symlink/permission behavior
and end-to-end agent execution of the revised workflows remain unverified.

## Custom workflow alignment after 1.3.1 (2026-10-12)

The [custom integration audit](upstream.md#custom-integration-audit-after-131-2026-10-12)
covers all 13 custom skills, their relevant references/templates and the imported
coordinators. Two independent read-only reviews traced standards and requirements
separately, including direct feature tickets, coordinator-owned TDD, diagnosis
handoff, disabled/separate/local trackers, manual deployment and existing-stack
preservation. They found missing selective-install fallbacks, inconsistent local
claims and an unspecified shell-to-dotenv export boundary; all three were corrected
and re-reviewed without remaining material findings.

These were static workflow reviews, not executions of generated applications or
live tracker/deployment operations. In particular, the consumer-specific env exporter
is a procedure for a future generated wizard, not an implemented universal serializer;
its actual-loader round-trip test remains a completion criterion for that task.

Local checks: pnpm check and check:typing passed; discovery found 37 entrypoints.
check:install now installs every canonical skill additively and compares every
entrypoint, reference, asset and helper byte-for-byte in both Codex and Claude Code
destinations, while checking exact lockfile membership and preservation of existing
entries. This closes the prior installer smoke test's partial custom-skill coverage.
The original installed snapshot and lockfiles remain historical and unchanged.
